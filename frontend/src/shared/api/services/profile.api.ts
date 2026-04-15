import { apiV1Request } from "../httpClient";
import type { ProfileDto, ProfilePatchRequestDto } from "../types/backend";

/** GET /profile */
export async function getProfile(): Promise<ProfileDto> {
  return apiV1Request<ProfileDto>("/profile", { method: "GET" });
}

/** PATCH /profile */
export async function patchProfile(body: ProfilePatchRequestDto): Promise<ProfileDto> {
  return apiV1Request<ProfileDto>("/profile", { method: "PATCH", jsonBody: body });
}
