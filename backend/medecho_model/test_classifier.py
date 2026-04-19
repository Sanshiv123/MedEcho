# backend/medecho_model/test_classifier.py
# Quick smoke test for the classifier pipeline.
# Run this from the backend/medecho_model/ directory to verify the model
# loads correctly and produces expected output fields.
#
# Usage:
#   cd backend/medecho_model
#   python3 test_classifier.py
#
# Make sure 'test_xray.jpg' exists in the same directory before running.

from classifier import classify_scan


def run_test(image_path: str) -> None:
    """
    Runs the classifier on a test image and prints the result.

    Args:
        image_path: Path to a chest X-ray image to classify
    """
    print(f"Running classifier on: {image_path}\n")

    result = classify_scan(image_path)

    print("=== Classification Result ===")
    print(f"Condition:            {result['condition']}")
    print(f"Confidence:           {result['confidence']}")
    print(f"Urgency:              {result['urgency']}")
    print(f"Urgency reason:       {result['urgency_reason']}")
    print(f"Differential:         {result['differential_diagnosis']}")
    print("=============================\n")

    # Verify all expected keys are present
    expected_keys = ["condition", "confidence", "urgency", "urgency_reason", "differential_diagnosis"]
    missing = [k for k in expected_keys if k not in result]
    if missing:
        print(f"WARNING: Missing keys in result: {missing}")
    else:
        print("All expected keys present ✓")


if __name__ == "__main__":
    run_test("test_xray.jpg")