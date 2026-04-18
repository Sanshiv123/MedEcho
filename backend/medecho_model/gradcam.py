import os
import uuid
import numpy as np
import torch
from PIL import Image
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from scipy.ndimage import zoom

HEATMAP_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "heatmaps")
os.makedirs(HEATMAP_DIR, exist_ok=True)

def generate_heatmap(img_tensor: torch.Tensor, img_np: np.ndarray, model, original_image_path: str = None) -> str:
    target_layer = [model.features.denseblock4]
    cam = GradCAM(model=model, target_layers=target_layer)
    grayscale_cam = cam(input_tensor=img_tensor)[0]

    # If we have the original image, resize everything to match it
    if original_image_path and os.path.exists(original_image_path):
        original = Image.open(original_image_path).convert('RGB')
        orig_w, orig_h = original.size

        # Resize grayscale CAM to original dimensions
        scale_h = orig_h / 224
        scale_w = orig_w / 224
        grayscale_cam_resized = zoom(grayscale_cam, (scale_h, scale_w))

        # Resize img_np to original dimensions
        img_np_resized = np.array(original.resize((orig_w, orig_h)), dtype=np.float32) / 255.0
    else:
        grayscale_cam_resized = grayscale_cam
        img_np_resized = img_np

    visualization = show_cam_on_image(
        img_np_resized.astype(np.float32),
        grayscale_cam_resized,
        use_rgb=True
    )

    filename = f"{uuid.uuid4().hex}.png"
    filepath = os.path.join(HEATMAP_DIR, filename)
    Image.fromarray((visualization * 255).astype(np.uint8)).save(filepath)

    return filepath