# backend/services/liveavatar.py
# Creates LiveAvatar embed sessions for the patient portal.
#
# LiveAvatar provides real-time streaming avatar sessions via an iframe embed.
# Each session is created with a greeting (the Gemini-generated patient script)
# and knowledge (full patient context for follow-up Q&A).
#
# Two modes:
# - Sandbox: Uses the Wayne avatar (no credits consumed, limited behavior)
#            Only for development/testing
# - Production: Uses the MedEcho female avatar (consumes credits)
#               Full context and knowledge support
#
# The embed URL is loaded as an iframe in the patient portal frontend.
# Sessions are stateless — a new embed is created each time the patient
# portal loads or transitions between phases.

import requests
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import LIVEAVATAR_API_KEY, LIVEAVATAR_CONTEXT_ID

# LiveAvatar API base URL
LIVEAVATAR_BASE = "https://api.liveavatar.com"

# ---------------------------------------------------------------------------
# Avatar IDs
# Sandbox: Wayne avatar — only avatar available in sandbox mode, no credits
# Production: MedEcho female avatar — configured in LiveAvatar dashboard
# ---------------------------------------------------------------------------
PRODUCTION_AVATAR_ID = "07faa1c4-b7e1-4d26-a38a-337364dee160"  # MedEcho Echo (female)
SANDBOX_AVATAR_ID = "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a"      # Wayne (sandbox only)


def create_embed(
    is_sandbox: bool = False,
    greeting: str = None,
    knowledge: str = None
) -> str | None:
    """
    Creates a LiveAvatar embed session and returns the embed URL.

    The embed URL is loaded as an iframe in the patient portal. Each call
    creates a fresh session — sessions are not reused between page loads.

    Args:
        is_sandbox: If True, uses the Wayne sandbox avatar (no credits).
                    If False, uses the production female avatar (uses credits).
        greeting:   The opening message the avatar speaks when the session starts.
                    Should be the Gemini-generated phase 1 or phase 2 script.
        knowledge:  Patient context string passed to the avatar's LLM for
                    answering follow-up questions. Includes condition, scripts,
                    physician assessment, and patient metadata.

    Returns:
        Embed URL string (e.g. "https://embed.liveavatar.com/v1/xxxx")
        None if the API call failed
    """

    # Step 1: Select avatar based on mode
    avatar_id = SANDBOX_AVATAR_ID if is_sandbox else PRODUCTION_AVATAR_ID

    # Step 2: Build request headers
    headers = {
        "X-API-KEY": LIVEAVATAR_API_KEY,
        "Content-Type": "application/json"
    }

    # Step 3: Build payload
    # context_id points to the MedEcho Echo context configured in the
    # LiveAvatar dashboard with the avatar's persona and behavior rules
    payload = {
        "avatar_id": avatar_id,
        "context_id": LIVEAVATAR_CONTEXT_ID,
        "is_sandbox": is_sandbox
    }

    # Step 4: Attach greeting and knowledge if provided
    # greeting: spoken by avatar immediately on session start
    # knowledge: fed into the LLM context for answering patient questions
    if greeting:
        payload["greeting"] = greeting
    if knowledge:
        payload["knowledge"] = knowledge

    # Step 5: Call LiveAvatar API to create the embed session
    response = requests.post(
        f"{LIVEAVATAR_BASE}/v2/embeddings",
        json=payload,
        headers=headers
    )
    data = response.json()
    print(f"[LiveAvatar] Embed response: {data.get('message', data)}")

    # Step 6: Return embed URL on success, None on failure
    if data.get("code") == 1000:
        return data["data"]["url"]

    print(f"[LiveAvatar] Failed to create embed: {data}")
    return None