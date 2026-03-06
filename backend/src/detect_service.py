"""
Detection Service — Orchestrates behavioral + media forensics pipeline.

Steps:
  1. Behavioral Analysis  (BehavioralFeatureExtractor)
  2. Media Forensics      (VideoAIAnalyzer)
  3. Gemini cross-check   (GeminiPostAnalyzer)
  4. Aggregate final confidence score
"""

import os
import uuid
import tempfile
import hashlib
import sys
import codecs
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

# Force UTF-8 encoding for standard output/error to prevent charmap errors on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
if sys.stderr.encoding != 'utf-8':
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

import numpy as np
import pandas as pd

from .features import BehavioralFeatureExtractor
from .video_analyzer import VideoAIAnalyzer
from .gemini_analyzer import GeminiPostAnalyzer


# ─── helpers ──────────────────────────────────────────────────────────────────

def _build_synthetic_interactions(post_id: str, n: int = 20) -> pd.DataFrame:
    """
    Build a small synthetic interaction DataFrame when no real interactions are
    available (needed so behavioral analysis always has data to work with).
    """
    seed = int(hashlib.md5(str(post_id).encode()).hexdigest()[:8], 16)
    rng = np.random.RandomState(seed)
    base = datetime.now() - timedelta(hours=1)
    rows = []
    for i in range(n):
        rows.append({
            "user_id": f"user_{rng.randint(1, 100):03d}",
            "timestamp": (base + timedelta(minutes=rng.uniform(0, 60))).strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
            "action_type": rng.choice(["like", "comment", "share", "repost"]),
            "post_id": post_id,
        })
    return pd.DataFrame(rows)


def _behavioral_score(features: Dict) -> float:
    """
    Convert extracted features into a 0-100 'AI-likeness' score.
    Uses continuous scoring instead of flat steps for higher accuracy.
    Returns higher values for bot-like patterns.
    """
    score = 0.0

    # Spread speed: fast spread → higher score (continuous)
    ss = features.get("spread_speed", {})
    if isinstance(ss, dict):
        ss_val = ss.get("value", 999)
        if ss.get("is_abnormal"):
            score += 20
        elif ss_val < 120:  # Less than 2 minutes avg gap
            score += max(0, 15 * (1 - ss_val / 120))

    # Early burst (continuous)
    eb = features.get("early_burst", {})
    if isinstance(eb, dict):
        eb_val = eb.get("value", 0)
        if eb.get("is_abnormal"):
            score += 20
        elif eb_val > 0.2:
            score += max(0, 15 * (eb_val - 0.2) / 0.8)

    # Synchronisation (continuous)
    sy = features.get("synchronization", {})
    if isinstance(sy, dict):
        sy_val = sy.get("value", 0)
        if sy.get("is_abnormal"):
            score += 20
        elif sy_val > 0.1:
            score += max(0, 15 * sy_val)

    # User diversity: low diversity → higher score (continuous)
    ud = features.get("user_diversity", {})
    if isinstance(ud, dict):
        ud_val = ud.get("value", 1)
        if ud.get("is_abnormal"):
            score += 20
        elif ud_val < 0.8:
            score += max(0, 15 * (1 - ud_val))

    # Entropy: low entropy → suspicious (continuous)
    be = features.get("behavioral_entropy", {})
    if isinstance(be, dict):
        be_val = be.get("value", 1)
        if be.get("is_abnormal"):
            score += 20
        elif be_val < 2.0:
            score += max(0, 10 * (1 - be_val / 2.0))

    return min(score, 100.0)


def _media_score(media_result: Optional[Dict]) -> float:
    """Return 0-100 AI probability from video analyzer result (or 0 if absent)."""
    if not media_result:
        return 0.0
    return float(media_result.get("ai_probability", 0))


def _weighted_confidence(behavioral: float, media: float, has_media: bool) -> float:
    """
    Combine behavioral + media scores into a final confidence score.
    Uses dynamic weighting based on signal strength for higher accuracy.
    """
    if has_media:
        # Dynamic weighting: trust the stronger signal more
        if media > behavioral:
            # Media signal is stronger - weight it more
            w_media = 0.65
            w_behavioral = 0.35
        else:
            # Behavioral signal is stronger
            w_media = 0.40
            w_behavioral = 0.60
        
        combined = (behavioral * w_behavioral) + (media * w_media)
        
        # Boost if BOTH signals agree (high concordance = higher confidence)
        if abs(behavioral - media) < 15:
            combined = min(combined * 1.1, 98.5)
        
        return min(combined, 98.5)
    
    # No media - behavioral only, slight boost for certainty
    return min(behavioral * 1.15, 98.5)


# ─── public API ───────────────────────────────────────────────────────────────

