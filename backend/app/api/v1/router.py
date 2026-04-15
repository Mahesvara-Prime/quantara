"""Central API v1 router.

Domain routers (auth, assets, simulation, etc.) will be included here
progressively in the next implementation blocks.
"""

from fastapi import APIRouter

from app.api.v1 import (
    assets,
    auth,
    courses,
    dashboard,
    insights,
    lessons,
    portfolio,
    profile,
    progress,
    settings,
    simulation,
    trades,
)

api_v1_router = APIRouter()
api_v1_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_v1_router.include_router(assets.router, prefix="/assets", tags=["assets"])
api_v1_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_v1_router.include_router(lessons.router, prefix="/lessons", tags=["lessons"])
api_v1_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_v1_router.include_router(simulation.router, prefix="/simulation", tags=["simulation"])
api_v1_router.include_router(portfolio.router, prefix="/portfolio", tags=["portfolio"])
api_v1_router.include_router(trades.router, prefix="/trades", tags=["trades"])
api_v1_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_v1_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_v1_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_v1_router.include_router(settings.router, prefix="/settings", tags=["settings"])
