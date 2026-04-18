import os
import json
from flask import Blueprint, request, jsonify
import sys
sys.path.append('.')
from medecho_model.classifier import classify_scan, xrv_model
from medecho_model.gradcam import generate_heatmap
from services.trials import get_matched_trials

scan_bp = Blueprint('scan', __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@scan_bp.route('/api/scan', methods=['POST'])
def scan():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image = request.files['image']
    patient_id = request.form.get('patient_id', 'P001')
    patient_name = request.form.get('patient_name', 'Unknown')

    scan_dir = os.path.join(BASE_DIR, 'static', 'scans')
    os.makedirs(scan_dir, exist_ok=True)

    image_path = os.path.join(scan_dir, f"{patient_id}.png")
    image.save(image_path)

    result = classify_scan(image_path, return_tensors=True)
    img_tensor = result.pop("_img_tensor")
    img_np = result.pop("_img_np")
    heatmap_path = generate_heatmap(img_tensor, img_np, xrv_model)
    heatmap_filename = os.path.basename(heatmap_path)

    trials = get_matched_trials(result["condition"])

    result['patient_id'] = patient_id
    result['patient_name'] = patient_name
    result['clinician_notes'] = request.form.get('clinician_notes', '')
    result['image_url'] = f"/files/scans/{patient_id}.png"
    result['heatmap_url'] = f"/files/heatmaps/{heatmap_filename}"
    result['trials'] = trials
    result['physician_notes'] = ""
    result['phase'] = 1

    data_dir = os.path.join(BASE_DIR, 'static', 'data')
    os.makedirs(data_dir, exist_ok=True)
    with open(os.path.join(data_dir, f"{patient_id}.json"), 'w') as f:
        json.dump(result, f)

    return jsonify(result)