import { API_V1_PREFIX, getApiBaseUrl } from "./config";
import { getAccessToken } from "./authToken";

/** Erreur HTTP avec statut et corps brut ou message extrait. */
export class ApiHttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: string,
  ) {
    super(message);
    this.name = "ApiHttpError";
  }
}

function parseDetail(body: string): string {
  try {
    const j = JSON.parse(body) as { detail?: unknown };
    if (typeof j.detail === "string") return j.detail;
    if (Array.isArray(j.detail)) {
      return j.detail
        .map((x) => (typeof x === "object" && x && "msg" in x ? String((x as { msg: string }).msg) : String(x)))
        .join("; ");
    }
  } catch {
    /* ignore */
  }
  return body.slice(0, 200);
}

export type RequestOptions = Omit<RequestInit, "body"> & {
  /** Surcharge du token (sinon lecture depuis le stockage). */
  token?: string | null;
  /** Corps JSON sérialisé automatiquement. */
  jsonBody?: unknown;
};

/**
 * Appel HTTP vers `/api/v1/...` avec JSON par défaut.
 * À utiliser uniquement si `isApiConfigured()` est true.
 */
export async function apiV1Request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("VITE_API_BASE_URL is not set; cannot call the backend.");
  }

  const url = `${base}${API_V1_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;
  const { token, jsonBody, headers: hdrs, ...rest } = options;
  const headers = new Headers(hdrs);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  let body: BodyInit | undefined;
  if (jsonBody !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(jsonBody);
  }

  const auth = token !== undefined ? token : getAccessToken();
  if (auth) headers.set("Authorization", `Bearer ${auth}`);

  const res = await fetch(url, { ...rest, headers, body });

  const text = await res.text();
  if (!res.ok) {
    throw new ApiHttpError(res.status, parseDetail(text) || res.statusText, text);
  }

  if (res.status === 204 || text.length === 0) {
    return undefined as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiHttpError(
      res.status,
      "Réponse serveur invalide (JSON attendu).",
      text,
    );
  }
}
