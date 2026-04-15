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


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""
    app = FastAPI(
        title=settings.app_name,
        description="Quantara backend MVP API",
        version=settings.app_version,
    )

    # CORS is open for now to simplify early frontend/backend integration.
    # This should be tightened with environment-specific origins later.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
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
