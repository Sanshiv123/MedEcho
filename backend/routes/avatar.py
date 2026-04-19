import os
import json
from flask import Blueprint, jsonify, request
from services.liveavatar import create_embed

avatar_bp = Blueprint('avatar', __name__)

@avatar_bp.route('/api/avatar', methods=['GET'])
def get_avatar():
    is_sandbox = request.args.get('sandbox', 'false').lower() == 'true'
    script = request.args.get('script', '')
    patient_id = request.args.get('patient_id', '')

    greeting = script
    knowledge = None

    if patient_id:
        data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'static', 'data', f"{patient_id}.json")
        print(f"Looking for: {data_path}")
        if os.path.exists(data_path):
            with open(data_path, 'r') as f:
                patient_data = json.load(f)

            phase = patient_data.get('phase', 1)
            condition = patient_data.get('condition', '')
            phase1_script = patient_data.get('phase1_script', '')
            phase2_script = patient_data.get('phase2_script', '')
            physician_notes = patient_data.get('physician_notes', '')

            if phase == 1:
                greeting = f"{phase1_script} If you'd like to know more about what we saw, the scan showed some changes in the area of your {condition.lower()} — this is something your care team is reviewing carefully. It doesn't necessarily mean anything serious, and many things can cause changes like this. I'm here if you have any questions."
            else:
                greeting = f"{phase2_script} Your doctor has completed their review. {physician_notes} I'm here to answer any questions you have."

            knowledge = f"Patient name: {patient_data.get('patient_name', '')}. Scan finding: {condition}. Confidence: {int(patient_data.get('confidence', 0) * 100)}%. Urgency: {patient_data.get('urgency', '')}. Phase: {phase}. Phase 1 message: {phase1_script}. Phase 2 message: {phase2_script}. Physician assessment: {physician_notes}."

            print(f"Knowledge being sent: {knowledge}")
            print(f"Greeting being sent: {greeting}")

    url = create_embed(is_sandbox=is_sandbox, greeting=greeting, knowledge=knowledge)
    if not url:
        return jsonify({"error": "Failed to create avatar session"}), 500
    return jsonify({"embed_url": url})