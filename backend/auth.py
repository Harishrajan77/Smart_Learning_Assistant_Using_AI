import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


SECRET_KEY = os.getenv("APP_SECRET_KEY", "change-me-for-production")
TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7


def hash_password(password: str, salt: str | None = None) -> str:
    salt_value = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_value.encode("utf-8"), 120000)
    return f"{salt_value}${base64.urlsafe_b64encode(digest).decode('utf-8')}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        salt, _ = password_hash.split("$", 1)
    except ValueError:
        return False
    expected = hash_password(password, salt)
    return hmac.compare_digest(expected, password_hash)


def create_access_token(user_id: int, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": int(time.time()) + TOKEN_TTL_SECONDS,
    }
    payload_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    payload_encoded = base64.urlsafe_b64encode(payload_bytes).decode("utf-8").rstrip("=")
    signature = hmac.new(SECRET_KEY.encode("utf-8"), payload_encoded.encode("utf-8"), hashlib.sha256).digest()
    signature_encoded = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")
    return f"{payload_encoded}.{signature_encoded}"


def decode_access_token(token: str) -> dict:
    try:
        payload_encoded, signature_encoded = token.split(".", 1)
        expected_signature = hmac.new(SECRET_KEY.encode("utf-8"), payload_encoded.encode("utf-8"), hashlib.sha256).digest()
        actual_signature = base64.urlsafe_b64decode(signature_encoded + "=" * (-len(signature_encoded) % 4))
        if not hmac.compare_digest(expected_signature, actual_signature):
            raise ValueError("Invalid token signature.")

        payload_bytes = base64.urlsafe_b64decode(payload_encoded + "=" * (-len(payload_encoded) % 4))
        payload = json.loads(payload_bytes.decode("utf-8"))
        if int(payload.get("exp", 0)) < int(time.time()):
            raise ValueError("Session expired.")
        return payload
    except Exception as exc:
        raise ValueError("Invalid authentication token.") from exc
