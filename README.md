# MedEcho 

> **Medical Results, Human Understanding.**

Under the 21st Century Cures Act (2021), patients receive their test results simultaneously with their doctor — often before the physician has read them. A patient gets a chest X-ray, goes home, opens MyChart at 11pm, and reads "pulmonary opacity suggesting possible malignancy" with no one to explain it. For non-English speakers, it's incomprehension. For everyone else, it's panic.

**MedEcho fixes that moment.**

A three-portal AI system that takes a chest X-ray from upload to plain-language explanation — in the patient's own language, delivered face-to-face by an AI avatar, before and after physician review.

---

## Resources

| Resource | Description |
|---|---|
| 📹 [Demo Video](#) | Full walkthrough of all three portals — clinician upload to patient avatar delivery |
| 📊 [Slide Deck](#) | 10-slide project overview built for the Regeneron track at HackPrinceton 2026 |
| 🏆 [Devpost](#) | HackPrinceton 2026 submission page |

---

## How It Works

```
Clinician uploads scan + symptoms + language
        ↓
DenseNet CNN (torchxrayvision) → Condition + confidence + urgency
        ↓
GradCAM → heatmap overlay at original scan resolution
        ↓
Gemini 2.5 Flash (simultaneously)
→ Clinical report for physician (always English)
→ Phase 1 script for patient (pre-approval, in patient's language)
→ Phase 2 script for patient (post-approval, in patient's language)
        ↓
ClinicalTrials.gov v2 API → live trial matching with multi-factor scoring
        ↓
ElevenLabs (eleven_multilingual_v2) → Phase 1 audio in patient's language
        ↓
Patient sees scan immediately
LiveAvatar delivers Phase 1 message in patient's language
        ↓
Physician reviews everything → adds assessment → Send to Patient
        ↓
Gemini rewrites physician assessment into plain language
ElevenLabs → Phase 2 audio generated in patient's language
LiveAvatar delivers full explanation face-to-face in patient's language
```

---

## Three Portals

### 🔬 Clinician Portal (`/clinician`)
- Upload chest X-ray or skin image
- Enter patient name, city, date of birth, symptoms, preferred language
- AI immediately generates condition, confidence score, urgency level
- GradCAM heatmap shows exactly which region drove the prediction
- ClinicalTrials.gov matching runs simultaneously with multi-factor scoring
- Gemini generates clinical report + patient scripts in the patient's language
- ElevenLabs converts Phase 1 script to audio in the patient's language
- Links to physician and patient portals generated on submission

### 👨‍⚕️ Physician Portal (`/physician`)
- Case sidebar with pending/reviewed tabs sorted by urgency
- Full dashboard: scan + GradCAM heatmap toggle
- AI findings: condition, confidence bar, differential diagnosis
- AI clinical report from Gemini
- Patient symptoms and clinician notes
- Matched clinical trials with percentage match scores (clickable → ClinicalTrials.gov)
- Add own assessment → Gemini rewrites it into plain language for the patient
- Send to Patient button transitions patient to phase 2
- PDF export via browser print

### 🧑‍🤝‍🧑 Patient Portal (`/patient/:patientId`)
- **Phase 1** (immediately after upload): LiveAvatar delivers warm, non-diagnostic message in patient's language. ElevenLabs audio autoplays. Transcript shown below.
- **Phase 2** (after physician sends assessment): ElevenLabs voice + LiveAvatar delivers full plain-language explanation. Doctor's assessment and "What This Means For You" cards appear. Trial card shown if eligible studies found.
- Polls automatically every 5 seconds for physician approval
- Supports English, Spanish, French, Hindi
- Next steps panel guides patient while waiting

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
| Geocoding | Nominatim (OpenStreetMap) |
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
- API keys for Gemini, ElevenLabs, and HeyGen LiveAvatar

### 1. Clone the repo

```bash
git clone git@github.com:Sanshiv123/MedEcho.git
cd MedEcho
```

### 2. Backend setup

```bash
python3.11 -m venv venv

# Mac/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

cd backend
pip install -r requirements.txt
```

> ⚠️ NumPy must be pinned to 1.26.4. If you see numpy/cv2 import errors run:
> ```bash
> pip uninstall numpy -y && pip install numpy==1.26.4
> ```

### 3. Environment variables

Create a `.env` file in the project root:

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

> ⚠️ On macOS, port 5000 may be taken by AirPlay Receiver. Disable it in System Settings → General → AirDrop & Handoff → AirPlay Receiver.

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
| POST | `/api/scan` | Upload scan → CNN + GradCAM + trial matching + Gemini + ElevenLabs Phase 1 |
| POST | `/api/explain` | Internal — Gemini generates clinical report + patient scripts |
| POST | `/api/approve/<patient_id>` | Physician sends assessment → Gemini rewrites + ElevenLabs Phase 2 + phase transition |
| GET | `/api/patient/<patient_id>` | Get full patient record |
| GET | `/api/cases` | Get all cases for physician sidebar |
| GET | `/api/status/<patient_id>` | Poll for phase status |
| GET | `/api/avatar` | Create LiveAvatar embed session |
| GET | `/files/<path>` | Serve static files (scans, heatmaps, audio) |

---

## Patient Data Format

Each patient is stored as a flat JSON file at `backend/static/data/<patient_id>.json`:

```json
{
  "patient_id": "P-xxxx",
  "patient_name": "Maria Garcia",
  "patient_dob": "1990-03-15",
  "patient_location": "Princeton",
  "language": "es",
  "generation": "Millennial",
  "symptoms": "chest pain, shortness of breath",
  "clinician_notes": "Patient reports chest pain for 3 days",
  "condition": "Pneumonia",
  "confidence": 0.82,
  "urgency": "Moderate",
  "urgency_reason": "Finding detected → Pneumonia",
  "differential_diagnosis": ["Pneumonia", "Pleural Effusion", "Atelectasis"],
  "image_url": "/files/scans/P-xxxx.png",
  "heatmap_url": "/files/heatmaps/P-xxxx.png",
  "clinical_report": "A chest X-ray analysis indicates...",
  "phase1_script": "Su radiografía ha llegado claramente...",
  "phase2_script": "Su médico ha revisado su radiografía...",
  "phase1_audio_url": "/files/audio/P-xxxx_phase1.mp3",
  "phase2_audio_url": "/files/audio/P-xxxx_phase2.mp3",
  "physician_notes": "Recommend follow-up CT scan in 5 days",
  "trials": [
    {
      "name": "REGN4461 Respiratory Trial",
      "location": "Princeton",
      "country": "United States",
      "status": "RECRUITING",
      "phase": "PHASE3",
      "nct_id": "NCTxxxx",
      "match_score": 74
    }
  ],
  "phase": 1
}
```

---

## Repo Structure

```
MedEcho/
├── .env                        # API keys (not committed)
├── backend/
│   ├── app.py                  # Flask entry point, blueprint registration
│   ├── config.py               # API key loading from .env
│   ├── requirements.txt
│   ├── routes/
│   │   ├── scan.py             # POST /api/scan — full pipeline
│   │   ├── explain.py          # POST /api/explain — Gemini scripts
│   │   ├── approve.py          # POST /api/approve/<patient_id>
│   │   ├── status.py           # GET /api/status, /api/cases
│   │   ├── patient.py          # GET /api/patient/<patient_id>
│   │   └── avatar.py           # GET /api/avatar — LiveAvatar embed
│   ├── medecho_model/
│   │   ├── classifier.py       # DenseNet CNN classification
│   │   └── gradcam.py          # GradCAM heatmap generation
│   ├── services/
│   │   ├── gemini.py           # Gemini 2.5 Flash — reports + scripts
│   │   ├── elevenlabs.py       # ElevenLabs TTS — multilingual audio
│   │   ├── heygen.py           # HeyGen video generation (legacy)
│   │   ├── liveavatar.py       # HeyGen LiveAvatar embed sessions
│   │   └── trials.py           # ClinicalTrials.gov API + scoring
│   ├── utils/
│   │   └── language.py         # Language code → Gemini instruction
│   ├── data/
│   │   └── medical_context.json # Condition context for Gemini prompts
│   └── static/
│       ├── scans/              # Uploaded X-rays
│       ├── heatmaps/           # GradCAM overlays
│       ├── audio/              # ElevenLabs MP3s
│       └── data/               # Patient JSON records
└── frontend/
    ├── src/
    │   ├── App.js              # Routes + theme toggle
    │   ├── setupProxy.js       # Proxies /api, /files → :5000
    │   ├── index.css           # Global styles, glass theme, animations
    │   ├── pages/
    │   │   ├── Landing.jsx     # Marketing page + role selector
    │   │   ├── Clinician.jsx   # Scan upload portal
    │   │   ├── Physician.jsx   # Review + approval portal
    │   │   └── Patient.jsx     # Results + avatar portal
    │   └── components/
    │       ├── AvatarPlayer.jsx      # LiveAvatar iframe embed
    │       ├── MedEchoLogo.jsx       # Animated SVG ECG→heart logo
    │       ├── TrialCard.jsx         # Patient-facing trial notification
    │       ├── TranscriptPanel.jsx   # Phase 1 script display
    │       └── LanguageSelector.jsx  # Language display
    └── public/
        └── index.html
```

---

## Team

Built at **HackPrinceton Spring 2026** in 24 hours.

| Name |
|---|
| Jane Sanjana Prasanna |
| Sanchusri Kavitha Babu |
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
