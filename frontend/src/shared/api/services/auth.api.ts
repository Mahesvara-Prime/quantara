import { apiV1Request } from "../httpClient";
import type {
  ForgotPasswordRequestDto,
  LoginRequestDto,
  LoginResponseDto,
  PasswordChangeConfirmDto,
  PasswordChangeRequestDto,
  PasswordResetConfirmDto,
  RegisterRequestDto,
  StatusMessageDto,
  UserProfileDto,
} from "../types/backend";

/** POST /auth/register */
export async function register(body: RegisterRequestDto): Promise<LoginResponseDto> {
  return apiV1Request<LoginResponseDto>("/auth/register", {
    method: "POST",
    jsonBody: body,
    token: null,
  });
}

/** POST /auth/login */
export async function login(body: LoginRequestDto): Promise<LoginResponseDto> {
  return apiV1Request<LoginResponseDto>("/auth/login", {
    method: "POST",
    jsonBody: body,
    token: null,
  });
}

/** GET /auth/me */
export async function getMe(): Promise<UserProfileDto> {
  return apiV1Request<UserProfileDto>("/auth/me", { method: "GET" });
}

/** POST /auth/password-change/request (Bearer) */
export async function requestPasswordChange(
  body: PasswordChangeRequestDto,
): Promise<StatusMessageDto> {
  return apiV1Request<StatusMessageDto>("/auth/password-change/request", {
    method: "POST",
    jsonBody: body,
  });
}

/** POST /auth/password-change/confirm (public) */
export async function confirmPasswordChange(
  body: PasswordChangeConfirmDto,
): Promise<StatusMessageDto> {
  return apiV1Request<StatusMessageDto>("/auth/password-change/confirm", {
    method: "POST",
    jsonBody: body,
    token: null,
  });
}

/** POST /auth/password-reset/request (public) */
export async function requestPasswordReset(body: ForgotPasswordRequestDto): Promise<StatusMessageDto> {
  return apiV1Request<StatusMessageDto>("/auth/password-reset/request", {
    method: "POST",
    jsonBody: body,
    token: null,
  });
}

/** POST /auth/password-reset/confirm (public) */
export async function confirmPasswordReset(body: PasswordResetConfirmDto): Promise<StatusMessageDto> {
  return apiV1Request<StatusMessageDto>("/auth/password-reset/confirm", {
    method: "POST",
    jsonBody: body,
    token: null,
  });
}
