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
    data['physician_notes'] = body.get('physician_notes', '')
    data['phase'] = 2

    with open(data_path, 'w') as f:
        json.dump(data, f)

    return jsonify({"status": "sent", "patient_id": patient_id})