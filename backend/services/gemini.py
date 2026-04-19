# backend/services/gemini.py
# Handles all Gemini API calls for MedEcho.
#
# Two main functions:
#
# 1. generate_dual_output — called after scan classification to generate:
#    - clinical_report: formal physician-facing summary
#    - phase1_script:   warm pre-review patient message (no diagnosis)
#    - phase2_script:   plain-language post-review explanation (initial draft,
#                       overridden by generate_phase2_from_assessment after
#                       physician adds their assessment)
#
# 2. generate_phase2_from_assessment — called by /api/approve when physician
#    sends their assessment. Converts clinical notes into a plain-language
#    patient explanation tailored to the patient's generation and language.
#
# All outputs are adapted to:
# - Patient's language (en, es, fr, hi)
# - Patient's generational cohort (Silent, Boomer, Gen X, Millennial, Gen Z)
# - AI confidence level (cautious below 60%, direct above 85%)

import json
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from google import genai
from config import GEMINI_API_KEY
from utils.language import get_language_instruction

# ---------------------------------------------------------------------------
# Client initialization
# Initialized once at module load time and shared across all requests.
# ---------------------------------------------------------------------------
client = genai.Client(api_key=GEMINI_API_KEY)

# ---------------------------------------------------------------------------
# Generation tone mapping
# Maps generational cohort labels to communication style instructions
# injected into the Gemini prompt.
# ---------------------------------------------------------------------------
GENERATION_INSTRUCTIONS = {
    "Baby Boomer": "The patient is a Baby Boomer. Use formal, respectful language. Be thorough and reassuring. They trust medical authority and want detailed explanations.",
    "Gen X": "The patient is Gen X. Be direct and no-nonsense. Give them the facts without fluff. They are skeptical and want straight answers.",
    "Millennial": "The patient is a Millennial. Be empathetic and collaborative. Explain the why behind findings. Acknowledge their emotions and involve them in understanding.",
    "Gen Z": "The patient is Gen Z. Be ultra transparent and use very plain language. They have likely already googled this. Be honest and direct without sugarcoating.",
    "Silent Generation": "The patient is from the Silent Generation. Be very respectful and formal. Use simple clear language. Be gentle and thorough.",
    "General": "Use warm, clear, plain language suitable for any adult."
}

# Shorter version used in generate_phase2_from_assessment
GENERATION_INSTRUCTIONS_SHORT = {
    "Baby Boomer": "The patient is a Baby Boomer. Use formal, respectful, thorough language.",
    "Gen X": "The patient is Gen X. Be direct and factual, no fluff.",
    "Millennial": "The patient is a Millennial. Be empathetic and collaborative.",
    "Gen Z": "The patient is Gen Z. Be transparent and very plain spoken.",
    "Silent Generation": "The patient is from the Silent Generation. Be very gentle and formal.",
    "General": "Use warm clear plain language."
}


def get_confidence_instruction(confidence: float) -> str:
    """
    Returns a Gemini prompt instruction based on the AI's confidence score.

    Confidence-adaptive language ensures the patient communication
    is appropriately certain or cautious based on how confident the
    model is in its prediction:
    - Below 60%: tentative, "may need a closer look"
    - 60-85%:    measured, "the care team will confirm"
    - Above 85%: direct, clearer statement of finding

    Args:
        confidence: Model confidence score between 0 and 1

    Returns:
        Instruction string for the Gemini prompt
    """
    if confidence < 0.60:
        return (
            "The confidence level is low (below 60%). Use cautious, tentative language — "
            "say things like 'we noticed something that may need a closer look' rather than "
            "making definitive statements."
        )
    elif confidence > 0.85:
        return (
            "The confidence level is high (above 85%). You can be more direct and clear "
            "about what was found without being alarming."
        )
    else:
        return (
            "The confidence level is moderate. Be clear but measured — acknowledge that "
            "the care team will confirm the findings."
        )


