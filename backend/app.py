from flask import Flask, send_from_directory
from flask_cors import CORS
import os
from routes.scan import scan_bp
from routes.explain import explain_bp
from routes.approve import approve_bp
from routes.status import status_bp
from routes.patient import patient_bp
from routes.avatar import avatar_bp

app = Flask(__name__)
CORS(app, origins="*", allow_headers=["Content-Type"], methods=["GET", "POST", "OPTIONS"])

app.register_blueprint(scan_bp)
app.register_blueprint(explain_bp)
app.register_blueprint(approve_bp)
app.register_blueprint(status_bp)
app.register_blueprint(patient_bp)
app.register_blueprint(avatar_bp)

@app.route('/files/<path:filename>')
def serve_file(filename):
    static_dir = os.path.join(os.path.dirname(__file__), 'static')
    return send_from_directory(static_dir, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)