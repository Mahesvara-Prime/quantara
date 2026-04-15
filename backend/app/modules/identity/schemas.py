"""Pydantic schemas for the identity module (API contracts)."""

from pydantic import BaseModel, ConfigDict, Field


class LoginRequest(BaseModel):
    """Payload for POST /auth/login."""

    # Plain str so local/dev domains (e.g. *.local) are accepted; rules layer validates shape.
    email: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1)


class RegisterRequest(BaseModel):
    """Payload for POST /auth/register — creates user and returns same shape as login."""

    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=8, max_length=256)


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


class ProfilePatch(BaseModel):
    """PATCH /profile — partial update; at least one field required (enforced in service)."""

    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    email: str | None = Field(default=None, max_length=255)


class UserSettingsResponse(BaseModel):
    """GET /settings — lightweight preferences stored on the user row (MVP)."""

    language: str
    notifications_enabled: bool


class UserSettingsPatch(BaseModel):
    """PATCH /settings — partial update."""

    language: str | None = None
    notifications_enabled: bool | None = None


class PasswordChangeRequest(BaseModel):
    """POST /auth/password-change/request — authenticated; email sends confirmation link."""

    current_password: str = Field(min_length=1, max_length=256)
    new_password: str = Field(min_length=8, max_length=256)
    new_password_confirm: str = Field(min_length=8, max_length=256)


class PasswordChangeConfirm(BaseModel):
    """POST /auth/password-change/confirm — public; completes change after email link."""

    token: str = Field(min_length=16, max_length=512)
    new_password: str = Field(min_length=8, max_length=256)
    new_password_confirm: str = Field(min_length=8, max_length=256)


class StatusMessageResponse(BaseModel):
    """Simple JSON message for auth flows."""

    message: str


class ForgotPasswordRequest(BaseModel):
    """POST /auth/password-reset/request — public; always same response if email shape is valid."""

    email: str = Field(min_length=1, max_length=255)


class PasswordResetConfirm(BaseModel):
    """POST /auth/password-reset/confirm — public; token from forgot-password email."""

    token: str = Field(min_length=16, max_length=512)
    new_password: str = Field(min_length=8, max_length=256)
    new_password_confirm: str = Field(min_length=8, max_length=256)
