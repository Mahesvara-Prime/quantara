"""Pydantic schemas for the identity module (API contracts)."""

from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    """Payload for POST /auth/login."""

    # Plain str so local/dev domains (e.g. *.local) are accepted; rules layer validates shape.
    email: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1)


class UserProfile(BaseModel):
    """Public user fields returned by /auth/login (user) and /auth/me."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    email: str


class LoginResponse(BaseModel):
    """Successful login: bearer token plus embedded user summary."""

    access_token: str
    token_type: str = "bearer"
    user: UserProfile


class ProfileResponse(BaseModel):
    """GET /profile — full public profile including status."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    email: str
    is_active: bool


class UserSettingsResponse(BaseModel):
    """GET /settings — lightweight preferences stored on the user row (MVP)."""

    language: str
    notifications_enabled: bool


class UserSettingsPatch(BaseModel):
    """PATCH /settings — partial update."""

    language: str | None = None
    notifications_enabled: bool | None = None
