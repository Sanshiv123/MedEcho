import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
HEYGEN_API_KEY = os.getenv('HEYGEN_API_KEY')
FLASK_ENV = os.getenv('FLASK_ENV', 'development')