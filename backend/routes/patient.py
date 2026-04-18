import os
import json
from flask import Blueprint, jsonify

patient_bp = Blueprint('patient', __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@patient_bp.route('/api/patient/<patient_id>', methods=['GET'])
def get_patient(patient_id):
    data_path = os.path.join(BASE_DIR, 'static', 'data', f"{patient_id}.json")
    if not os.path.exists(data_path):
        return jsonify({"error": "Patient not found"}), 404
    with open(data_path, 'r') as f:
        data = json.load(f)
    return jsonify(data)