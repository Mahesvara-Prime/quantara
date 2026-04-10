import { apiV1Request } from "../httpClient";
import type { TradeHistoryItemDto } from "../types/backend";

/** GET /trades */
export async function listTrades(params?: { limit?: number }): Promise<TradeHistoryItemDto[]> {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set("limit", String(params.limit));
  const suffix = q.toString() ? `?${q.toString()}` : "";
  return apiV1Request<TradeHistoryItemDto[]>(`/trades${suffix}`, { method: "GET" });
}
