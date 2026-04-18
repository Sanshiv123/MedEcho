import torch
import torchxrayvision as xrv
import numpy as np
from PIL import Image

# Load model once at startup
xrv_model = xrv.models.DenseNet(weights="densenet121-res224-all")
xrv_model.eval()

def preprocess_image(image_path):
    img = Image.open(image_path).convert('L')
    img = img.resize((224, 224))
    img = np.array(img, dtype=np.float32)
    img = xrv.datasets.normalize(img, 255)
    img = img[None, None, :, :]
    return torch.from_numpy(img)

def get_urgency(confidence):
    if confidence >= 0.85:
        return "Critical"
    elif confidence >= 0.60:
        return "Moderate"
    else:
        return "Low"

def classify_scan(image_path, return_tensors=False):
    img_tensor = preprocess_image(image_path)

    with torch.no_grad():
        outputs = xrv_model(img_tensor)

    predictions = dict(zip(xrv_model.pathologies, outputs[0].numpy()))
    top_condition = max(predictions, key=predictions.get)
    confidence = float(predictions[top_condition])
    urgency = get_urgency(confidence)

    sorted_preds = sorted(predictions.items(), key=lambda x: x[1], reverse=True)
    differential = [p[0] for p in sorted_preds[:3]]

    result = {
        "condition": top_condition,
        "confidence": round(confidence, 2),
        "urgency": urgency,
        "urgency_reason": f"Finding detected → {top_condition}",
        "differential_diagnosis": differential
    }

    if return_tensors:
        img_np = np.stack([img_tensor[0, 0].numpy()] * 3, axis=-1)
        img_np = (img_np - img_np.min()) / (img_np.max() - img_np.min() + 1e-8)
        result["_img_tensor"] = img_tensor
        result["_img_np"] = img_np

    return result