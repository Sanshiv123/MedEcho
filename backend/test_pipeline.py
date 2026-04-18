from medecho_model.classifier import preprocess_image, classify_scan
from medecho_model.gradcam import generate_heatmap
from PIL import Image
import numpy as np
import torchxrayvision as xrv

img_path = "data/sample_xrays/sample/images/00000013_005.png"

# Run inference
result = classify_scan(img_path)
print("Condition:", result["condition"])
print("Confidence:", result["confidence"])
print("Urgency:", result["urgency"])

# Get tensor from Person 1's preprocess
img_tensor = preprocess_image(img_path)

# Build numpy array separately for GradCAM
img_np = np.array(Image.open(img_path).convert("RGB").resize((224, 224))) / 255.0

# Load model
model = xrv.models.DenseNet(weights="densenet121-res224-all")
model.eval()

# Generate heatmap
heatmap_path = generate_heatmap(img_tensor, img_np, model)
print("Heatmap saved to:", heatmap_path)