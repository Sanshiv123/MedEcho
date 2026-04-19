from flask import Blueprint, jsonify, request
from services.liveavatar import create_embed

avatar_bp = Blueprint('avatar', __name__)

@avatar_bp.route('/api/avatar', methods=['GET'])
def get_avatar():
    is_sandbox = request.args.get('sandbox', 'true').lower() == 'true'
    script = request.args.get('script', '')
    patient_id = request.args.get('patient_id', '')
    
    knowledge = None
    if patient_id:
        import json, os
        data_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'static', 'data', f"{patient_id}.json")
        print(f"Looking for: {data_path}")
        if os.path.exists(data_path):
            with open(data_path, 'r') as f:
                patient_data = json.load(f)
            knowledge = f"""
Patient: {patient_data.get('patient_name', 'the patient')}
Scan finding: {patient_data.get('condition', 'unknown')}
Confidence: {int(patient_data.get('confidence', 0) * 100)}%
Urgency: {patient_data.get('urgency', 'unknown')}
Phase: {patient_data.get('phase', 1)}
Phase 1 message: {patient_data.get('phase1_script', '')}
Phase 2 message: {patient_data.get('phase2_script', '')}
Physician assessment: {patient_data.get('physician_notes', '')}
"""
    print(f"Knowledge being sent: {knowledge}")
    print(f"Knowledge: {knowledge}")
    print(f"Greeting: {script}")
    url = create_embed(is_sandbox=is_sandbox, greeting=script, knowledge=knowledge)
    if not url:
        return jsonify({"error": "Failed to create avatar session"}), 500
    return jsonify({"embed_url": url})