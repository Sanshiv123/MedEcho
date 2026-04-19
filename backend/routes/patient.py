# backend/routes/patient.py
# Serves patient data to the patient and physician portals.
#
# Patient records are stored as JSON files in static/data/<patient_id>.json.
# They are created by /api/scan and updated by /api/approve.
# This endpoint is polled every 5 seconds by the patient portal to detect
# the phase 1 → phase 2 transition after the physician sends their assessment.

import os
import json
from flask import Blueprint, jsonify

patient_bp = Blueprint('patient', __name__)

# Base directory is one level up from routes/ → points to backend/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Directory where patient JSON records are stored
DATA_DIR = os.path.join(BASE_DIR, 'static', 'data')


@patient_bp.route('/api/patient/<patient_id>', methods=['GET'])
def get_patient(patient_id: str):
    """
    Retrieves the full patient record by patient ID.

    Used by:
    - Patient portal: polls every 5 seconds to check for phase transition
    - Physician portal: loads patient data on initial render
    - Avatar route: loads patient context to build greeting and knowledge

    The record contains:
    - Scan metadata (condition, confidence, urgency, differential)
    - Image and heatmap URLs
    - Gemini-generated scripts (phase1_script, phase2_script, clinical_report)
    - Physician notes and phase status
    - Matched clinical trials
    - Patient info (name, language, generation, location, DOB)

    Args:
        patient_id: UUID string identifying the patient (e.g. "P-xxxx-xxxx")

    Returns:
        200 - Full patient JSON record
        404 - { "error": "Patient not found" } if no record exists for this ID
    """

    # Step 1: Construct path to patient record
    data_path = os.path.join(DATA_DIR, f"{patient_id}.json")

    # Step 2: Return 404 if record doesn't exist
    if not os.path.exists(data_path):
        return jsonify({"error": "Patient not found"}), 404

    # Step 3: Load and return the patient record
    with open(data_path, 'r') as f:
        data = json.load(f)

    return jsonify(data)