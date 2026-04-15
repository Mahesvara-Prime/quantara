/**
 * Notes d’intégration MVP.
 *
 * `VITE_API_BASE_URL` doit pointer vers l’API (ex. http://127.0.0.1:8000). Sans cette variable,
 * l’auth peut retomber sur le mock local (`auth.mock`) pour le login uniquement.
 *
 * Les services HTTP sont sous `shared/api/services/*` et `apiV1Request`.
 */

export { isApiConfigured, getApiBaseUrl } from "./config";
