# MedEcho
AI-powered medical image triage that explains diagnoses to patients in their own language, using a real-time avatar.

## Dataset Setup
Run this once locally — do NOT commit the data:
```bash
python3 -c "
import kagglehub
path = kagglehub.dataset_download('nih-chest-xrays/sample')
print('Downloaded to:', path)
"

cp -r ~/.cache/kagglehub/datasets/nih-chest-xrays/sample/versions/4/sample backend/data/sample_xrays
```