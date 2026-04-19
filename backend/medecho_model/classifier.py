# backend/medecho_model/classifier.py
# Loads a pre-trained DenseNet CNN from torchxrayvision and classifies
# chest X-ray images into pathological conditions with confidence scores.

import torch
import torchxrayvision as xrv
import numpy as np
from PIL import Image

# ---------------------------------------------------------------------------
# Model initialization
# Load once at module import time so it's shared across all requests.
# Using densenet121-res224-all which is trained on multiple chest X-ray datasets.
# ---------------------------------------------------------------------------
xrv_model = xrv.models.DenseNet(weights="densenet121-res224-all")
xrv_model.eval()


def preprocess_image(image_path: str) -> torch.Tensor:
    """
    Loads and preprocesses a chest X-ray image for the DenseNet model.

    Steps:
    - Convert to grayscale (model expects single-channel input)
    - Resize to 224x224 (model's expected input size)
    - Normalize pixel values using torchxrayvision's normalization
    - Add batch and channel dimensions → shape (1, 1, 224, 224)

    Args:
        image_path: Path to the input image file

    Returns:
        Preprocessed image tensor of shape (1, 1, 224, 224)
    """
    img = Image.open(image_path).convert('L')  # Convert to grayscale
    img = img.resize((224, 224))
    img = np.array(img, dtype=np.float32)
    img = xrv.datasets.normalize(img, 255)     # Normalize to [-1024, 1024] range
    img = img[None, None, :, :]                # Add batch + channel dims
    return torch.from_numpy(img)


def get_urgency(confidence: float) -> str:
    """
    Maps a confidence score to a clinical urgency level.

    Thresholds:
    - >= 0.85 → Critical (high confidence, immediate attention)
    - >= 0.60 → Moderate (meaningful finding, timely follow-up)
    - <  0.60 → Low (uncertain finding, routine follow-up)

    Args:
        confidence: Model confidence score between 0 and 1

    Returns:
        Urgency string: "Critical", "Moderate", or "Low"
    """
    if confidence >= 0.85:
        return "Critical"
    elif confidence >= 0.60:
        return "Moderate"
    else:
        return "Low"


def classify_scan(image_path: str, return_tensors: bool = False) -> dict:
    """
    Runs the DenseNet classifier on a chest X-ray image.

    Returns the top predicted condition, confidence score, urgency level,
    and a differential diagnosis list (top 3 conditions by confidence).

    Optionally returns the preprocessed image tensor and numpy array
    for downstream GradCAM heatmap generation.

    Args:
        image_path:     Path to the input image file
        return_tensors: If True, include '_img_tensor' and '_img_np' in result

    Returns:
        dict with keys:
            condition            - Top predicted pathology name
            confidence           - Confidence score (0.0 to 1.0, rounded to 2dp)
            urgency              - "Critical", "Moderate", or "Low"
            urgency_reason       - Human-readable urgency explanation
            differential_diagnosis - List of top 3 predicted conditions
            _img_tensor          - (optional) Raw preprocessed tensor for GradCAM
            _img_np              - (optional) Normalized numpy array for GradCAM overlay
    """
    # Step 1: Preprocess the image
    img_tensor = preprocess_image(image_path)

    # Step 2: Run inference (no gradient tracking needed for inference)
    with torch.no_grad():
        outputs = xrv_model(img_tensor)

    # Step 3: Map pathology names to their confidence scores
    predictions = dict(zip(xrv_model.pathologies, outputs[0].numpy()))

    # Step 4: Extract top condition and confidence
    top_condition = max(predictions, key=predictions.get)
    confidence = float(predictions[top_condition])
    urgency = get_urgency(confidence)

    # Step 5: Build differential diagnosis (top 3 conditions by score)
    sorted_preds = sorted(predictions.items(), key=lambda x: x[1], reverse=True)
    differential = [p[0] for p in sorted_preds[:3]]

    # Step 6: Build result dict
    result = {
        "condition": top_condition,
        "confidence": round(confidence, 2),
        "urgency": urgency,
        "urgency_reason": f"Finding detected → {top_condition}",
        "differential_diagnosis": differential
    }

    # Step 7: Optionally attach tensors for GradCAM
    if return_tensors:
        # Convert grayscale tensor to 3-channel numpy array normalized to [0, 1]
        img_np = np.stack([img_tensor[0, 0].numpy()] * 3, axis=-1)
        img_np = (img_np - img_np.min()) / (img_np.max() - img_np.min() + 1e-8)
        result["_img_tensor"] = img_tensor
        result["_img_np"] = img_np

    return result