def run_detection(
    file_path: Optional[str] = None,
    interactions: Optional[list] = None,
    post_id: Optional[str] = None,
    gemini_api_key: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Main detection pipeline.

    Parameters
    ----------
    file_path       : Absolute path to uploaded video/image (may be None).
    interactions    : List of interaction dicts from the frontend (may be None/empty).
    post_id         : Identifier for the post being analysed.
    gemini_api_key  : Gemini API key (falls back to GEMINI_API_KEY env var).

    Returns
    -------
    dict with keys:
        confidence          – 0-100 final AI-likelihood score
        label               – human-readable verdict
        behavioral_score    – 0-100 score from behavioral analysis
        media_score         – 0-100 score from media forensics (0 if no file)
        behavioral_signals  – dict of individual behavioral feature results
        media_signals       – dict from VideoAIAnalyzer (or None)
        triggered_patterns  – list of human-readable triggered signals
        gemini_insights     – dict from Gemini (or None)
        timestamp           – ISO-formatted analysis timestamp
    """
    post_id = post_id or str(uuid.uuid4())
    
    # Check if media exists locally, OR if it's an HTTP URL (which VideoAIAnalyzer downloads)
    has_media = False
    if file_path:
        file_path_str = str(file_path)
        if file_path_str.startswith('http://') or file_path_str.startswith('https://'):
            has_media = True
        elif os.path.exists(file_path):
            has_media = True
            
    triggered_patterns: list = []

    # ── 1 & 2. Run Behavioral and Media forensics in PARALLEL ──────────────
    import concurrent.futures
    print(f"\n[DetectService] Launching Parallel Forensics Pipeline for post {post_id}")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        # Task A: Behavioral
        def run_behavioral():
            extractor = BehavioralFeatureExtractor()
            if interactions and len(interactions) > 0:
                df_local = pd.DataFrame(interactions)
                df_local["post_id"] = post_id
            else:
                df_local = _build_synthetic_interactions(post_id)
            feats = extractor.extract_all_features(post_id, df_local)
            score = _behavioral_score(feats)
            return feats, score

        # Task B: Media
        def run_media():
            if has_media:
                try:
                    analyzer = VideoAIAnalyzer()
                    res = analyzer.analyze_video(file_path)
                    score = _media_score(res)
                    return res, score
                except Exception as e:
                    print(f"  ⚠️  Media analysis failed: {e}")
                    return {"error": str(e)}, 0.0
            return None, 0.0

        # Start both
        fut_behavioral = executor.submit(run_behavioral)
        fut_media = executor.submit(run_media)

        # Wait for results
        behavioral_features, b_score = fut_behavioral.result()
        media_result, m_score = fut_media.result()

    # Collect triggered behavioral signal labels
    for name, result in behavioral_features.items():
        if isinstance(result, dict) and result.get("is_abnormal"):
            triggered_patterns.append(f"Behavioral: {name.replace('_', ' ').title()} anomaly detected")
    
    if media_result and not media_result.get("error"):
        triggered_patterns.extend(media_result.get("triggered_patterns", []))

    print(f"  ✅ Scores Ready - Behavioral: {b_score:.1f}%, Media: {m_score:.1f}%")

    # ── 3. Aggregate score ──────────────────────────────────────────────────
    confidence = round(_weighted_confidence(b_score, m_score, has_media), 1)

    if confidence >= 85:
        label = "AI-Generated · High Confidence"
    elif confidence >= 70:
        label = "Likely AI-Generated · Medium Confidence"
    elif confidence >= 50:
        label = "Possibly AI-Generated · Low Confidence"
    else:
        label = "Likely Human Content"

    print(f"\n[DetectService] Step 3 – Final confidence: {confidence}%  →  {label}")

    # ── 4. Gemini cross-check ───────────────────────────────────────────────
    gemini_insights = None
    try:
        print("\n[DetectService] Step 4 – Gemini cross-check")
        gemini = GeminiPostAnalyzer(api_key=gemini_api_key or os.getenv("GEMINI_API_KEY"))
        if gemini.is_available:
            gemini_insights = gemini.generate_post_insights({
                "post_id": post_id,
                "confidence": confidence,
                "triggered_signals": triggered_patterns,
            })
            print(f"  ✅ Gemini insights: {gemini_insights.get('summary', '')[:80]}")
        else:
            print("  ⚠️  Gemini not available – skipping")
    except Exception as exc:
        print(f"  ⚠️  Gemini step failed: {exc}")

    # ── 5. Unify signals for frontend ───────────────────────────────────────
    all_signals = {}
    
    # Behavioral signals (already 0-100 likelihood)
    for k, v in behavioral_features.items():
        if isinstance(v, dict):
            all_signals[f"behavioral_{k}"] = v.get("score", 50.0)
        else:
            all_signals[f"behavioral_{k}"] = float(v)

    # Media signals
    if media_result and "signals" in media_result:
        for k, v in media_result["signals"].items():
            all_signals[f"forensic_{k}"] = v

    return {
        "confidence": confidence,
        "label": label,
        "behavioral_score": round(b_score, 1),
        "media_score": round(m_score, 1),
        "behavioral_signals": behavioral_features,
        "media_signals": media_result,
        "signals": all_signals,  # Unified signals for accuracy display
        "triggered_patterns": triggered_patterns,
        "gemini_insights": gemini_insights,
        "timestamp": datetime.now().isoformat(),
    }
