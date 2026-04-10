"""add user language and notifications preferences

Revision ID: a1b2c3d4e5f6
Revises: 85805ee9fb2b
Create Date: 2026-04-09

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "85805ee9fb2b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("language", sa.String(length=10), server_default=sa.text("'en'"), nullable=False),
    )
    op.add_column(
        "users",
        sa.Column(
            "notifications_enabled",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "notifications_enabled")
    op.drop_column("users", "language")
