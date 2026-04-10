/**
 * Stockage minimal du JWT (MVP).
 *
 * Brancher le login réel : après `authApi.login`, appeler `setAccessToken`.
 * `RequireAuth` / le router pourront lire ce token quand vous brancherez les pages.
 */
const STORAGE_KEY = "quantara_access_token";

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearAccessToken(): void {
  setAccessToken(null);
}
