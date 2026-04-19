import os
import json
import requests
from flask import Blueprint, request, jsonify
import sys
sys.path.append('.')
from medecho_model.classifier import classify_scan, xrv_model
from medecho_model.gradcam import generate_heatmap
from services.trials import get_matched_trials

scan_bp = Blueprint('scan', __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def get_generation(dob_str):
    if not dob_str:
        return "General"
    try:
        birth_year = int(dob_str.split('-')[0])
        if birth_year <= 1945:
            return "Silent Generation"
        elif birth_year <= 1964:
            return "Baby Boomer"
        elif birth_year <= 1980:
            return "Gen X"
        elif birth_year <= 1996:
            return "Millennial"
        else:
            return "Gen Z"
    except:
        return "General"

@scan_bp.route('/api/scan', methods=['POST'])
def scan():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files['image']
    patient_id = request.form.get('patient_id', 'P001')
    patient_name = request.form.get('patient_name', 'Unknown')
    language = request.form.get('language', 'en')
    patient_location = request.form.get('patient_location', '')
    patient_dob = request.form.get('patient_dob', '')
    generation = get_generation(patient_dob)

    scan_dir = os.path.join(BASE_DIR, 'static', 'scans')
    os.makedirs(scan_dir, exist_ok=True)

    image_path = os.path.join(scan_dir, f"{patient_id}.png")
    image.save(image_path)

    result = classify_scan(image_path, return_tensors=True)
    img_tensor = result.pop("_img_tensor")
    img_np = result.pop("_img_np")
    heatmap_path = generate_heatmap(img_tensor, img_np, xrv_model, image_path)
    heatmap_filename = os.path.basename(heatmap_path)

    trials = get_matched_trials(
    condition=result["condition"],
    location=patient_location,
    differential=result.get("differential_diagnosis", []),
    symptoms=request.form.get('symptoms', ''),
    language=language
    )

    result['patient_id'] = patient_id
    result['patient_name'] = patient_name
    result['image_url'] = f"/files/scans/{patient_id}.png"
    result['heatmap_url'] = f"/files/heatmaps/{heatmap_filename}"
    result['trials'] = trials
    result['language'] = language
    result['clinician_notes'] = request.form.get('clinician_notes', '')
    result['physician_notes'] = ""
    result['phase'] = 1
    result['patient_location'] = patient_location
    result['patient_dob'] = patient_dob
    result['generation'] = generation

    try:
        explain_res = requests.post(
            "http://127.0.0.1:5000/api/explain",
            json={
                "patient_id": patient_id,
                "condition": result["condition"],
                "confidence": result["confidence"],
                "urgency": result["urgency"],
                "language": language,
                "generation": generation
            },
            timeout=30
        )
        explain_data = explain_res.json()
        result['clinical_report'] = explain_data.get('clinical_report', '')
        result['phase1_script'] = explain_data.get('phase1_script', '')
        result['phase2_script'] = explain_data.get('phase2_script', '')
    except Exception as e:
        print(f"Gemini explain error: {e}")
        result['clinical_report'] = ''
        result['phase1_script'] = ''
        result['phase2_script'] = ''

    data_dir = os.path.join(BASE_DIR, 'static', 'data')
    os.makedirs(data_dir, exist_ok=True)
    with open(os.path.join(data_dir, f"{patient_id}.json"), 'w') as f:
        json.dump(result, f)

    return jsonify(result)