from elevenlabs import ElevenLabs
from backend.config import ELEVENLABS_API_KEY
import os

client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

VOICE_MAP = {
    "en": "pqHfZKP75CvOlQylNhV4",
    "es": "pqHfZKP75CvOlQylNhV4",
    "fr": "pqHfZKP75CvOlQylNhV4",
    "hi": "pqHfZKP75CvOlQylNhV4",
}

def generate_audio(text, language, patient_id, phase):
    voice_id = VOICE_MAP.get(language, VOICE_MAP["en"])
    
    os.makedirs("static/audio", exist_ok=True)
    filename = f"static/audio/{patient_id}_phase{phase}.mp3"
    
    response = client.text_to_speech.convert(
        voice_id=voice_id,
        text=text,
        model_id="eleven_multilingual_v2",
    )
    
    with open(filename, "wb") as f:
        for chunk in response:
            if chunk:
                f.write(chunk)
    
    return f"/static/audio/{patient_id}_phase{phase}.mp3"