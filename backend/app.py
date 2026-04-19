# backend/app.py
# Main Flask application entry point for MedEcho.
#
# Registers all route blueprints and configures CORS for the React
# frontend running on localhost:3000.
#
# Static files (scans, heatmaps, audio) are served via the /files route
# which proxies through to the React dev server via setupProxy.js.
#
# Route overview:
#   /api/scan          — POST  — clinician uploads scan, triggers full pipeline
#   /api/explain       — POST  — internal: Gemini generates clinical + patient scripts
#   /api/approve/:id   — POST  — physician sends assessment to patient
#   /api/patient/:id   — GET   — fetch patient record (polled by patient portal)
#   /api/status/:id    — GET   — lightweight phase check
#   /api/cases         — GET   — list all patient cases (future physician dashboard)
#   /api/avatar        — GET   — create LiveAvatar embed session
#   /files/<path>      — GET   — serve static files (scans, heatmaps, audio)

from flask import Flask, send_from_directory
from flask_cors import CORS
import os

from routes.scan import scan_bp
from routes.explain import explain_bp
from routes.approve import approve_bp
from routes.status import status_bp
from routes.patient import patient_bp
from routes.avatar import avatar_bp

# ---------------------------------------------------------------------------
# App initialization
# ---------------------------------------------------------------------------
app = Flask(__name__)

# Allow all origins — appropriate for hackathon/development
# In production, restrict origins to the deployed frontend domain
CORS(
    app,
    origins="*",
    allow_headers=["Content-Type"],
    methods=["GET", "POST", "OPTIONS"]
)

# ---------------------------------------------------------------------------
# Blueprint registration
# Each blueprint owns a set of related routes and is defined in routes/
# ---------------------------------------------------------------------------
app.register_blueprint(scan_bp)      # /api/scan
app.register_blueprint(explain_bp)   # /api/explain
app.register_blueprint(approve_bp)   # /api/approve
app.register_blueprint(status_bp)    # /api/status, /api/cases
app.register_blueprint(patient_bp)   # /api/patient
app.register_blueprint(avatar_bp)    # /api/avatar


# ---------------------------------------------------------------------------
# Static file serving
# Serves files from backend/static/ under the /files path prefix.
# Proxied from the React dev server via setupProxy.js:
#   /files/scans/<patient_id>.png     — original uploaded scan
#   /files/heatmaps/<uuid>.png        — GradCAM heatmap overlay
#   /files/audio/<patient_id>_phase1.mp3 — ElevenLabs audio (if enabled)
# ---------------------------------------------------------------------------
@app.route('/files/<path:filename>')
def serve_file(filename: str):
    """
    Serves static files from the backend/static/ directory.

    Args:
        filename: Relative path within static/ (e.g. "scans/P-xxxx.png")

    Returns:
        The requested file with appropriate Content-Type headers
    """
    static_dir = os.path.join(os.path.dirname(__file__), 'static')
    return send_from_directory(static_dir, filename)


# ---------------------------------------------------------------------------
# Development server
# Run with: python3 app.py
# In production, use a WSGI server (gunicorn, uWSGI) instead.
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    app.run(debug=True, port=5000)