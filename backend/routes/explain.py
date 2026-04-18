from flask import Blueprint, jsonify

explain_bp = Blueprint('explain', __name__)

@explain_bp.route('/api/explain', methods=['POST'])
def explain():
    return jsonify({"status": "explain endpoint ready"})