"""
Create a demo Quantara user if it does not already exist.

Run from the `backend` directory:

    python -m scripts.seed_test_user

Requires PostgreSQL reachable via app settings (see app.core.config).
Idempotent: skips when the email is already registered.

Credentials default to local-dev values; override with QUANTARA_SEED_* (see .env.example).
"""

from __future__ import annotations

import sys
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from sqlalchemy.orm import Session

from app.db.session import SessionLocal

from app.modules.education import models as _education_models  # noqa: F401
from app.modules.progress import models as _progress_models  # noqa: F401
from app.modules.simulation import models as _simulation_models  # noqa: F401

from app.modules.identity import repository, rules
from app.modules.identity.models import User

from scripts.seed_defaults import load_seed_user_config


def seed_test_user(session: Session) -> None:
    """Insert the seed user when no row exists for the configured email."""
    cfg = load_seed_user_config()
    normalized = rules.normalize_email(cfg.email)
    if repository.get_user_by_email(session, normalized) is not None:
        print(f"User already exists: {normalized}")
        return

    user = User(
        first_name=cfg.first_name,
        last_name=cfg.last_name,
        email=normalized,
        hashed_password=rules.hash_password(cfg.password),
        language="fr",
        notifications_enabled=True,
        is_active=True,
    )
    session.add(user)
    session.commit()
    print(f"Created seed user: {normalized} (language=fr, notifications on)")


def main() -> None:
    db = SessionLocal()
    try:
        seed_test_user(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
