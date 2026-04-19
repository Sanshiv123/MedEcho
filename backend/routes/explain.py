from flask import Blueprint, request, jsonify
from services.gemini import generate_dual_output

explain_bp = Blueprint("explain", __name__)

@explain_bp.route("/api/explain", methods=["POST"])
def explain():
    data = request.json

    if not data:
        return jsonify({"error": "No JSON body received"}), 400

    required = ["patient_id", "condition", "confidence", "urgency", "language"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    if data["urgency"] not in ["Critical", "Moderate", "Low"]:
        return jsonify({"error": "urgency must be Critical, Moderate, or Low"}), 400

    if data["language"] not in ["en", "es", "fr", "hi"]:
        return jsonify({"error": "language must be en, es, fr, or hi"}), 400

    result = generate_dual_output(
        condition=data["condition"],
        confidence=data["confidence"],
        urgency=data["urgency"],
        language=data["language"],
        patient_id=data["patient_id"],
        generation=generation
    )

    return jsonify({
        "patient_id": data["patient_id"],
        "clinical_report": result["clinical_report"],
        "phase1_script": result["phase1_script"],
        "phase2_script": result["phase2_script"],
        "audio_url": None
    })