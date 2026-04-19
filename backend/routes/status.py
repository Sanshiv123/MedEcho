# backend/routes/status.py
# Provides status and case listing endpoints.
#
# /api/status/<patient_id> — lightweight check on a patient's current phase
# /api/cases              — returns a summary list of all patient records,
#                           useful for a future physician dashboard showing
#                           all pending and completed cases

import os
import json
from flask import Blueprint, jsonify

status_bp = Blueprint('status', __name__)

# Base directory is one level up from routes/ → points to backend/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Directory where patient JSON records are stored
DATA_DIR = os.path.join(BASE_DIR, 'static', 'data')


@status_bp.route('/api/status/<patient_id>', methods=['GET'])
def status(patient_id: str):
    """
    Returns the current status of a patient's case.

    Lightweight endpoint — does not return full patient data.
    Can be used to check if a patient has transitioned to phase 2
    without loading the entire record.

    Args:
        patient_id: Patient UUID string (e.g. "P-xxxx-xxxx")

    Returns:
        200 - { "status": "ready", "patient_id": "P-xxxx", "phase": 1 }
        404 - { "error": "Patient not found" }
    """
    data_path = os.path.join(DATA_DIR, f"{patient_id}.json")

    if not os.path.exists(data_path):
        return jsonify({"error": "Patient not found"}), 404

    with open(data_path, 'r') as f:
        data = json.load(f)

    return jsonify({
        "status": "ready",
        "patient_id": patient_id,
        "phase": data.get("phase", 1)
    })


@status_bp.route('/api/cases', methods=['GET'])
def get_cases():
    """
    Returns a summary list of all patient cases on the system.

    Reads all JSON files from static/data/ and extracts key fields.
    Intended for a future physician dashboard that lists all pending
    and completed cases across patients.

    Silently skips any malformed JSON files.

    Returns:
        200 - Array of case summary objects:
        [
            {
                "patient_id":   "P-xxxx",
                "patient_name": "Jane Smith",
                "condition":    "Pneumonia",
                "urgency":      "Moderate",
                "phase":        1,
                "language":     "en",
                "image_url":    "/files/scans/P-xxxx.png",
                "symptoms":     "chest pain, fever"
            },
            ...
        ]
    """
    # Return empty list if no data directory exists yet
    if not os.path.exists(DATA_DIR):
        return jsonify([])

    cases = []

    for filename in os.listdir(DATA_DIR):
        if not filename.endswith('.json'):
            continue

        filepath = os.path.join(DATA_DIR, filename)
        try:
            with open(filepath) as f:
                data = json.load(f)

            # Extract only the summary fields needed for a case list view
            cases.append({
                "patient_id":   data.get("patient_id"),
                "patient_name": data.get("patient_name"),
                "condition":    data.get("condition"),
                "urgency":      data.get("urgency"),
                "phase":        data.get("phase"),
                "language":     data.get("language"),
                "image_url":    data.get("image_url"),
                "symptoms":     data.get("symptoms"),
            })
        except Exception:
            # Skip malformed or unreadable JSON files silently
            pass

    return jsonify(cases)