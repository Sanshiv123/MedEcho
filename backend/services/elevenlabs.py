# backend/services/elevenlabs.py
# Converts patient-facing scripts to audio using ElevenLabs TTS.
#
# Used to generate spoken audio for the patient portal so patients
# can hear their scan explanation rather than just reading it.
# Supports multilingual output via the eleven_multilingual_v2 model.
#
# Audio files are saved to static/audio/ and served via the /files route.
# Currently all languages use the same voice ID — update VOICE_MAP with
# language-specific voice IDs from the ElevenLabs dashboard for better
# native-language delivery.

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from elevenlabs import ElevenLabs
from config import ELEVENLABS_API_KEY

# ---------------------------------------------------------------------------
# Client initialization
# Initialized once at module load time and shared across all requests.
# ---------------------------------------------------------------------------
client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# ---------------------------------------------------------------------------
# Voice ID mapping by language
# Maps language codes to ElevenLabs voice IDs.
# Currently using the same voice for all languages — replace with
# language-specific voice IDs from the ElevenLabs dashboard for
# authentic multilingual delivery.
#
# To find voice IDs: https://elevenlabs.io/app/voice-library
# ---------------------------------------------------------------------------
VOICE_MAP = {
    "en": "pqHfZKP75CvOlQylNhV4",  # English
    "es": "pqHfZKP75CvOlQylNhV4",  # Spanish — update with native ES voice
    "fr": "pqHfZKP75CvOlQylNhV4",  # French  — update with native FR voice
    "hi": "pqHfZKP75CvOlQylNhV4",  # Hindi   — update with native HI voice
}

# Directory where generated audio files are saved
AUDIO_DIR = "static/audio"


def generate_audio(text: str, language: str, patient_id: str, phase: int) -> str:
    """
    Converts a patient-facing script to an MP3 audio file using ElevenLabs TTS.

    Uses the eleven_multilingual_v2 model which supports natural-sounding
    speech across English, Spanish, French, Hindi, and other languages.

    Audio files are named by patient ID and phase to avoid collisions:
        static/audio/<patient_id>_phase<phase>.mp3

    Args:
        text:       The script text to convert to speech
        language:   Language code ("en", "es", "fr", "hi")
        patient_id: Patient UUID for unique filename generation
        phase:      1 for phase 1 script, 2 for phase 2 script

    Returns:
        URL path to the saved audio file (e.g. "/static/audio/P-xxxx_phase1.mp3")
    """

    # Step 1: Select the appropriate voice for the patient's language
    voice_id = VOICE_MAP.get(language, VOICE_MAP["en"])

    # Step 2: Ensure output directory exists
    os.makedirs(AUDIO_DIR, exist_ok=True)

    # Step 3: Build the output filename
    filename = os.path.join(AUDIO_DIR, f"{patient_id}_phase{phase}.mp3")

    # Step 4: Call ElevenLabs TTS API
    # Returns a streaming response — write chunks to file as they arrive
    response = client.text_to_speech.convert(
        voice_id=voice_id,
        text=text,
        model_id="eleven_multilingual_v2",  # Supports natural multilingual output
    )

    # Step 5: Write audio chunks to file
    with open(filename, "wb") as f:
        for chunk in response:
            if chunk:
                f.write(chunk)

    # Step 6: Return the URL path for the frontend to use
    return f"/static/audio/{patient_id}_phase{phase}.mp3"