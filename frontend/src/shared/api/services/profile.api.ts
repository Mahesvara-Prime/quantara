import { apiV1Request } from "../httpClient";
import type { ProfileDto } from "../types/backend";

/** GET /profile */
export async function getProfile(): Promise<ProfileDto> {
  return apiV1Request<ProfileDto>("/profile", { method: "GET" });
}
