import { apiV1Request } from "../httpClient";
import type { AssetDetailDto, AssetListItemDto, CandleDto } from "../types/backend";

/** GET /assets */
export async function listAssets(params?: { limit?: number; page?: number }): Promise<AssetListItemDto[]> {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set("limit", String(params.limit));
  if (params?.page != null) q.set("page", String(params.page));
  const suffix = q.toString() ? `?${q.toString()}` : "";
  return apiV1Request<AssetListItemDto[]>(`/assets${suffix}`, { method: "GET", token: null });
}

/** GET /assets/{symbol} */
export async function getAsset(symbol: string): Promise<AssetDetailDto> {
  const enc = encodeURIComponent(symbol.trim());
  return apiV1Request<AssetDetailDto>(`/assets/${enc}`, { method: "GET", token: null });
}

/** GET /assets/{symbol}/candles */
export async function getAssetCandles(
  symbol: string,
  params?: { timeframe?: string; limit?: number },
): Promise<CandleDto[]> {
  const q = new URLSearchParams();
  if (params?.timeframe) q.set("timeframe", params.timeframe);
  if (params?.limit != null) q.set("limit", String(params.limit));
  const suffix = q.toString() ? `?${q.toString()}` : "";
  const enc = encodeURIComponent(symbol.trim());
  return apiV1Request<CandleDto[]>(`/assets/${enc}/candles${suffix}`, { method: "GET", token: null });
}
