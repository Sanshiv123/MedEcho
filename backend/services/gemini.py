# backend/services/gemini.py
# Pair 2 — Person A owns this file
# Calls Gemini 2.0 Flash to generate clinical report + patient scripts

import json
import os
from google import genai
from google.genai import types
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import GEMINI_API_KEY
from utils.language import get_language_instruction
# Configure Gemini with our API key
client = genai.Client(api_key=GEMINI_API_KEY)


def generate_dual_output(condition, confidence, urgency, language, patient_id):
    """
    Calls Gemini 2.0 Flash to generate two outputs simultaneously:
    a clinical report for the physician, and patient-facing scripts
    for Phase 1 (pre-approval) and Phase 2 (post-approval).

    Args:
        condition   (str):   e.g. "pneumonia"
        confidence  (float): e.g. 0.82
        urgency     (str):   "Critical", "Moderate", or "Low"
        language    (str):   "en", "es", "fr", or "hi"
        patient_id  (str):   e.g. "P001"

    Returns:
        dict: {
            "clinical_report": "Formal physician-facing summary in English.",
            "phase1_script":   "Warm pre-approval message in patient language.",
            "phase2_script":   "Full plain-language explanation in patient language."
        }
    """

    # Step 1: Load the medical context file
    context_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "medical_context.json")    
    with open(context_path, encoding="utf-8") as f:
        context = json.load(f)

    # Step 2: Pull out the context for this specific condition
    condition_context = context.get(condition, {})

    # Step 3: Get the language instruction for Gemini
    lang_instruction = get_language_instruction(language)

    # Step 4: Build the prompt
    prompt = f"""
You are a medical AI assistant helping a healthcare team communicate with a patient.
A chest X-ray scan has been analyzed and shows the following:

- Condition detected: {condition}
- Confidence level: {confidence:.0%}
- Urgency level: {urgency}
- Medical reference context: {json.dumps(condition_context)}

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
   or an area that looks different — without naming any condition.Use calm, specific-but-neutral language — for example, describe it as 
   "some cloudiness", "a slightly hazy area", or "a small bright spot" 
   rather than vague words like "different" or "unusual" which can cause anxiety.
   Reassure them their care team is reviewing it and they are in good hands.
   {lang_instruction}

3. "phase2_script": 
   A plain-language explanation for the patient AFTER the physician has approved it.
   Start by acknowledging how they might be feeling.
   Explain what was found in simple everyday words — no medical jargon.
   Tell them what this means and that their care team will guide them.
   Keep it warm and human. 3-4 sentences.
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

    # Step 5: Call Gemini
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt
    )

    # Step 6: Clean up response in case Gemini adds markdown anyway
    text = response.text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1]
        text = text.rsplit("```", 1)[0]
        text = text.strip()

    # Step 7: Parse and return as a Python dict
    result = json.loads(text)
    print("\n--- RAW RESULT ---")
    return result

def generate_phase2_from_assessment(physician_notes, condition, language):
    lang_instruction = get_language_instruction(language)

    prompt = f"""
You are helping a doctor communicate their medical assessment to a patient in simple, warm, human language.

The doctor has written the following clinical assessment:
"{physician_notes}"

The scan showed: {condition}

Your job is to rewrite the doctor's assessment as a message the patient will read or hear.
- Use simple everyday words, no medical jargon
- Start by acknowledging how they might be feeling
- Explain what the doctor found and what it means
- End warmly, reassuring them their care team will guide them
- Keep it to 3-4 sentences
{lang_instruction}

Respond with ONLY the plain-language message. No JSON, no extra text.
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )

    return response.text.strip()