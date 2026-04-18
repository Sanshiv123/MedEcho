from flask import Blueprint, jsonify

status_bp = Blueprint('status', __name__)

@status_bp.route('/api/status/<patient_id>', methods=['GET'])
def status(patient_id):
    return jsonify({"status": "status endpoint ready", "patient_id": patient_id})