def generate_dual_output(
    condition: str,
    confidence: float,
    urgency: str,
    language: str,
    patient_id: str,
    generation: str = "General"
) -> dict:
    """
    Generates the clinical report and both patient scripts for a scan.

    Called by /api/explain immediately after the DenseNet classifier runs.
    All three outputs are generated in a single Gemini call for efficiency.

    Args:
        condition:   Top predicted pathology (e.g. "Pneumonia")
        confidence:  Model confidence score (0.0 to 1.0)
        urgency:     "Critical", "Moderate", or "Low"
        language:    Language code: "en", "es", "fr", or "hi"
        patient_id:  Patient UUID (used for logging/debugging)
        generation:  Generational cohort for tone adaptation

    Returns:
        dict with keys:
            clinical_report - Formal physician-facing summary (always English)
            phase1_script   - Warm pre-review patient message in patient's language
            phase2_script   - Plain-language post-review explanation (initial draft)
    """

    # Step 1: Load medical context for this condition
    # Provides plain-language descriptions, typical symptoms, and urgency context
    context_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "data", "medical_context.json"
    )
    with open(context_path, encoding="utf-8") as f:
        context = json.load(f)
    condition_context = context.get(condition, {})

    # Step 2: Build prompt modifiers
    lang_instruction = get_language_instruction(language)
    generation_instruction = GENERATION_INSTRUCTIONS.get(generation, GENERATION_INSTRUCTIONS["General"])
    confidence_instruction = get_confidence_instruction(confidence)

    # Step 3: Build the Gemini prompt
    prompt = f"""
You are a medical AI assistant helping a healthcare team communicate with a patient.
A chest X-ray scan has been analyzed and shows the following:

- Condition detected: {condition}
- Confidence level: {confidence:.0%}
- Urgency level: {urgency}
- Medical reference context: {json.dumps(condition_context)}

CRITICAL: You MUST follow this communication style exactly: {generation_instruction}
- Confidence guidance: {confidence_instruction}

Your job is to generate exactly THREE outputs and return them as a single JSON object.

1. "clinical_report":
   A formal 3-5 sentence clinical summary written for a physician.
   Mention the condition, confidence level, and urgency.
   Describe what was likely observed on the imaging — specific visual findings
   such as opacity location, consolidation patterns, affected regions, or
   structural changes that support the diagnosis.
   Note any relevant differential considerations.
   Always write this in English, regardless of language setting.

2. "phase1_script":
   A warm, reassuring 2-3 sentence message for the patient to read IMMEDIATELY
   after their scan is uploaded — BEFORE the physician has reviewed it.
   Do NOT mention any diagnosis. Do NOT mention percentages or urgency.
   Briefly describe in simple, non-alarming terms what is visually noticeable
   on the scan — for example, mention if there is some cloudiness, a shadow,
   or an area that looks different — without naming any condition.
   Use calm, specific-but-neutral language — for example, describe it as
   "some cloudiness", "a slightly hazy area", or "a small bright spot"
   rather than vague words like "different" or "unusual" which can cause anxiety.
   Reassure them their care team is reviewing it and they are in good hands.
   Tailor the tone to the generation context provided.
   {lang_instruction}

3. "phase2_script":
   A plain-language explanation for the patient AFTER the physician has approved it.
   Start by acknowledging how they might be feeling.
   Explain what was found in simple everyday words — no medical jargon.
   Tell them what this means and that their care team will guide them.
   Keep it warm and human. 3-4 sentences.
   Tailor the tone to the generation context provided.
   {lang_instruction}

IMPORTANT: Respond ONLY with a valid JSON object.
No markdown. No backticks. No explanation outside the JSON.
Example format:
{{
  "clinical_report": "...",
  "phase1_script": "...",
  "phase2_script": "..."
}}
"""

    # Step 4: Call Gemini
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    # Step 5: Clean up response in case Gemini adds markdown fences
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]
        text = text.rsplit("```", 1)[0]
        text = text.strip()

    # Step 6: Parse and return
    result = json.loads(text)
    print(f"\n--- Gemini output for {patient_id} ---")
    return result


def generate_phase2_from_assessment(
    physician_notes: str,
    condition: str,
    language: str,
    generation: str = "General"
) -> str:
    """
    Converts a physician's clinical assessment into a plain-language
    patient explanation.

    Called by /api/approve when the physician hits "Send to Patient".
    The physician's clinical notes are rewritten in accessible language
    tailored to the patient's generational cohort and preferred language.

    Args:
        physician_notes: Raw clinical assessment written by the physician
        condition:       Detected condition for additional context
        language:        Patient's language code ("en", "es", "fr", "hi")
        generation:      Patient's generational cohort for tone adaptation

    Returns:
        Plain-language patient explanation string (not JSON)
    """

    lang_instruction = get_language_instruction(language)
    generation_instruction = GENERATION_INSTRUCTIONS_SHORT.get(
        generation, GENERATION_INSTRUCTIONS_SHORT["General"]
    )

    prompt = f"""
You are helping a doctor communicate their medical assessment to a patient in simple, warm, human language.

The doctor has written the following clinical assessment:
"{physician_notes}"

The scan showed: {condition}

Your job is to rewrite the doctor's assessment as a message the patient will read or hear.
- Use simple everyday words, no medical jargon
- Start by acknowledging how they might be feeling
- Include the specific finding the doctor mentioned, translated into plain language — do not skip it
- Explain what the doctor found and what it means
- Include any follow-up actions the doctor recommended
- End warmly, reassuring them their care team will guide them
- Keep it to 3-4 sentences
CRITICAL: You MUST follow this communication style exactly: {generation_instruction}
{lang_instruction}

Respond with ONLY the plain-language message. No JSON, no extra text.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text.strip()