# test_approve.py — delete after testing
import requests

BASE = "http://127.0.0.1:5000"

# ---- TEST 1: Check status before approval ----
print("=== TEST 1: Status before approval ===")
response = requests.get(f"{BASE}/api/status?patient_id=P001")
print(response.json())
# Expected: { "patient_id": "P001", "approved": false }

# ---- TEST 2: Approve the patient ----
print("\n=== TEST 2: Physician approves ===")
response = requests.post(f"{BASE}/api/approve", json={
    "patient_id": "P001",
    "phase2_script": "Your doctor has reviewed your scan and wants you to know that you have pneumonia. This is treatable and your care team will guide you through next steps.",
    "audio_url": None,
    "trials": [
        {
            "name": "REGN4461 Respiratory Trial",
            "sponsor": "Regeneron",
            "location": "Princeton, NJ",
            "match_reason": "Respiratory condition detected"
        }
    ]
})
print(response.json())
# Expected: { "success": true, "patient_id": "P001" }

# ---- TEST 3: Check status after approval ----
print("\n=== TEST 3: Status after approval ===")
response = requests.get(f"{BASE}/api/status?patient_id=P001")
print(response.json())
# Expected: { "patient_id": "P001", "approved": true, "phase2_script": "...", ... }

# ---- TEST 4: Missing patient_id ----
print("\n=== TEST 4: Missing patient_id (should error) ===")
response = requests.post(f"{BASE}/api/approve", json={"phase2_script": "test"})
print(response.json())
# Expected: { "error": "Missing patient_id" }