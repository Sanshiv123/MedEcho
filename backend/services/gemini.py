import json
import os
from google import genai
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import GEMINI_API_KEY
from utils.language import get_language_instruction

client = genai.Client(api_key=GEMINI_API_KEY)


def generate_dual_output(condition, confidence, urgency, language, patient_id, generation="General"):
    context_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "medical_context.json")
    with open(context_path, encoding="utf-8") as f:
        context = json.load(f)

    condition_context = context.get(condition, {})
    lang_instruction = get_language_instruction(language)

    generation_instruction = {
        "Baby Boomer": "The patient is a Baby Boomer. Use formal, respectful language. Be thorough and reassuring. They trust medical authority and want detailed explanations.",
        "Gen X": "The patient is Gen X. Be direct and no-nonsense. Give them the facts without fluff. They are skeptical and want straight answers.",
        "Millennial": "The patient is a Millennial. Be empathetic and collaborative. Explain the why behind findings. Acknowledge their emotions and involve them in understanding.",
        "Gen Z": "The patient is Gen Z. Be ultra transparent and use very plain language. They have likely already googled this. Be honest and direct without sugarcoating.",
        "Silent Generation": "The patient is from the Silent Generation. Be very respectful and formal. Use simple clear language. Be gentle and thorough.",
        "General": "Use warm, clear, plain language suitable for any adult."
    }.get(generation, "Use warm, clear, plain language suitable for any adult.")

    confidence_instruction = (
    "The confidence level is low (below 60%). Use cautious, tentative language — say things like 'we noticed something that may need a closer look' rather than making definitive statements."
    if confidence < 0.60 else
    "The confidence level is high (above 85%). You can be more direct and clear about what was found without being alarming."
    if confidence > 0.85 else
    "The confidence level is moderate. Be clear but measured — acknowledge that the care team will confirm the findings."
)

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

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]
        text = text.rsplit("```", 1)[0]
        text = text.strip()

    result = json.loads(text)
    print("\n--- RAW RESULT ---")
    return result


def generate_phase2_from_assessment(physician_notes, condition, language, generation="General"):
    lang_instruction = get_language_instruction(language)

    generation_instruction = {
        "Baby Boomer": "The patient is a Baby Boomer. Use formal, respectful, thorough language.",
        "Gen X": "The patient is Gen X. Be direct and factual, no fluff.",
        "Millennial": "The patient is a Millennial. Be empathetic and collaborative.",
        "Gen Z": "The patient is Gen Z. Be transparent and very plain spoken.",
        "Silent Generation": "The patient is from the Silent Generation. Be very gentle and formal.",
        "General": "Use warm clear plain language."
    }.get(generation, "Use warm clear plain language.")

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
- Generation context: {generation_instruction}
{lang_instruction}

Respond with ONLY the plain-language message. No JSON, no extra text.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text.strip()