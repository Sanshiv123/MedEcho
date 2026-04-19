import os
import json
from flask import Blueprint, jsonify

status_bp = Blueprint('status', __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@status_bp.route('/api/status/<patient_id>', methods=['GET'])
def status(patient_id):
    return jsonify({"status": "status endpoint ready", "patient_id": patient_id})

@status_bp.route('/api/cases', methods=['GET'])
def get_cases():
    data_dir = os.path.join(BASE_DIR, 'static', 'data')
    if not os.path.exists(data_dir):
        return jsonify([])
    cases = []
    for filename in os.listdir(data_dir):
        if filename.endswith('.json'):
            with open(os.path.join(data_dir, filename)) as f:
                try:
                    data = json.load(f)
                    cases.append({
                        "patient_id": data.get("patient_id"),
                        "patient_name": data.get("patient_name"),
                        "condition": data.get("condition"),
                        "urgency": data.get("urgency"),
                        "phase": data.get("phase"),
                        "language": data.get("language"),
                        "image_url": data.get("image_url"),
                        "symptoms": data.get("symptoms"),
                    })
                except:
                    pass
    return jsonify(cases)