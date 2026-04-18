# test_endpoint.py — delete after testing

import requests

response = requests.post(
    "http://127.0.0.1:5000/api/explain",
    json={
        "patient_id": "P001",
        "condition": "pneumonia",
        "confidence": 0.82,
        "urgency": "Critical",
        "language": "en"
    }
)

print(response.json())