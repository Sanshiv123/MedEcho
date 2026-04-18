import requests
from backend.config import HEYGEN_API_KEY

HEYGEN_BASE = "https://api.heygen.com"

def create_avatar_video(script, language, avatar_id="Abigail_sitting_sofa_front"):
    """
    Creates a HeyGen video with the avatar speaking the script.
    Returns a video URL when ready.
    """
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
    return response.json()  # contains video_id to poll

def get_avatar_video_url(video_id):
    """Poll for video completion."""
    headers = {"X-Api-Key": HEYGEN_API_KEY}
    response = requests.get(
        f"{HEYGEN_BASE}/v1/video_status.get?video_id={video_id}",
        headers=headers
    )
    return response.json()

def get_heygen_voice(language):
    # HeyGen voice IDs per language — get from their dashboard
    voice_map = {
    "en": "f38a635bee7a4d1f9b0a654a31d050d2",
    "es": "f38a635bee7a4d1f9b0a654a31d050d2",
    "fr": "f38a635bee7a4d1f9b0a654a31d050d2",
    "hi": "f38a635bee7a4d1f9b0a654a31d050d2",
    }
    return voice_map.get(language, voice_map["en"])