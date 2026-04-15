"""FastAPI application entrypoint for the Quantara backend.

This file only wires technical concerns (app creation, middleware, routers).
Business logic must live inside module services, not in this entrypoint.
"""

# Register every SQLAlchemy model module up front so string-based relationships resolve.
from app.modules.education import models as _education_models  # noqa: F401
from app.modules.progress import models as _progress_models  # noqa: F401
from app.modules.simulation import models as _simulation_models  # noqa: F401

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_v1_router
from app.core.config import settings


def _cors_params() -> tuple[list[str], bool]:
    """Return (allow_origins, allow_credentials). Wildcard * disables credentials."""
    raw = settings.cors_allowed_origins.strip()
    if raw == "*":
        return ["*"], False
    origins = [o.strip() for o in raw.split(",") if o.strip()]
    if not origins:
        origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
    return origins, True


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""
    app = FastAPI(
        title=settings.app_name,
        description="Quantara backend MVP API",
        version=settings.app_version,
    )

    cors_origins, cors_credentials = _cors_params()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=cors_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health", tags=["technical"])
    def health_check() -> dict[str, str]:
        """Simple health endpoint used by infra and local checks."""
        return {"status": "ok"}

    app.include_router(api_v1_router, prefix="/api/v1")
    return app


app = create_app()
