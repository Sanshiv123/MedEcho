# backend/routes/avatar.py
# Creates a LiveAvatar embed session for the patient portal.
#
# Each time the patient portal loads (or transitions from phase 1 to phase 2),
# a fresh LiveAvatar embed URL is generated. The avatar is given:
# - A greeting: the exact Gemini-generated script for the current phase
# - Knowledge: full patient context so the avatar can answer follow-up questions
#
# The embed URL is loaded as an iframe in the patient portal frontend.

import os
import json
from flask import Blueprint, jsonify, request
from services.liveavatar import create_embed

avatar_bp = Blueprint('avatar', __name__)

# Base directory for patient data files
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'static', 'data')


def build_greeting(patient_data: dict) -> str:
    """
    Builds the avatar's opening greeting based on the current phase.

    Phase 1: Warm observational message — what the scan showed visually,
             no diagnosis, no percentages, reassuring tone.
    Phase 2: Full plain-language explanation of the physician's assessment,
             followed by an invitation to ask questions.

    Args:
        patient_data: Patient JSON record

    Returns:
        Greeting string to be spoken by the avatar on session start
    """
    phase = patient_data.get('phase', 1)
    condition = patient_data.get('condition', '')
    phase1_script = patient_data.get('phase1_script', '')
    phase2_script = patient_data.get('phase2_script', '')
    physician_notes = patient_data.get('physician_notes', '')

    if phase == 1:
        # Phase 1: Acknowledge the scan, describe what's visible, stay non-diagnostic
        return (
            f"{phase1_script} "
            f"If you'd like to know more about what we saw, the scan showed some changes "
            f"in the area of your {condition.lower()} — this is something your care team is "
            f"reviewing carefully. It doesn't necessarily mean anything serious, and many "
            f"things can cause changes like this. I'm here if you have any questions."
        )
    else:
        # Phase 2: Deliver the physician-reviewed plain-language explanation
        return (
            f"{phase2_script} "
            f"Your doctor has completed their review. {physician_notes} "
            f"I'm here to answer any questions you have."
        )


def build_knowledge(patient_data: dict) -> str:
    """
    Builds the knowledge string passed to the LiveAvatar session.
    This gives the avatar's LLM context about the patient's specific scan
    so it can answer follow-up questions accurately.

    Args:
        patient_data: Patient JSON record

    Returns:
        Formatted knowledge string
    """
    return (
        f"Patient name: {patient_data.get('patient_name', '')}. "
        f"Scan finding: {patient_data.get('condition', '')}. "
        f"Confidence: {int(patient_data.get('confidence', 0) * 100)}%. "
        f"Urgency: {patient_data.get('urgency', '')}. "
        f"Phase: {patient_data.get('phase', 1)}. "
        f"Phase 1 message: {patient_data.get('phase1_script', '')}. "
        f"Phase 2 message: {patient_data.get('phase2_script', '')}. "
        f"Physician assessment: {patient_data.get('physician_notes', '')}."
    )


@avatar_bp.route('/api/avatar', methods=['GET'])
def get_avatar():
    """
    Creates a LiveAvatar embed session for the patient portal.

    Query parameters:
        sandbox   - "true" to use sandbox mode (Wayne avatar, no credits)
                    "false" for production (female avatar, uses credits)
        script    - Fallback greeting if no patient_id is provided
        patient_id - Patient UUID to load data and build contextual greeting

    Returns:
        200 - { "embed_url": "https://embed.liveavatar.com/v1/..." }
        500 - { "error": "Failed to create avatar session" }
    """

    # Step 1: Parse query parameters
    is_sandbox = request.args.get('sandbox', 'false').lower() == 'true'
    script = request.args.get('script', '')
    patient_id = request.args.get('patient_id', '')

    # Default greeting and knowledge if no patient context is available
    greeting = script
    knowledge = None

    # Step 2: Load patient data if patient_id is provided
    if patient_id:
        data_path = os.path.join(DATA_DIR, f"{patient_id}.json")
        print(f"[Avatar] Looking for patient data: {data_path}")

        if os.path.exists(data_path):
            with open(data_path, 'r') as f:
                patient_data = json.load(f)

            # Step 3: Build contextual greeting and knowledge for this patient
            greeting = build_greeting(patient_data)
            knowledge = build_knowledge(patient_data)

            print(f"[Avatar] Phase: {patient_data.get('phase', 1)}")
            print(f"[Avatar] Greeting: {greeting[:100]}...")
            print(f"[Avatar] Knowledge: {knowledge[:100]}...")
        else:
            print(f"[Avatar] Patient data not found for ID: {patient_id}")

    # Step 4: Create the LiveAvatar embed session
    url = create_embed(is_sandbox=is_sandbox, greeting=greeting, knowledge=knowledge)

    if not url:
        return jsonify({"error": "Failed to create avatar session"}), 500

    return jsonify({"embed_url": url})