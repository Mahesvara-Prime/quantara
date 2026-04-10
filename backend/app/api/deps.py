"""Shared FastAPI dependencies (database session, authentication)."""

from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.session import get_db_session
from app.modules.identity import service as identity_service
from app.modules.identity.models import User
from app.modules.dashboard.service import DashboardService
from app.modules.insights.service import InsightsService
from app.modules.market_data.service import MarketDataService, get_market_data_service
from app.modules.simulation.service import SimulationService

# Expects `Authorization: Bearer <jwt>`
bearer_scheme = HTTPBearer(auto_error=True)


def get_current_user(
    db: Annotated[Session, Depends(get_db_session)],
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
) -> User:
    """
    Resolve the authenticated user from a Bearer JWT.

    Raises 401 if the token is missing/invalid/expired or the user id is unknown.
    """
    return identity_service.get_user_from_access_token(db, credentials.credentials)


def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Same as get_current_user but rejects inactive accounts with 403."""
    return identity_service.require_active_user(current_user)


def get_simulation_service(
    market_data: Annotated[MarketDataService, Depends(get_market_data_service)],
) -> SimulationService:
    """Simulation engine with injected market data pricing."""
    return SimulationService(market_data=market_data)


def get_insights_service(
    market_data: Annotated[MarketDataService, Depends(get_market_data_service)],
) -> InsightsService:
    """Insights use simulation + progress; market data is required for portfolio mark-to-market."""
    return InsightsService(market_data=market_data)


def get_dashboard_service(
    market_data: Annotated[MarketDataService, Depends(get_market_data_service)],
) -> DashboardService:
    """Dashboard aggregates portfolio, progress, trades, and market list."""
    return DashboardService(market_data=market_data)
