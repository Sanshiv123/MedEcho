import os
import json
from flask import Blueprint, request, jsonify

approve_bp = Blueprint('approve', __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@approve_bp.route('/api/approve/<patient_id>', methods=['POST'])
def approve(patient_id):
    data_path = os.path.join(BASE_DIR, 'static', 'data', f"{patient_id}.json")
    if not os.path.exists(data_path):
        return jsonify({"error": "Patient not found"}), 404

    with open(data_path, 'r') as f:
        data = json.load(f)

    body = request.get_json()
    physician_notes = body.get('physician_notes', '')

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
        phase2_script = physician_notes

    data['physician_notes'] = physician_notes
    data['phase2_script'] = phase2_script
    data['phase'] = 2

    with open(data_path, 'w') as f:
        json.dump(data, f)

    return jsonify({"status": "sent", "patient_id": patient_id})