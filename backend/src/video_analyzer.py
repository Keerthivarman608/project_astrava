"""
Video Analysis Module for AI Content Detection
Automatically analyzes videos for AI-generated content patterns
"""

import cv2
import numpy as np
import librosa
import os
import tempfile
from skimage.metrics import structural_similarity as ssim
from sklearn.ensemble import RandomForestClassifier
from PIL import Image
import moviepy.editor as mp
from typing import Dict, Tuple, List
import json
from scipy import stats, signal, fft
from scipy.spatial import distance

class VideoAIAnalyzer:
    """
    Analyzes videos for AI-generated content patterns using multiple signals:
    - Facial analysis (for deepfakes)
    - Audio analysis (for synthetic voice)
    - Temporal consistency (for frame artifacts)
    - Metadata analysis (for generation patterns)
    """
    
    def __init__(self):
        self.model = None
        self.thresholds = {
            'face_consistency': 0.75,
            'audio_naturalness': 0.70,
            'frame_artifact': 0.55,
            'temporal_coherence': 0.75
        }
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
    def extract_frames(self, video_path: str, num_frames: int = 25) -> List[np.ndarray]:
        """Extract frames from video OR load image for analysis - Optimized for Speed"""
        ext = os.path.splitext(video_path)[1].lower()
        if ext in ['.jpg', '.jpeg', '.png', '.webp', '.bmp']:
            img = cv2.imread(video_path)
            if img is not None:
                # Resize for speed
                h, w = img.shape[:2]
                if max(h, w) > 640:
                    scale = 640 / max(h, w)
                    img = cv2.resize(img, (0, 0), fx=scale, fy=scale)
            return [img] if img is not None else []

        frames = []
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return []
            
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            cap.release()
            return []
            
        # Sample frames evenly - Reduced num_frames for speed
        indices = np.linspace(0, total_frames-1, num_frames, dtype=int)
        
        for idx in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if ret:
                # Resize frames immediately for faster processing downstream
                h, w = frame.shape[:2]
                if max(h, w) > 480:
                    scale = 480 / max(h, w)
                    frame = cv2.resize(frame, (0, 0), fx=scale, fy=scale)
                frames.append(frame)
        
        cap.release()
        return frames

    def get_audio_features(self, video_path: str) -> Dict[str, float]:
        """Cached audio analysis to avoid redundant extractions"""
        if hasattr(self, '_audio_cache') and self._audio_cache.get('path') == video_path:
            return self._audio_cache['features']
        
        features = self.analyze_audio(video_path)
        self._audio_cache = {'path': video_path, 'features': features}
        return features

    def analyze_video(self, video_path: str) -> Dict[str, float]:
        """
        Complete video analysis returning AI probability scores.
        Optimized with ThreadPoolExecutor for parallel signal processing.
        """
        import concurrent.futures
        print(f"\n🔍 Optimized Analysis for: {video_path}")
        
        # 1. Extract frames (Sequential but fast)
        frames = self.extract_frames(video_path)
        
        if len(frames) == 0:
            return {
                'ai_probability': 50,
                'confidence': 30,
                'signals': ['No visual data found for analysis']
            }
        
        # 2. Parallelize all independent analyses
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
            # Kick off all analysis tasks
            fut_facial = executor.submit(self.analyze_facial_consistency, frames)
            fut_audio = executor.submit(self.get_audio_features, video_path)
            fut_artifacts = executor.submit(self.detect_frame_artifacts, frames)
            fut_temporal = executor.submit(self.analyze_temporal_coherence, frames)
            fut_dct = executor.submit(self.analyze_dct_distribution, frames)
            fut_symmetry = executor.submit(self.analyze_expression_symmetry, frames)
            fut_watermark = executor.submit(self.detect_hidden_watermark, frames)
            # Lip sync is dependent on audio, but we use the cached version if called via analyze_lip_sync(video_path, frames)
            # which might call analyze_audio again. Let's make lip_sync also separate.
            fut_lipsync = executor.submit(self.analyze_lip_sync, video_path, frames)

            # Gather results
            facial_score = fut_facial.result()
            audio_features = fut_audio.result()
            artifact_score = fut_artifacts.result()
            temporal_score = fut_temporal.result()
            dct_violation = fut_dct.result()
            symmetry_score = fut_symmetry.result()
            watermark_score = fut_watermark.result()
            lip_sync_score = fut_lipsync.result()
        
        # Calculate individual signal scores (0-100 where higher = more AI-like)
        signals = {
            'facial_anomaly': max(0, min(100, (1 - facial_score) * 100)),
            'audio_synthetic': max(0, min(100, (1 - audio_features['naturalness']) * 100)),
            'visual_artifacts': max(0, min(100, artifact_score * 100)),
            'dct_frequency_anomaly': max(0, min(100, dct_violation * 100)),
            'temporal_incoherence': max(0, min(100, (1 - temporal_score) * 100)),
            'expression_asymmetry': max(0, min(100, (1 - symmetry_score) * 100)),
            'lip_sync_mismatch': max(0, min(100, (1 - lip_sync_score) * 100)),
            'hidden_watermark': max(0, min(100, watermark_score * 100))
        }
        
        # Weighted combination for final score
        weights = {
            'facial_anomaly': 0.18,
            'audio_synthetic': 0.18,
            'dct_frequency_anomaly': 0.15,
            'visual_artifacts': 0.12,
            'temporal_incoherence': 0.12,
            'expression_asymmetry': 0.08,
            'lip_sync_mismatch': 0.1,
            'hidden_watermark': 0.07
        }
        
        ai_probability = sum(signals[k] * weights[k] for k in weights)
        
        # Calculate confidence based on signal consistency
        signal_values = list(signals.values())
        signal_std = np.std(signal_values)
        confidence = max(30, min(95, 100 - signal_std))
        
        # Determine deepfake risk level
        if ai_probability >= 75:
            deepfake_risk = 'High'
        elif ai_probability >= 50:
            deepfake_risk = 'Medium'
        else:
            deepfake_risk = 'Low'
        
        result = {
            'ai_probability': round(ai_probability, 1),
            'confidence': round(confidence, 1),
            'deepfake_risk': deepfake_risk,
            'amplification_score': round(ai_probability * 0.8, 1),
            'bot_score': round(ai_probability * 0.7, 1),
            'signals': signals,
            'triggered_patterns': self.get_triggered_patterns(signals)
        }
        
        print(f"✅ Analysis complete: {result['ai_probability']}% AI probability")
        return result
    
    def get_triggered_patterns(self, signals: Dict[str, float]) -> List[str]:
        """Get human-readable descriptions of triggered patterns"""
        patterns = []
        
        if signals['facial_anomaly'] > 60:
            patterns.append("Facial inconsistency detected (common in deepfakes)")
        if signals['audio_synthetic'] > 60:
            patterns.append("Synthetic voice patterns detected")
        if signals['visual_artifacts'] > 60:
            patterns.append("AI generation artifacts visible in frames")
        if signals['temporal_incoherence'] > 60:
            patterns.append("Unnatural motion between frames")
        if signals.get('expression_asymmetry', 0) > 60:
            patterns.append("Asymmetric facial expressions detected")
        if signals.get('lip_sync_mismatch', 0) > 60:
            patterns.append("Lip-sync discrepancy between audio and video")
        if signals.get('hidden_watermark', 0) > 60:
            patterns.append("Frequency patterns matching AI watermarks found")
        
        return patterns

# Singleton instance
video_analyzer = VideoAIAnalyzer()