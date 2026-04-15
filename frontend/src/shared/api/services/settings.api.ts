import { apiV1Request } from "../httpClient";
import type { UserSettingsDto, UserSettingsPatchDto } from "../types/backend";

/** GET /settings */
export async function getSettings(): Promise<UserSettingsDto> {
  return apiV1Request<UserSettingsDto>("/settings", { method: "GET" });
}

/** PATCH /settings */
export async function patchSettings(body: UserSettingsPatchDto): Promise<UserSettingsDto> {
  return apiV1Request<UserSettingsDto>("/settings", {
    method: "PATCH",
    jsonBody: body,
  });
}
