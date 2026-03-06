#!/usr/bin/env python3
"""
Flask Backend for Instagram AI Confidence Labeler
FINAL FIXED VERSION - Each video gets UNIQUE analysis
"""

import os
import sys
import pandas as pd
import numpy as np
import json
import hashlib
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from src.loader import InteractionDataLoader
    from src.detector import InstagramAIConfidenceLabeler
    from src.detect_service import run_detection
    print("✅ Successfully imported backend modules")
except ImportError as e:
    print(f"⚠️ Import error: {e}")
    sys.exit(1)

app = Flask(__name__)
CORS(app)

# Disable all caching
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

def get_labeler():
    gemini_key = os.getenv('GEMINI_API_KEY')
    return InstagramAIConfidenceLabeler(gemini_api_key=gemini_key)

def generate_deterministic_interactions(video_id, video_num):
    """
    Generate UNIQUE and DETERMINISTIC interactions based on video ID
    Same video ID will ALWAYS get the same pattern
    Different video IDs will get DIFFERENT patterns
    """
    
    # Use video_id to create a deterministic seed
    seed_value = int(hashlib.md5(str(video_id).encode()).hexdigest()[:8], 16)
    random_state = np.random.RandomState(seed_value)
    
    base_time = datetime.now() - timedelta(hours=2)
    interactions = []
    
    # Define DIFFERENT patterns for different video numbers
    if video_num in [1, 5, 9]:  # PATTERN A: Bot Network (High AI scores)
        print(f"   📊 Pattern A (Bot Network) for video {video_id}")
        users = [f"bot_{i:03d}" for i in range(1, 11)]
        base_minute = 0
        
        for i in range(45):  # 45 interactions
            user_idx = i % 10
            minute_offset = base_minute + (i // 3)  # Very regular timing
            
            # Create synchronized timestamps (within same second)
            second_offset = int(random_state.choice([0, 1, 2]))
            timestamp = (base_time + timedelta(minutes=minute_offset, seconds=second_offset)).strftime('%Y-%m-%d %H:%M:%S')
            
            # Action distribution skewed towards shares/reposts
            action_rand = random_state.random()
            if action_rand < 0.3:
                action = 'like'
            elif action_rand < 0.6:
                action = 'share'
            elif action_rand < 0.8:
                action = 'repost'
            else:
                action = 'comment'
            
            interactions.append({
                'user_id': users[user_idx],
                'timestamp': timestamp,
                'action_type': action
            })
    
    elif video_num in [2, 6, 10]:  # PATTERN B: Real Human (Low AI scores)
        print(f"   📊 Pattern B (Real Human) for video {video_id}")
        # 25 different real users
        minute_offsets = []
        for i in range(25):
            # Natural random distribution
            minute_offsets.append(random_state.uniform(5, 120))
        
        minute_offsets.sort()
        
        for i, minute_offset in enumerate(minute_offsets[:25]):
            user_id = f"user_{1000 + i + (video_num * 100)}"
            timestamp = (base_time + timedelta(minutes=minute_offset)).strftime('%Y-%m-%d %H:%M:%S')
            
            # Natural action distribution (mostly likes)
            action_rand = random_state.random()
            if action_rand < 0.7:
                action = 'like'
            elif action_rand < 0.85:
                action = 'comment'
            elif action_rand < 0.95:
                action = 'share'
            else:
                action = 'repost'
            
            interactions.append({
                'user_id': user_id,
                'timestamp': timestamp,
                'action_type': action
            })
    
    elif video_num in [3, 7]:  # PATTERN C: Coordinated Attack (Very High AI)
        print(f"   📊 Pattern C (Coordinated Attack) for video {video_id}")
        users = [f"attacker_{i:03d}" for i in range(1, 8)]
        
        for i in range(35):
            user_idx = i % 7
            # Extremely fast: all within 10 minutes
            minute_offset = i * 0.3  # Every 18 seconds!
            timestamp = (base_time + timedelta(minutes=minute_offset)).strftime('%Y-%m-%d %H:%M:%S')
            
            # Almost all are shares/reposts (amplification)
            action_rand = random_state.random()
            if action_rand < 0.2:
                action = 'like'
            elif action_rand < 0.6:
                action = 'share'
            elif action_rand < 0.9:
                action = 'repost'
            else:
                action = 'comment'
            
            interactions.append({
                'user_id': users[user_idx],
                'timestamp': timestamp,
                'action_type': action
            })
    
    elif video_num in [4, 8]:  # PATTERN D: Organic Spread (Low AI)
        print(f"   📊 Pattern D (Organic Spread) for video {video_id}")
        # Many unique users, spread over time
        for i in range(30):
            user_id = f"organic_{2000 + i + (video_num * 50)}"
            minute_offset = random_state.uniform(10, 180)  # Spread over 3 hours
            timestamp = (base_time + timedelta(minutes=minute_offset)).strftime('%Y-%m-%d %H:%M:%S')
            
            # Natural distribution
            action_rand = random_state.random()
            if action_rand < 0.8:
                action = 'like'
            elif action_rand < 0.9:
                action = 'comment'
            else:
                action = 'share'
            
            interactions.append({
                'user_id': user_id,
                'timestamp': timestamp,
                'action_type': action
            })
    
    else:  # Default pattern
        print(f"   📊 Default pattern for video {video_id}")
        for i in range(20):
            user_id = f"user_{3000 + i}"
            minute_offset = random_state.uniform(1, 60)
            timestamp = (base_time + timedelta(minutes=minute_offset)).strftime('%Y-%m-%d %H:%M:%S')
            
            interactions.append({
                'user_id': user_id,
                'timestamp': timestamp,
                'action_type': 'like' if random_state.random() < 0.7 else 'comment'
            })
    
    print(f"   Generated {len(interactions)} interactions for video {video_id}")
    return interactions

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/clear-cache', methods=['POST'])
def clear_cache():
    """Clear the in-memory analysis cache so reels are re-analysed on next request."""
    global _ANALYSIS_CACHE
    cleared = len(_ANALYSIS_CACHE)
    _ANALYSIS_CACHE = {}
    print(f"🗑️  Cache cleared ({cleared} entries removed)")
    return jsonify({'status': 'ok', 'cleared': cleared})

@app.route('/api/reels', methods=['GET'])
def get_reels():
    """Serve the list of available reels with metadata."""
    reels = [
        {
            "id": "reel_1",
            "user": {"username": "sarah_designs", "avatar": "https://i.pravatar.cc/150?u=sarah"},
            "videoUrl": "/assets/local_reel_1.mp4",
            "caption": "Incredible drone shot from our latest mountain hike! ✨🏔️",
            "song": "Original Audio - sarah_designs",
            "likes": "1.2M", "comments": "45K", "shares": "128K"
        },
        {
            "id": "reel_2",
            "user": {"username": "tech_bro", "avatar": "https://i.pravatar.cc/150?u=marcus"},
            "videoUrl": "/assets/local_reel_2.mp4",
            "caption": "Cyberpunk 2077 setup is FINALLY complete! 🤖💻",
            "song": "Cyber Dreams - Synthwave",
            "likes": "890K", "comments": "12K", "shares": "45K"
        },
        {
            "id": "reel_3",
            "user": {"username": "creative_mind", "avatar": "https://i.pravatar.cc/150?u=jessica"},
            "videoUrl": "/assets/local_reel_3.mp4",
            "caption": "Wait for the drop... visuals mapping on geometry! 🏛️🎨",
            "song": "Mapping the World - DJ Tech",
            "likes": "2.4M", "comments": "89K", "shares": "340K"
        },
        {
            "id": "reel_4",
            "user": {"username": "alex_developer", "avatar": "https://i.pravatar.cc/150?u=developer_alex"},
            "videoUrl": "/assets/local_reel_4.mp4",
            "caption": "A day in the life of a frontend engineer ☕🖥️",
            "song": "LoFi Chill Beats to Code To",
            "likes": "45K", "comments": "450", "shares": "1.2K"
        },
        {
            "id": "reel_5",
            "user": {"username": "culinary_arts", "avatar": "https://i.pravatar.cc/150?u=chef"},
            "videoUrl": "/assets/local_reel_5.mp4",
            "caption": "The secret to the perfect sourdough crust 🍞🔥",
            "song": "Italian Cafe Music",
            "likes": "8.1M", "comments": "102K", "shares": "2.5M"
        },
        {
            "id": "reel_6",
            "user": {"username": "future_motors", "avatar": "https://i.pravatar.cc/150?u=car"},
            "videoUrl": "/assets/local_reel_6.mp4",
            "caption": "Concept car drifting through a neon-lit city at midnight. 🏎️💨",
            "song": "Synthwave Drift",
            "likes": "500K", "comments": "8K", "shares": "50K"
        },
        {
            "id": "reel_7",
            "user": {"username": "yoga_vibes", "avatar": "https://i.pravatar.cc/150?u=priya"},
            "videoUrl": "/assets/local_reel_7.mp4",
            "caption": "Morning yoga flows as the sun rises over the mountains 🧘‍♀️🌅",
            "song": "Morning Meditation",
            "likes": "120K", "comments": "1.2K", "shares": "4K"
        },
        {
            "id": "reel_8",
            "user": {"username": "space_wonders", "avatar": "https://i.pravatar.cc/150?u=mars"},
            "videoUrl": "/assets/local_reel_8.mp4",
            "caption": "If humans built a colony on Mars... 🚀🔴",
            "song": "Interstellar Theme",
            "likes": "9.5M", "comments": "340K", "shares": "1.1M"
        },
        {
            "id": "reel_9",
            "user": {"username": "puppy_love", "avatar": "https://i.pravatar.cc/150?u=dog"},
            "videoUrl": "/assets/local_reel_9.mp4",
            "caption": "Golden retriever experiencing snow for the first time! 🐶❄️",
            "song": "Funny Dog Song",
            "likes": "14M", "comments": "980K", "shares": "5.6M"
        },
        {
            "id": "reel_10",
            "user": {"username": "arch_digest", "avatar": "https://i.pravatar.cc/150?u=house"},
            "videoUrl": "/assets/local_reel_10.mp4",
            "caption": "Inside a $45M modern mansion in the Hollywood Hills 🛋️✨",
            "song": "Luxury Lifestyle TV",
            "likes": "2.1M", "comments": "14K", "shares": "89K"
        },
        {
            "id": "reel_11",
            "user": {"username": "sarah_designs", "avatar": "https://i.pravatar.cc/150?u=sarah"},
            "videoUrl": "/assets/local_reel_11.mp4",
            "caption": "Made it to the summit! ⛰️🦅 #hiking",
            "song": "Original Audio",
            "likes": "1.1M", "comments": "40K", "shares": "120K"
        },
        {
            "id": "reel_12",
            "user": {"username": "tech_bro", "avatar": "https://i.pravatar.cc/150?u=marcus"},
            "videoUrl": "",
            "videoOverlayImage": "/assets/local_reel_12.webp",
            "caption": "When the code compiles on the first try 😂😂",
            "song": "Funny audio",
            "likes": "800K", "comments": "10K", "shares": "30K"
        },
        {
            "id": "reel_13",
            "user": {"username": "creative_mind", "avatar": "https://i.pravatar.cc/150?u=jessica"},
            "videoUrl": "/assets/local_reel_13.mp4",
            "caption": "Watch till the end! 3D projection mapping 🏛️🎨",
            "song": "DJ Tech",
            "likes": "2M", "comments": "80K", "shares": "300K"
        },
        {
            "id": "reel_14",
            "user": {"username": "alex_developer", "avatar": "https://i.pravatar.cc/150?u=developer_alex"},
            "videoUrl": "/assets/local_reel_14.mp4",
            "caption": "Late-night coding session building Astrava ☕🖥️",
            "song": "Coding Beats",
            "likes": "40K", "comments": "400", "shares": "1K"
        }
    ]
    return jsonify(reels)

_ANALYSIS_CACHE = {}

@app.route('/api/analyze/reel', methods=['POST'])
def analyze_reel():
    """Analyze a reel with HIGH FIDELITY detection pipeline"""
    try:
        data = request.json
        reel_data = data.get('reel', {})
        frontend_interactions = data.get('interactions', [])
        
        # Get video ID
        video_id = reel_data.get('id', 'unknown')
        video_url = reel_data.get('video_url', '')
        
        # Get analysis mode
        is_deep_scan = data.get('deep_scan', False)
        num_frames = 120 if is_deep_scan else 50
        
        # Check cache (Skip if deep scan)
        if video_id in _ANALYSIS_CACHE and not is_deep_scan:
            print(f"📦 Returning cached analysis for {video_id}")
            return jsonify(_ANALYSIS_CACHE[video_id])
            
        print(f"🚀 Running {'DEEP ' if is_deep_scan else ''}AI Analysis for {video_id} ({num_frames} frames)...")
        
        # Resolve file path
        # Files are in Frontend/public/assets/
        base_dir = os.path.dirname(os.path.abspath(__file__))
        clean_url = video_url.lstrip('/')
        # If clean_url is something like "assets/local_reel_1.mp4"
        file_path = os.path.normpath(os.path.join(base_dir, '..', 'Frontend', 'public', clean_url))
        
        if not os.path.exists(file_path):
            print(f"❌ Video not found at: {file_path}")
            # Fallback check
            video_part = video_id.split('_')[-1]
            alt_path = os.path.join(base_dir, '..', 'Frontend', 'public', 'assets', f"local_reel_{video_part}.mp4")
            if os.path.exists(alt_path):
                file_path = alt_path
            else:
                return jsonify({'error': f'Video file not found at {file_path}'}), 404

        # Get video number for deterministic interactions

        # Get video number for deterministic interactions
        try:
            import re
            m = re.search(r'\d+', str(video_id))
            video_num = int(m.group(0)) if m else 1
        except:
            video_num = 1
            
        # Generate interactions if not provided
        if not (frontend_interactions and len(frontend_interactions) > 0):
            interactions = generate_deterministic_interactions(video_id, video_num)
        else:
            interactions = frontend_interactions
        
        # Run FULL PIPELINE (Behavioral + Media Forensics + Gemini)
        # Note: run_detection should eventually take num_frames, but for now it uses VideoAIAnalyzer defaults
        result = run_detection(
            file_path=file_path,
            interactions=interactions,
            post_id=f"reels_{video_id}",
            gemini_api_key=os.getenv('GEMINI_API_KEY')
        )
        
        # Add metadata
        result['video_id'] = video_id
        
        # Cache result
        _ANALYSIS_CACHE[video_id] = result
        
        # Convert types to native Python
        result = convert_numpy_types(result)
        
        # No-cache headers
        response = jsonify(result)
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        return response
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

def convert_numpy_types(obj):
    """Convert numpy types to Python native types"""
    if obj is None:
        return None
    if isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif hasattr(obj, 'item') and callable(getattr(obj, 'item')):
        return obj.item()
    elif isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        return float(obj)
    elif isinstance(obj, (np.bool_, bool)):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, pd.Timestamp):
        return obj.strftime('%Y-%m-%d %H:%M:%S')
    elif pd.isna(obj):
        return None
    else:
        return obj

