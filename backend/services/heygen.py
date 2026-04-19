# backend/services/heygen.py
# HeyGen video generation service — currently unused in the main pipeline.
#
# Originally built to generate pre-rendered avatar videos for phase 1 and
# phase 2 patient delivery. Superseded by LiveAvatar (liveavatar.py) which
# provides real-time streaming avatar sessions instead of pre-rendered video.
#
# Kept for reference and potential future use if pre-rendered video delivery
# is needed (e.g. for async/offline patient portals).
#
# NOTE: The HeyGen Streaming Avatar API (/v1/streaming.* and /v2/streaming.*)
# was sunset in March 2026. This file uses the video generation API which
# remains active but requires a valid HeyGen API key with sufficient credits.

import json
import os
import sys
import time
import threading
import requests

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import HEYGEN_API_KEY

# HeyGen API base URL
HEYGEN_BASE = "https://api.heygen.com"

# ---------------------------------------------------------------------------
# Voice ID mapping by language
# All currently pointing to the same voice — update with language-specific
# HeyGen voice IDs from the HeyGen dashboard for native-language delivery.
# ---------------------------------------------------------------------------
VOICE_MAP = {
    "en": "f38a635bee7a4d1f9b0a654a31d050d2",  # English
    "es": "f38a635bee7a4d1f9b0a654a31d050d2",  # Spanish — update with ES voice
    "fr": "f38a635bee7a4d1f9b0a654a31d050d2",  # French  — update with FR voice
    "hi": "f38a635bee7a4d1f9b0a654a31d050d2",  # Hindi   — update with HI voice
}


def get_heygen_voice(language: str) -> str:
    """
    Returns the HeyGen voice ID for the given language code.

    Args:
        language: Language code ("en", "es", "fr", "hi")

    Returns:
        HeyGen voice ID string
    """
    return VOICE_MAP.get(language, VOICE_MAP["en"])


def create_avatar_video(
    script: str,
    language: str,
    avatar_id: str = "Abigail_sitting_sofa_front"
) -> str | None:
    """
    Submits a video generation request to HeyGen.

    The avatar speaks the provided script in the specified language.
    Returns a video_id that must be polled via poll_for_video_url
    until the video is ready.

    Args:
        script:    Text for the avatar to speak
        language:  Language code for voice selection
        avatar_id: HeyGen avatar ID (default: Abigail seated)

    Returns:
        video_id string if request succeeded, None if it failed
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
    data = response.json()
    print(f"[HeyGen] Create response: {data}")

    return data.get("data", {}).get("video_id")


def poll_for_video_url(video_id: str, max_wait: int = 120) -> str | None:
    """
    Polls the HeyGen API until a video is ready or the timeout is reached.

    Checks every 5 seconds for up to max_wait seconds.
    Returns the video URL when the video is completed.

    Args:
        video_id: HeyGen video ID from create_avatar_video
        max_wait: Maximum seconds to wait before giving up (default: 120)

    Returns:
        Video URL string if completed, None if failed or timed out
    """
    headers = {"Authorization": f"Bearer {HEYGEN_API_KEY}"}

    for _ in range(max_wait // 5):
        time.sleep(5)

        response = requests.get(
            f"{HEYGEN_BASE}/v1/video_status.get?video_id={video_id}",
            headers=headers
        )
        data = response.json()
        status = data.get("data", {}).get("status")
        print(f"[HeyGen] Poll status: {status}")

        if status == "completed":
            return data.get("data", {}).get("video_url")
        elif status == "failed":
            print(f"[HeyGen] Video generation failed: {data}")
            return None

    print(f"[HeyGen] Timed out after {max_wait}s waiting for video_id: {video_id}")
    return None


def generate_avatar_video_background(
    script: str,
    language: str,
    patient_json_path: str,
    url_key: str
) -> None:
    """
    Generates a HeyGen video in a background thread and updates the
    patient JSON record with the video URL when ready.

    Runs asynchronously so the main request returns immediately while
    the video renders. The patient portal will pick up the URL on its
    next poll cycle.

    Args:
        script:             Text for the avatar to speak
        language:           Language code for voice selection
        patient_json_path:  Absolute path to the patient's JSON record
        url_key:            Key to store the video URL under (e.g. "phase1_video_url")
    """

    def run():
        try:
            # Step 1: Submit video generation request
            video_id = create_avatar_video(script, language)
            if not video_id:
                print("[HeyGen] No video_id returned — aborting")
                return

            # Step 2: Poll until video is ready
            video_url = poll_for_video_url(video_id)
            if not video_url:
                print("[HeyGen] Video never completed — aborting")
                return

            # Step 3: Update patient record with the video URL
            with open(patient_json_path, 'r') as f:
                data = json.load(f)
            data[url_key] = video_url
            with open(patient_json_path, 'w') as f:
                json.dump(data, f)

            print(f"[HeyGen] Saved {url_key} = {video_url}")

        except Exception as e:
            print(f"[HeyGen] Background thread error: {e}")

    # Run in a daemon thread so it doesn't block the Flask server
    thread = threading.Thread(target=run, daemon=True)
    thread.start()