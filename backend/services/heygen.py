import requests
import time
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import HEYGEN_API_KEY

HEYGEN_BASE = "https://api.heygen.com"

def get_heygen_voice(language):
    voice_map = {
        "en": "f38a635bee7a4d1f9b0a654a31d050d2",
        "es": "f38a635bee7a4d1f9b0a654a31d050d2",
        "fr": "f38a635bee7a4d1f9b0a654a31d050d2",
        "hi": "f38a635bee7a4d1f9b0a654a31d050d2",
    }
    return voice_map.get(language, voice_map["en"])

def create_avatar_video(script, language, avatar_id="Abigail_sitting_sofa_front"):
    headers = {
        "X-Api-Key": HEYGEN_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "video_inputs": [{
            "character": {
                "type": "avatar",
                "avatar_id": avatar_id,
                "avatar_style": "normal"
            },
            "voice": {
                "type": "text",
                "input_text": script,
                "voice_id": get_heygen_voice(language)
            }
        }],
        "dimension": {"width": 1280, "height": 720}
    }
    response = requests.post(
        f"{HEYGEN_BASE}/v2/video/generate",
        json=payload,
        headers=headers
    )
    data = response.json()
    print(f"HeyGen create response: {data}")
    return data.get("data", {}).get("video_id")

def poll_for_video_url(video_id, max_wait=120):
    headers = {"Authorization": f"Bearer {HEYGEN_API_KEY}"}
    for _ in range(max_wait // 5):
        time.sleep(5)
        response = requests.get(
            f"{HEYGEN_BASE}/v1/video_status.get?video_id={video_id}",
            headers=headers
        )
        data = response.json()
        status = data.get("data", {}).get("status")
        print(f"HeyGen poll status: {status}")
        if status == "completed":
            return data.get("data", {}).get("video_url")
        elif status == "failed":
            print(f"HeyGen video failed: {data}")
            return None
    return None

def generate_avatar_video_background(script, language, patient_json_path, url_key):
    """
    Generates a HeyGen video in the background and updates the patient JSON
    with the video URL when ready.
    """
    import json
    import threading

    def run():
        try:
            video_id = create_avatar_video(script, language)
            if not video_id:
                print(f"HeyGen: no video_id returned")
                return
            video_url = poll_for_video_url(video_id)
            if not video_url:
                print(f"HeyGen: video never completed")
                return
            with open(patient_json_path, 'r') as f:
                data = json.load(f)
            data[url_key] = video_url
            with open(patient_json_path, 'w') as f:
                json.dump(data, f)
            print(f"HeyGen: saved {url_key} = {video_url}")
        except Exception as e:
            print(f"HeyGen background error: {e}")

    thread = threading.Thread(target=run, daemon=True)
    thread.start()