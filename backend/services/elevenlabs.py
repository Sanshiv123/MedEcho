from elevenlabs.client import ElevenLabs
from backend.config import ELEVENLABS_API_KEY
import os

client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

# Voice IDs for each language (find these in ElevenLabs dashboard)
VOICE_MAP = {
    "en": "21m00Tcm4TlvDq8ikWAM",  # Rachel
    "es": "your_spanish_voice_id",
    "fr": "your_french_voice_id",
    "hi": "your_hindi_voice_id",
}

def generate_audio(text, language, patient_id, phase):
    voice_id = VOICE_MAP.get(language, VOICE_MAP["en"])
    
    audio = client.generate(
        text=text,
        voice=voice_id,
        model="eleven_multilingual_v2"
    )
    
    # Save to static folder
    filename = f"static/audio/{patient_id}_phase{phase}.mp3"
    os.makedirs("static/audio", exist_ok=True)
    
    with open(filename, "wb") as f:
        for chunk in audio:
            f.write(chunk)
    
    return f"/static/audio/{patient_id}_phase{phase}.mp3"