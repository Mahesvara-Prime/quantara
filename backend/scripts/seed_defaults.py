"""Defaults for seed scripts — override with QUANTARA_SEED_* environment variables.

Never commit real credentials. For production or shared deployments, set strong
values in the environment (see backend/.env.example).
"""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class SeedUserConfig:
    first_name: str
    last_name: str
    email: str
    password: str


def load_seed_user_config() -> SeedUserConfig:
    return SeedUserConfig(
        first_name=os.environ.get("QUANTARA_SEED_FIRST_NAME", "Dev").strip(),
        last_name=os.environ.get("QUANTARA_SEED_LAST_NAME", "User").strip(),
        email=os.environ.get("QUANTARA_SEED_EMAIL", "dev@example.local").strip(),
        password=os.environ.get("QUANTARA_SEED_PASSWORD", "ChangeMeDevOnly123!"),
    )
