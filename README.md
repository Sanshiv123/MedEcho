# MedEcho 🫁

> **Medical Results, Human Understanding.**

Under the 21st Century Cures Act (2021), patients receive their test results simultaneously with their doctor — often before the physician has read them. A patient gets a chest X-ray, goes home, opens MyChart at 11pm, and reads "pulmonary opacity suggesting possible malignancy" with no one to explain it. For non-English speakers, it's incomprehension. For everyone else, it's panic.

**MedEcho fixes that moment.**

A three-portal AI system that takes a chest X-ray from upload to plain-language explanation — in the patient's own language, delivered face-to-face by an AI avatar, before and after physician review.

---

## Resources

| Resource | Description |
|---|---|
| 📹 [Demo Video](#) | Full walkthrough of all three portals |
| 📊 [Slide Deck](#) | 10-slide project overview for the Regeneron track |
| 🏆 [Devpost](#) | HackPrinceton 2026 submission |

---

## How It Works

```
Clinician uploads scan + symptoms + language
        ↓
DenseNet CNN (torchxrayvision) → Condition + confidence + urgency
        ↓
GradCAM → heatmap overlay
        ↓
Gemini 2.5 Flash (simultaneously)
→ Clinical report for physician
→ Phase 1 script for patient (pre-approval)
→ Phase 2 script for patient (post-approval)
        ↓
ClinicalTrials.gov v2 API → live trial matching
        ↓
ElevenLabs (eleven_multilingual_v2) → Phase 1 audio in patient's language
        ↓
Patient sees scan immediately + HeyGen avatar delivers Phase 1 message
        ↓
Physician reviews everything → Send to Patient
        ↓
ElevenLabs → Phase 2 audio generated
HeyGen LiveAvatar → delivers full explanation face-to-face in patient's language
```

---

## Three Portals

### 🔬 Clinician Portal (`/clinician`)
- Upload chest X-ray or skin image
- Enter patient symptoms, city, preferred language
- AI immediately generates condition, confidence score, urgency level
- GradCAM heatmap shows exactly which region drove the prediction
- ClinicalTrials.gov matching runs simultaneously
- Gemini generates clinical report + patient scripts
- ElevenLabs converts Phase 1 script to audio immediately
- Links to physician and patient portals generated on submission

### 👨‍⚕️ Physician Portal (`/physician`)
- Full dashboard: scan + GradCAM heatmap side by side
- AI report with condition, confidence, urgency, differential diagnosis
- Clinician notes and matched clinical trials with confidence scores
- Add own assessment → hit Send to Patient
- Case sidebar with urgency badges and real-time status
- PDF export of full report

### 🧑‍🤝‍🧑 Patient Portal (`/patient/:patientId`)
- **Phase 1** (immediately after upload): HeyGen avatar delivers warm, non-diagnostic message in patient's language. ElevenLabs audio autoplays.
- **Phase 2** (after physician approves): ElevenLabs voice + HeyGen avatar delivers full plain-language explanation. Trial card appears if eligible studies found.
- Polls automatically every 5 seconds for physician approval
- Supports English, Spanish, French, Hindi

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, Flask, Flask-CORS |
| Frontend | React, React Router, Tailwind CSS |
| CNN Model | PyTorch, torchxrayvision, DenseNet-121 |
| Explainability | pytorch-grad-cam, scipy, NumPy 1.26.4, Pillow |
| AI Generation | Google Gemini 2.5 Flash (google-genai) |
| Voice | ElevenLabs eleven_multilingual_v2 |
| Avatar | HeyGen LiveAvatar API |
| Trial Matching | ClinicalTrials.gov v2 API |
| Data Storage | Flat JSON per patient, Flask static file serving |

---

## Models

### DenseNet CNN
- **Library:** [torchxrayvision](https://github.com/mlmed/torchxrayvision)
- **Architecture:** DenseNet-121 pretrained on chest X-ray datasets
- **Output:** Condition classification, confidence score, urgency level
- **Conditions:** Pneumonia, Pleural Effusion, Atelectasis, Cardiomegaly, No Finding, and more

### GradCAM
- **Library:** [pytorch-grad-cam](https://github.com/jacobgil/pytorch-grad-cam)
- **Purpose:** Explainability heatmap showing which region of the scan drove the AI prediction
- **Output:** Full-resolution heatmap overlay saved to `static/heatmaps/`

---

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

---

## Setup Instructions

### Prerequisites
- Python 3.11 (3.12+ breaks torch)
- Node.js 18+
- API keys for Gemini, ElevenLabs, and HeyGen

### 1. Clone the repo

```bash
git clone git@github.com:Sanshiv123/MedEcho.git
cd MedEcho
```

### 2. Backend setup

```bash
cd backend
python3.11 -m venv venv

# Mac/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

> ⚠️ NumPy must be pinned to 1.26.4. If you see numpy/cv2 import errors run:
> ```bash
> pip uninstall numpy -y && pip install numpy==1.26.4
> ```

### 3. Environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your API keys:

```
GEMINI_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
HEYGEN_API_KEY=your_key_here
LIVEAVATAR_API_KEY=your_key_here
LIVEAVATAR_CONTEXT_ID=your_context_id_here
```

| Key | Where to get it |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com) → Get API Key |
| `ELEVENLABS_API_KEY` | [ElevenLabs](https://elevenlabs.io) → Profile → API Keys |
| `HEYGEN_API_KEY` | [HeyGen](https://app.heygen.com) → Settings → API |
| `LIVEAVATAR_API_KEY` | Same HeyGen dashboard → LiveAvatar section |
| `LIVEAVATAR_CONTEXT_ID` | HeyGen → LiveAvatar → Create Context → Copy ID |

### 4. Run the backend

```bash
cd backend
python3 app.py
# Runs on http://127.0.0.1:5000
```

### 5. Frontend setup

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

### 6. Open the app

| Portal | URL |
|---|---|
| Landing | http://localhost:3000 |
| Clinician | http://localhost:3000/clinician |
| Physician | http://localhost:3000/physician |
| Patient | http://localhost:3000/patient/P-xxxx |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/scan` | Upload scan → CNN + heatmap + trials + Gemini + ElevenLabs Phase 1 |
| POST | `/api/approve/<patient_id>` | Physician sends results → Gemini Phase 2 + ElevenLabs Phase 2 |
| GET | `/api/patient/<patient_id>` | Get full patient data |
| GET | `/api/cases` | Get all cases for physician sidebar |
| GET | `/api/status/<patient_id>` | Poll for phase status |
| POST | `/api/avatar` | Generate HeyGen LiveAvatar embed |

---

## Patient Data Format

Each patient is stored as a flat JSON file at `backend/static/data/<patient_id>.json`:

```json
{
  "patient_id": "P-xxxx",
  "patient_name": "Maria Garcia",
  "language": "es",
  "condition": "Pneumonia",
  "confidence": 0.82,
  "urgency": "Critical",
  "urgency_reason": "Opacity detected in lower left lung",
  "differential_diagnosis": ["Pneumonia", "Pleural Effusion", "Atelectasis"],
  "image_url": "/files/scans/P-xxxx.png",
  "heatmap_url": "/files/heatmaps/P-xxxx_heatmap.png",
  "phase1_script": "Your scan has come through clearly...",
  "phase2_script": "Your doctor has reviewed your scan...",
  "phase1_audio_url": "/static/audio/P-xxxx_phase1.mp3",
  "phase2_audio_url": "/static/audio/P-xxxx_phase2.mp3",
  "clinical_report": "A chest X-ray analysis indicates...",
  "clinician_notes": "Patient reports chest pain",
  "physician_notes": "Recommend follow-up CT scan",
  "trials": [
    {
      "name": "REGN4461 Respiratory Trial",
      "location": "Princeton, NJ",
      "status": "RECRUITING",
      "url": "https://clinicaltrials.gov/study/NCTxxxx"
    }
  ],
  "phase": 1,
  "approved": false
}
```

---

## Repo Structure

```
medecho/
├── backend/
│   ├── app.py                  # Flask entry point
│   ├── config.py               # API key loading
│   ├── requirements.txt
│   ├── .env.example
│   ├── routes/
│   │   ├── scan.py             # POST /api/scan
│   │   ├── approve.py          # POST /api/approve/<patient_id>
│   │   ├── status.py           # GET /api/status, /api/cases
│   │   ├── patient.py          # GET /api/patient/<patient_id>
│   │   └── avatar.py           # POST /api/avatar
│   ├── medecho_model/
│   │   ├── classifier.py       # DenseNet CNN
│   │   ├── gradcam.py          # GradCAM heatmap
│   │   └── urgency.py          # Urgency classification
│   ├── services/
│   │   ├── gemini.py           # Gemini 2.5 Flash
│   │   ├── elevenlabs.py       # ElevenLabs TTS
│   │   ├── liveavatar.py       # HeyGen LiveAvatar
│   │   └── trials.py           # ClinicalTrials.gov API
│   └── static/
│       ├── scans/              # Uploaded X-rays
│       ├── heatmaps/           # GradCAM outputs
│       ├── audio/              # ElevenLabs MP3s
│       └── data/               # Patient JSONs
└── frontend/
    ├── src/
    │   ├── App.js
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Clinician.jsx
    │   │   ├── Physician.jsx
    │   │   └── Patient.jsx
    │   └── components/
    │       ├── AvatarPlayer.jsx
    │       ├── TrialCard.jsx
    │       └── LanguageSelector.jsx
    └── setupProxy.js           # Proxies /api, /static, /files → :5000
```

---

## Team

Built at **HackPrinceton Spring 2026** in 24 hours.

| Name | 
|---|
| Sanchusri Kavitha babu |
| Jane Sanjana Prasanna | 
| Arundhati | 
| Raashi | 

---

## Regeneron Track

MedEcho was built for the **Regeneron Track** at HackPrinceton 2026.

The clinical trial matching feature directly addresses Regeneron's patient identification bottleneck — surfacing eligible patients at the exact moment of diagnosis, before they leave the system.

Every physician interaction in MedEcho passively builds an investigator profile: condition specialty, patient volume, diagnostic patterns. Cross-referenced with ClinicalTrials.gov, that's a real-time site-finder built from actual clinical behavior — not spreadsheets, not KOL recommendations.

**Relevant Regeneron pipeline conditions matched:**
- Respiratory / Pulmonary
- Cardiovascular (Cardiomegaly → heart failure pipeline)
- Dermatology (skin lesion classification — next build)

[Regeneron Investigational Pipeline](https://www.regeneron.com/science/investigational-pipeline)

---

## License

MIT — see [LICENSE](LICENSE) for details.
