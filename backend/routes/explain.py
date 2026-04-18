# backend/routes/explain.py
# Pair 2 — Person A owns this file
# Handles POST /api/explain — receives scan results, returns Gemini-generated scripts

from flask import Blueprint, request, jsonify
from backend.services.gemini import generate_dual_output

# Blueprint is Flask's way of organizing routes into separate files
explain_bp = Blueprint("explain", __name__)


@explain_bp.route("/api/explain", methods=["POST"])
def explain():
    """
    Expects a JSON body like:
    {
        "patient_id": "P001",
        "condition": "pneumonia",
        "confidence": 0.82,
        "urgency": "Critical",
        "language": "en"
    }

    Returns:
    {
        "patient_id": "P001",
        "clinical_report": "...",
        "phase1_script": "...",
        "phase2_script": "...",
        "audio_url": null
    }
    """

    data = request.json

    # Guard: make sure the request actually has a body
    if not data:
        return jsonify({"error": "No JSON body received"}), 400

    # Validate all required fields are present
    required = ["patient_id", "condition", "confidence", "urgency", "language"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Validate urgency is one of the three agreed values
    if data["urgency"] not in ["Critical", "Moderate", "Low"]:
        return jsonify({"error": "urgency must be Critical, Moderate, or Low"}), 400

    # Validate language is one of the four agreed codes
    if data["language"] not in ["en", "es", "fr", "hi"]:
        return jsonify({"error": "language must be en, es, fr, or hi"}), 400

    # Call Gemini to generate the three outputs
    result = generate_dual_output(
        condition=data["condition"],
        confidence=data["confidence"],
        urgency=data["urgency"],
        language=data["language"],
        patient_id=data["patient_id"]
    )

    # Return everything as JSON
    return jsonify({
        "patient_id": data["patient_id"],
        "clinical_report": result["clinical_report"],
        "phase1_script": result["phase1_script"],
        "phase2_script": result["phase2_script"],
        "audio_url": None  # Person B will fill this in later
    })