"""Transactional email helpers (optional Resend; otherwise log link for dev)."""

from __future__ import annotations

import logging

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

RESEND_API_URL = "https://api.resend.com/emails"


def send_password_change_confirmation_email(*, to_email: str, confirm_url: str) -> None:
    """Send plain-text confirmation email, or log the URL if Resend is not configured."""
    subject = "Confirmer le changement de mot de passe — Quantara"
    text = (
        "Bonjour,\n\n"
        f"Pour confirmer le changement de ton mot de passe, ouvre ce lien "
        f"(valide environ 1 heure) :\n{confirm_url}\n\n"
        "Si tu n’as pas demandé ce changement, ignore ce message.\n"
    )

    api_key = settings.resend_api_key
    if not api_key or not api_key.strip():
        logger.warning(
            "RESEND_API_KEY absent — lien de confirmation (copie-colle pour test) : %s",
            confirm_url,
        )
        return

    with httpx.Client(timeout=20.0) as client:
        res = client.post(
            RESEND_API_URL,
            headers={
                "Authorization": f"Bearer {api_key.strip()}",
                "Content-Type": "application/json",
            },
            json={
                "from": settings.resend_from_email,
                "to": [to_email.strip().lower()],
                "subject": subject,
                "text": text,
            },
        )
    if res.status_code >= 400:
        logger.error(
            "Resend error %s: %s",
            res.status_code,
            res.text[:500],
        )
        raise RuntimeError("Échec d’envoi de l’e-mail de confirmation.")


def send_password_reset_email(*, to_email: str, reset_url: str) -> None:
    """Send forgot-password reset link (plain text), or log URL if Resend is not configured."""
    subject = "Réinitialiser ton mot de passe — Quantara"
    text = (
        "Bonjour,\n\n"
        f"Pour choisir un nouveau mot de passe, ouvre ce lien "
        f"(valide environ 1 heure) :\n{reset_url}\n\n"
        "Si tu n’as pas demandé cette réinitialisation, ignore ce message.\n"
    )

    api_key = settings.resend_api_key
    if not api_key or not api_key.strip():
        logger.warning(
            "RESEND_API_KEY absent — lien de réinitialisation (copie-colle pour test) : %s",
            reset_url,
        )
        return

    with httpx.Client(timeout=20.0) as client:
        res = client.post(
            RESEND_API_URL,
            headers={
                "Authorization": f"Bearer {api_key.strip()}",
                "Content-Type": "application/json",
            },
            json={
                "from": settings.resend_from_email,
                "to": [to_email.strip().lower()],
                "subject": subject,
                "text": text,
            },
        )
    if res.status_code >= 400:
        logger.error(
            "Resend error %s: %s",
            res.status_code,
            res.text[:500],
        )
        raise RuntimeError("Échec d’envoi de l’e-mail de réinitialisation.")
