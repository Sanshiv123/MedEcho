# backend/medecho_model/gradcam.py
# Generates GradCAM heatmap overlays on chest X-ray scans.
# GradCAM (Gradient-weighted Class Activation Mapping) highlights the regions
# of the image that most influenced the model's prediction — making the AI
# decision interpretable for physicians.

import os
import uuid
import numpy as np
import torch
from PIL import Image
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from scipy.ndimage import zoom

# ---------------------------------------------------------------------------
# Output directory
# Heatmap overlays are saved here and served to the physician portal.
# ---------------------------------------------------------------------------
HEATMAP_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "heatmaps")
os.makedirs(HEATMAP_DIR, exist_ok=True)


def generate_heatmap(
    img_tensor: torch.Tensor,
    img_np: np.ndarray,
    model,
    original_image_path: str = None
) -> str:
    """
    Generates a GradCAM heatmap overlay on the original chest X-ray scan.

    GradCAM works by computing the gradient of the top predicted class score
    with respect to the feature maps of the last convolutional block (denseblock4).
    These gradients are used to weight the feature maps, producing a localization
    map that highlights the most discriminative regions.

    The heatmap is overlaid on the original scan at its native resolution
    so the physician sees exactly which part of the full-size image drove
    the AI's prediction.

    Args:
        img_tensor:           Preprocessed image tensor (1, 1, 224, 224) — model input
        img_np:               Normalized numpy array (224, 224, 3), values 0–1 — fallback overlay base
        model:                Loaded torchxrayvision DenseNet model
        original_image_path:  Path to the original uploaded scan for full-resolution overlay

    Returns:
        filepath: Absolute path to the saved heatmap overlay PNG file
    """

    # Step 1: Target the last dense block — it captures the highest-level features
    # and produces the most semantically meaningful activation maps
    target_layer = [model.features.denseblock4]

    # Step 2: Initialize GradCAM and compute the activation map
    cam = GradCAM(model=model, target_layers=target_layer)
    grayscale_cam = cam(input_tensor=img_tensor)[0]  # Shape: (224, 224)

    # Step 3: Scale heatmap to original image resolution if available
    # The model processes at 224x224 but the original scan may be much larger.
    # We scale the CAM up to match so the overlay is medically accurate.
    if original_image_path and os.path.exists(original_image_path):
        original = Image.open(original_image_path).convert('RGB')
        orig_w, orig_h = original.size

        # Compute scale factors for height and width separately
        scale_h = orig_h / 224
        scale_w = orig_w / 224

        # Rescale the grayscale CAM to original dimensions using bilinear interpolation
        grayscale_cam_resized = zoom(grayscale_cam, (scale_h, scale_w))

        # Use the original image as the base for the overlay (normalized to 0–1)
        img_np_resized = np.array(original.resize((orig_w, orig_h)), dtype=np.float32) / 255.0
    else:
        # Fallback: use the 224x224 preprocessed numpy array
        grayscale_cam_resized = grayscale_cam
        img_np_resized = img_np

    # Step 4: Overlay the heatmap on the base image
    # show_cam_on_image blends the jet colormap heatmap with the grayscale scan
    visualization = show_cam_on_image(
        img_np_resized.astype(np.float32),
        grayscale_cam_resized,
        use_rgb=True
    )

    # Step 5: Save the overlay with a unique filename
    filename = f"{uuid.uuid4().hex}.png"
    filepath = os.path.join(HEATMAP_DIR, filename)
    Image.fromarray((visualization * 255).astype(np.uint8)).save(filepath)

    return filepath