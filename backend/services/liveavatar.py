import requests
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import LIVEAVATAR_API_KEY, LIVEAVATAR_CONTEXT_ID

LIVEAVATAR_BASE = "https://api.liveavatar.com"
SANDBOX_AVATAR_ID = "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a"

def create_embed(is_sandbox=False, greeting=None):
    headers = {
        "X-API-KEY": LIVEAVATAR_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "avatar_id": SANDBOX_AVATAR_ID,
        "context_id": LIVEAVATAR_CONTEXT_ID,
        "is_sandbox": is_sandbox
    }
    if greeting:
        payload["greeting"] = greeting
    response = requests.post(
        f"{LIVEAVATAR_BASE}/v2/embeddings",
        json=payload,
        headers=headers
    )
    data = response.json()
    print(f"LiveAvatar embed response: {data}")
    if data.get("code") == 1000:
        return data["data"]["url"]
    return None