from flask import Blueprint, jsonify

approve_bp = Blueprint('approve', __name__)

@approve_bp.route('/api/approve', methods=['POST'])
def approve():
    return jsonify({"status": "approve endpoint ready"})