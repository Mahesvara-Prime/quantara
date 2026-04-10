/**
 * Profil utilisateur — GET /api/v1/profile (auth Bearer).
 */

import { profileApi } from "../../../shared/api";
import type { ProfileDto } from "../../../shared/api/types/backend";

export async function getProfile(): Promise<ProfileDto> {
  return profileApi.getProfile();
}
