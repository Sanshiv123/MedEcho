# backend/routes/approve.py
# Pair 2 — Person A owns this file
# Two endpoints:
#   POST /api/approve  — physician sends scan results to patient
#   GET  /api/status   — patient portal polls to check if approved yet

from flask import Blueprint, request, jsonify

approve_bp = Blueprint("approve", __name__)

# In-memory store — works fine for a hackathon
# Shape: { "P001": { "approved": True, "phase2_script": "...", ... } }
# NOTE: this resets every time the server restarts — that's ok for now
patient_store = {}


@approve_bp.route("/api/approve", methods=["POST"])
def approve():
    """
    Called by the physician portal when they hit Send to Patient.
    
    Expects JSON body:
    {
        "patient_id": "P001",
        "phase2_script": "Your doctor has reviewed...",
        "audio_url": "/static/audio/P001_phase2.mp3",  (optional, Person B fills this)
        "trials": [ { "name": "...", "location": "..." } ]  (optional)
    }
    
    Returns:
    {
        "success": true,
        "patient_id": "P001"
    }
    """

    data = request.json

    # Guard: make sure the request has a body
    if not data:
        return jsonify({"error": "No JSON body received"}), 400

    # Must have patient_id at minimum
    patient_id = data.get("patient_id")
    if not patient_id:
        return jsonify({"error": "Missing patient_id"}), 400

    # Create entry for this patient if it doesn't exist yet
    if patient_id not in patient_store:
        patient_store[patient_id] = {}

    # Flip the approved flag and store everything sent
    patient_store[patient_id]["approved"] = True
    patient_store[patient_id].update(data)

    print(f"[APPROVED] Patient {patient_id} — physician has sent results to patient")

    return jsonify({"success": True, "patient_id": patient_id})


@approve_bp.route("/api/status", methods=["GET"])
def status():
    """
    Called by the patient portal every 5 seconds to check approval status.
    
    Expects URL param: /api/status?patient_id=P001
    
    Returns:
    {
        "patient_id": "P001",
        "approved": false
    }
    
    OR when approved:
    {
        "patient_id": "P001",
        "approved": true,
        "phase2_script": "Your doctor has reviewed...",
        "audio_url": "/static/audio/P001_phase2.mp3",
        "trials": [ { "name": "...", "location": "..." } ]
    }
    """

    patient_id = request.args.get("patient_id")

    # Guard: missing patient_id param
    if not patient_id:
        return jsonify({"error": "Missing patient_id parameter"}), 400

    # Patient not found — return approved: false so portal keeps waiting
    if patient_id not in patient_store:
        return jsonify({
            "patient_id": patient_id,
            "approved": False
        })

    patient = patient_store[patient_id]

    # Patient found but not yet approved
    if not patient.get("approved", False):
        return jsonify({
            "patient_id": patient_id,
            "approved": False
        })

    # Approved — send everything the patient portal needs
    return jsonify({
        "patient_id": patient_id,
        "approved": True,
        "phase2_script": patient.get("phase2_script"),
        "audio_url": patient.get("audio_url"),
        "trials": patient.get("trials", [])
    })