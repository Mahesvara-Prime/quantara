"""Pure helpers for identity: normalization, password crypto, JWT helpers.

No database access here — only deterministic logic used by the service layer.
"""

from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
import jwt


def normalize_email(email: str) -> str:
    """Lowercase and strip surrounding whitespace for consistent lookups."""
    return email.strip().lower()


ALLOWED_LANGUAGES: frozenset[str] = frozenset({"en", "fr"})


def normalize_language(code: str) -> str:
    """Validate and return a supported locale code (MVP: en, fr)."""
    c = code.strip().lower()
    if c not in ALLOWED_LANGUAGES:
        allowed = ", ".join(sorted(ALLOWED_LANGUAGES))
        raise ValueError(f"Unsupported language. Allowed: {allowed}")
    return c


def validate_register_input(
    first_name: str,
    last_name: str,
    email: str,
    password: str,
) -> tuple[bool, str | None]:
    """
    Registration validation: non-empty names, email shape, password strength (MVP).

    Returns (ok, error_message) suitable for 400 responses.
    """
    fn = (first_name or "").strip()
    ln = (last_name or "").strip()
    if not fn:
        return False, "First name is required."
    if not ln:
        return False, "Last name is required."
    if len(fn) > 100 or len(ln) > 100:
        return False, "Name fields must be at most 100 characters."
    ok, err = validate_login_input(email, password)
    if not ok:
        return False, err
    if len(password) < 8:
        return False, "Password must be at least 8 characters."
    return True, None


def validate_email_format(email: str) -> tuple[bool, str | None]:
    """Email shape only (no password). Returns (ok, error_message) for 400 responses."""
    if not email or not email.strip():
        return False, "Email is required."
    normalized = normalize_email(email)
    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", normalized):
        return False, "Invalid email format."
    return True, None


def validate_login_input(email: str, password: str) -> tuple[bool, str | None]:
    """
    Basic client-side-style validation before hitting the database.

    Returns (ok, error_message). Error message is suitable for 400 responses.
    """
    if not email or not email.strip():
        return False, "Email is required."
    if not password:
        return False, "Password is required."
    # Lightweight format check after normalize (EmailStr on API handles most cases).
    normalized = normalize_email(email)
    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", normalized):
        return False, "Invalid email format."
    return True, None


def can_authenticate_user(is_active: bool) -> bool:
    """Whether a user record is allowed to sign in."""
    return is_active


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password for storage in users.hashed_password (bcrypt)."""
    digest = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt())
    return digest.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash string."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def create_access_token(
    *,
    subject_user_id: int,
    secret: str,
    algorithm: str,
    expires_minutes: int,
) -> str:
    """Build a signed JWT with subject = user id (string) and exp claim."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    payload: dict[str, Any] = {
        "sub": str(subject_user_id),
        "exp": expire,
    }
    return jwt.encode(payload, secret, algorithm=algorithm)


def decode_access_token(token: str, *, secret: str, algorithms: list[str]) -> dict[str, Any]:
    """
    Decode and validate a JWT. Raises jwt.PyJWTError subclasses on failure.

    Caller should handle jwt.ExpiredSignatureError and jwt.InvalidTokenError.
    """
    return jwt.decode(token, secret, algorithms=algorithms)


def user_id_from_token_payload(payload: dict[str, Any]) -> int:
    """Extract user id from validated JWT payload."""
    sub = payload.get("sub")
    if sub is None:
        raise ValueError("Token payload missing 'sub'")
    return int(sub)
