/**
 * Configuration API centralisée.
 *
 * Définir `VITE_API_BASE_URL` (ex. http://127.0.0.1:8000) pour activer les appels réels.
 * Sans cette variable, l’app continue d’utiliser les mocks existants.
 */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
  return raw.replace(/\/$/, "");
}

/** True lorsque le frontend peut joindre le backend Quantara. */
export function isApiConfigured(): boolean {
  return getApiBaseUrl().length > 0;
}

/** Préfixe versionné aligné sur le guide backend (`/api/v1`). */
export const API_V1_PREFIX = "/api/v1";
