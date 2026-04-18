# backend/utils/language.py
# Pair 2 — Person A owns this file
# Maps language codes to instructions Gemini will follow

LANGUAGE_INSTRUCTIONS = {
    "en": "Write in English.",
    "es": "Write in Spanish (Español).",
    "fr": "Write in French (Français).",
    "hi": "Write in Hindi (हिन्दी).",
}

def get_language_instruction(code):
    """
    Takes a language code like "en" or "es"
    Returns a plain instruction string for Gemini to follow.
    """
    return LANGUAGE_INSTRUCTIONS.get(code, "Write in English.")
