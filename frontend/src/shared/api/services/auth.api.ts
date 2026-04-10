import { apiV1Request } from "../httpClient";
import type { LoginRequestDto, LoginResponseDto, UserProfileDto } from "../types/backend";

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
