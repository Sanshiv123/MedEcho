LANGUAGE_INSTRUCTIONS = {
    "en": "Write in English.",
    "es": "Write in Spanish (Español).",
    "fr": "Write in French (Français).",
    "hi": "Write in Hindi (हिन्दी).",
}

def get_language_instruction(code):
    return LANGUAGE_INSTRUCTIONS.get(code, "Write in English.")
