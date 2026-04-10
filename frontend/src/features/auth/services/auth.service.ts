/**
 * Service d'authentification (couche features).
 *
 * - Mode API (`VITE_API_BASE_URL`) : login + JWT + profil alignés sur FastAPI.
 * - Sans URL : le contexte peut s'appuyer sur `auth.mock` (développement hors backend).
 */

import {
  authApi,
  clearAccessToken,
  isApiConfigured,
  setAccessToken,
} from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { UserProfileDto } from "../../../shared/api/types/backend";

/** Utilisateur courant pour l'UI (camelCase). */
export type AuthSessionUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

export class AuthInvalidCredentialsError extends Error {
  constructor() {
    super("Identifiants invalides");
    this.name = "AuthInvalidCredentialsError";
  }
}

export function mapProfileToSession(dto: UserProfileDto): AuthSessionUser {
  return {
    id: dto.id,
    firstName: dto.first_name,
    lastName: dto.last_name,
    email: dto.email,
  };
}

/** Connexion backend : stocke le JWT et retourne le profil embarqué dans la réponse. */
export async function loginWithBackend(
  email: string,
  password: string,
): Promise<AuthSessionUser> {
  try {
    const res = await authApi.login({
      email: email.trim(),
      password: password.trim(),
    });
    setAccessToken(res.access_token);
    return mapProfileToSession(res.user);
  } catch (e) {
    if (
      e instanceof ApiHttpError &&
      (e.status === 400 || e.status === 401 || e.status === 403 || e.status === 422)
    ) {
      throw new AuthInvalidCredentialsError();
    }
    throw e;
  }
}

/** Profil courant via Bearer (token déjà en localStorage). */
export async function getCurrentUser(): Promise<AuthSessionUser> {
  const me = await authApi.getMe();
  return mapProfileToSession(me);
}

export function clearBackendSession(): void {
  clearAccessToken();
}

export { isApiConfigured };
