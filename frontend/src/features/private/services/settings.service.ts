/**
 * Préférences — GET/PATCH /api/v1/settings (auth Bearer).
 */

import { settingsApi } from "../../../shared/api";
import type { UserSettingsDto, UserSettingsPatchDto } from "../../../shared/api/types/backend";

export async function getSettings(): Promise<UserSettingsDto> {
  return settingsApi.getSettings();
}

export async function updateSettings(
  payload: UserSettingsPatchDto,
): Promise<UserSettingsDto> {
  return settingsApi.patchSettings(payload);
}
