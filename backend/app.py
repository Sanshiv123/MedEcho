# backend/app.py
# Main Flask application — both pairs add their routes here

from flask import Flask
from backend.routes.explain import explain_bp
from backend.routes.approve import approve_bp

app = Flask(__name__)

# Register Pair 2 Person A routes
app.register_blueprint(explain_bp)
app.register_blueprint(approve_bp)

if __name__ == "__main__":
    app.run(debug=True, port=5000)