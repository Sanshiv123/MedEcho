from flask import Blueprint, jsonify, request
from services.liveavatar import create_embed

avatar_bp = Blueprint('avatar', __name__)

@avatar_bp.route('/api/avatar', methods=['GET'])
def get_avatar():
    is_sandbox = request.args.get('sandbox', 'true').lower() == 'true'
    script = request.args.get('script', '')
    url = create_embed(is_sandbox=is_sandbox, greeting=script)
    if not url:
        return jsonify({"error": "Failed to create avatar session"}), 500
    return jsonify({"embed_url": url})