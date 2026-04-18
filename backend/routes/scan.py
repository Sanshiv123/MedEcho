# backend/routes/scan.py
import os
from flask import Blueprint, request, jsonify
import sys
sys.path.append('.')
from medecho_model.classifier import classify_scan

scan_bp = Blueprint('scan', __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@scan_bp.route('/api/scan', methods=['POST'])
def scan():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    image = request.files['image']
    patient_id = request.form.get('patient_id', 'P001')
    
    # Use absolute path
    scan_dir = os.path.join(BASE_DIR, 'static', 'scans')
    os.makedirs(scan_dir, exist_ok=True)
    
    image_path = os.path.join(scan_dir, f"{patient_id}.png")
    image.save(image_path)
    
    result = classify_scan(image_path)
    result['patient_id'] = patient_id
    result['image_url'] = f"/static/scans/{patient_id}.png"
    
    return jsonify(result)