# test_gemini.py — delete this after testing

from backend.services.gemini import generate_dual_output

print("Calling Gemini... this may take 5-10 seconds")

result = generate_dual_output(
    condition="pneumonia",
    confidence=0.82,
    urgency="Critical",
    language="en",
    patient_id="P001"
)

print("\n--- CLINICAL REPORT ---")
print(result["clinical_report"])

print("\n--- PHASE 1 SCRIPT ---")
print(result["phase1_script"])

print("\n--- PHASE 2 SCRIPT ---")
print(result["phase2_script"])