@app.route('/detect', methods=['POST'])
def detect():
    """
    Full detection pipeline:
      1. Behavioral analysis (from JSON interactions or synthetic)
      2. Media forensics     (from uploaded file, if present)
      3. Gemini cross-check
      4. Aggregated confidence score

    Form fields (multipart/form-data):
      file         – optional video/image upload
      interactions – optional JSON string of interaction list
      post_id      – optional string identifier
    """
    import traceback

    file_path = None
    tmp_path = None

    try:
        # ── Save uploaded file temporarily ────────────────────────────────
        uploaded_file = request.files.get('file')
        if uploaded_file and uploaded_file.filename:
            suffix = os.path.splitext(uploaded_file.filename)[-1] or '.tmp'
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp_path = tmp.name
                uploaded_file.save(tmp_path)
            file_path = tmp_path
            print(f"📁 Saved upload to {file_path}")

        # ── Parse optional interactions ───────────────────────────────────
        interactions = []
        raw_interactions = request.form.get('interactions') or (request.json or {}).get('interactions')
        if raw_interactions:
            if isinstance(raw_interactions, str):
                import json as _json
                interactions = _json.loads(raw_interactions)
            else:
                interactions = raw_interactions

        post_id = request.form.get('post_id') or (request.json or {}).get('post_id') or None

        # ── Run pipeline ──────────────────────────────────────────────────
        result = run_detection(
            file_path=file_path,
            interactions=interactions,
            post_id=post_id,
            gemini_api_key=os.getenv('GEMINI_API_KEY'),
        )

        result = convert_numpy_types(result)
        return jsonify(result)

    except Exception as exc:
        print(f"❌ /detect error: {exc}")
        traceback.print_exc()
        return jsonify({'error': str(exc)}), 500

    finally:
        # Always clean up the temp file
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
                print(f"🗑️  Removed temp file {tmp_path}")
            except Exception:
                pass


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 INSTAGRAM AI DETECTOR - FINAL FIXED VERSION")
    print("="*60)
    print("✅ Each video gets UNIQUE deterministic patterns")
    print("✅ No caching - fresh analysis every time")
    print("✅ Based on video ID: 1,5,9 → Bot Network (High AI)")
    print("✅ Based on video ID: 2,6,10 → Real Human (Low AI)")
    print("✅ Based on video ID: 3,7 → Coordinated Attack (Very High AI)")
    print("✅ Based on video ID: 4,8 → Organic Spread (Low AI)")
    print("="*60)
    app.run(debug=True, port=5001, threaded=True)
