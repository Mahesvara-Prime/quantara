/**
 * Profil utilisateur — GET /api/v1/profile (auth Bearer).
 */

import { profileApi } from "../../../shared/api";
import type { ProfileDto, ProfilePatchRequestDto } from "../../../shared/api/types/backend";

export async function getProfile(): Promise<ProfileDto> {
  return profileApi.getProfile();
}

export async function updateProfile(patch: ProfilePatchRequestDto): Promise<ProfileDto> {
  return profileApi.patchProfile(patch);
}
