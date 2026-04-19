# backend/utils/language.py
# Utility for mapping language codes to Gemini language instructions.
#
# Used by gemini.py to tell Gemini which language to write patient-facing
# scripts in. The instruction is injected directly into the Gemini prompt
# so the model produces output in the correct language.
#
# Supported languages match the clinician portal's language selector:
# English, Spanish, French, and Hindi.

# ---------------------------------------------------------------------------
# Language instruction mapping
# Maps ISO 639-1 language codes to plain-English instructions for Gemini.
# Gemini follows these instructions to produce output in the target language.
# ---------------------------------------------------------------------------
LANGUAGE_INSTRUCTIONS = {
    "en": "Write in English.",
    "es": "Write in Spanish (Español).",
    "fr": "Write in French (Français).",
    "hi": "Write in Hindi (हिन्दी).",
}


def get_language_instruction(code: str) -> str:
    """
    Returns a Gemini prompt instruction for writing in the specified language.

    Falls back to English if the language code is not recognized.

    Args:
        code: ISO 639-1 language code (e.g. "en", "es", "fr", "hi")

    Returns:
        Instruction string to inject into the Gemini prompt
        (e.g. "Write in Spanish (Español).")
    """
    return LANGUAGE_INSTRUCTIONS.get(code, "Write in English.")