/**
 * Historique des trades simulés — GET /api/v1/trades (auth Bearer).
 */

import { tradesApi } from "../../../shared/api";
import type { TradeHistoryItemDto } from "../../../shared/api/types/backend";

export async function getTrades(params?: {
  limit?: number;
}): Promise<TradeHistoryItemDto[]> {
  return tradesApi.listTrades(params);
}
