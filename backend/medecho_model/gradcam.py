import os
import uuid
import numpy as np
import torch
from PIL import Image
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image

HEATMAP_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "heatmaps")
os.makedirs(HEATMAP_DIR, exist_ok=True)

def generate_heatmap(img_tensor: torch.Tensor, img_np: np.ndarray, model) -> str:
    target_layer = [model.features.denseblock4]
    cam = GradCAM(model=model, target_layers=target_layer)
    grayscale_cam = cam(input_tensor=img_tensor)[0]
    visualization = show_cam_on_image(
        img_np.astype(np.float32),
        grayscale_cam,
        use_rgb=True
    )
    filename = f"{uuid.uuid4().hex}.png"
    filepath = os.path.join(HEATMAP_DIR, filename)
    Image.fromarray((visualization * 255).astype(np.uint8)).save(filepath)
    return filepath
