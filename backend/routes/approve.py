# backend/routes/approve.py
# Handles the physician "Send to Patient" action.
#
# When the physician finalizes their assessment and hits Send, this endpoint:
# 1. Loads the patient's stored JSON record
# 2. Passes the physician's notes through Gemini to generate a plain-language
#    patient explanation tailored to the patient's generation and language
# 3. Updates the patient record to phase 2 so the patient portal transitions
# 4. Returns confirmation to the physician portal

import os
import json
from flask import Blueprint, request, jsonify

approve_bp = Blueprint('approve', __name__)

# Base directory is one level up from routes/ → points to backend/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


@approve_bp.route('/api/approve/<patient_id>', methods=['POST'])
def approve(patient_id: str):
    """
    Physician sends their assessment to the patient.

    Expects JSON body:
    {
        "physician_notes": "Clinical assessment text written by the physician"
    }

    Actions:
    - Loads the patient record from static/data/<patient_id>.json
    - Calls Gemini to convert physician notes into a plain-language phase 2 script
      adapted to the patient's generation (Baby Boomer, Gen X, Millennial, Gen Z)
      and language (en, es, fr, hi)
    - Falls back to raw physician notes if Gemini fails
    - Sets phase = 2 so the patient portal transitions from phase 1 to phase 2
    - Saves the updated record back to disk

    Returns:
        200 - { "status": "sent", "patient_id": "P-xxxx" }
        404 - { "error": "Patient not found" }
    """

    # Step 1: Locate the patient's stored JSON record
    data_path = os.path.join(BASE_DIR, 'static', 'data', f"{patient_id}.json")
    if not os.path.exists(data_path):
        return jsonify({"error": "Patient not found"}), 404

    # Step 2: Load existing patient data
    with open(data_path, 'r') as f:
        data = json.load(f)

    # Step 3: Extract physician notes from request body
    body = request.get_json()
    physician_notes = body.get('physician_notes', '')

    # Step 4: Generate plain-language phase 2 script via Gemini
    # Gemini rewrites the physician's clinical notes into warm, accessible language
    # tailored to the patient's generation and preferred language.
    # Falls back to raw physician notes if Gemini is unavailable.
    try:
        from services.gemini import generate_phase2_from_assessment
        phase2_script = generate_phase2_from_assessment(
            physician_notes=physician_notes,
            condition=data.get('condition', ''),
            language=data.get('language', 'en'),
            generation=data.get('generation', 'General')
        )
    except Exception as e:
        print(f"Gemini phase2 error: {e}")
        phase2_script = physician_notes  # Graceful fallback

    # Step 5: Update patient record
    data['physician_notes'] = physician_notes
    data['phase2_script'] = phase2_script
    data['phase'] = 2  # Triggers phase transition on patient portal

    # Step 6: Persist updated record to disk
    with open(data_path, 'w') as f:
        json.dump(data, f)

    return jsonify({"status": "sent", "patient_id": patient_id})