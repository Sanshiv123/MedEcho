# backend/routes/explain.py
# Handles the /api/explain endpoint — called internally by scan.py after
# the classifier runs. Passes scan results to Gemini to generate:
#   1. A formal clinical report for the physician
#   2. A Phase 1 patient script (pre-physician review, non-diagnostic)
#   3. A Phase 2 patient script (post-physician review, plain-language)
#
# All three outputs are tailored to the patient's language and generation.

from flask import Blueprint, request, jsonify
from services.gemini import generate_dual_output

explain_bp = Blueprint("explain", __name__)

# Supported urgency levels — must match classifier output
VALID_URGENCY = {"Critical", "Moderate", "Low"}

# Supported language codes — must match clinician portal options
VALID_LANGUAGES = {"en", "es", "fr", "hi"}


@explain_bp.route("/api/explain", methods=["POST"])
def explain():
    """
    Generates AI-powered clinical and patient-facing content for a scan.

    Called internally by /api/scan after the DenseNet classifier runs.
    Not intended to be called directly by the frontend.

    Expects JSON body:
    {
        "patient_id":  "P-xxxx",
        "condition":   "Pneumonia",
        "confidence":  0.82,
        "urgency":     "Moderate",
        "language":    "en",
        "generation":  "Millennial"   (optional, defaults to "General")
    }

    Returns:
    {
        "patient_id":      "P-xxxx",
        "clinical_report": "Formal physician-facing summary...",
        "phase1_script":   "Warm pre-review patient message...",
        "phase2_script":   "Plain-language post-review explanation...",
        "audio_url":       null  (reserved for ElevenLabs integration)
    }

    Error responses:
        400 - Missing required field or invalid urgency/language value
    """

    # Step 1: Parse and validate request body
    data = request.json
    if not data:
        return jsonify({"error": "No JSON body received"}), 400

    # Step 2: Ensure all required fields are present
    required = ["patient_id", "condition", "confidence", "urgency", "language"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Step 3: Validate urgency value matches expected classifier output
    if data["urgency"] not in VALID_URGENCY:
        return jsonify({"error": f"urgency must be one of: {', '.join(VALID_URGENCY)}"}), 400

    # Step 4: Validate language code matches supported options
    if data["language"] not in VALID_LANGUAGES:
        return jsonify({"error": f"language must be one of: {', '.join(VALID_LANGUAGES)}"}), 400

    # Step 5: Extract generation (optional — defaults to "General" if not provided)
    # Generation affects tone and vocabulary in Gemini's output:
    # Baby Boomer → formal, Gen X → direct, Millennial → empathetic, Gen Z → transparent
    generation = data.get("generation", "General")

    # Step 6: Call Gemini to generate all three outputs simultaneously
    result = generate_dual_output(
        condition=data["condition"],
        confidence=data["confidence"],
        urgency=data["urgency"],
        language=data["language"],
        patient_id=data["patient_id"],
        generation=generation
    )

    # Step 7: Return structured response
    return jsonify({
        "patient_id": data["patient_id"],
        "clinical_report": result["clinical_report"],   # For physician portal
        "phase1_script": result["phase1_script"],       # For patient portal phase 1
        "phase2_script": result["phase2_script"],       # For patient portal phase 2 (overridden by approve.py)
        "audio_url": None                               # Reserved for future ElevenLabs integration
    })