from flask import Flask
from flask_cors import CORS
from routes.scan import scan_bp
from routes.explain import explain_bp
from routes.approve import approve_bp
from routes.status import status_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(scan_bp)
app.register_blueprint(explain_bp)
app.register_blueprint(approve_bp)
app.register_blueprint(status_bp)

if __name__ == '__main__':
    app.run(debug=True, port=5000)