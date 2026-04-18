from flask import Blueprint, jsonify

scan_bp = Blueprint('scan', __name__)

@scan_bp.route('/api/scan', methods=['POST'])
def scan():
    return jsonify({"status": "scan endpoint ready"})