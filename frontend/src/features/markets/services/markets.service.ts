/**
 * Couche métier Markets : liste actifs, détail, bougies OHLC.
 * Délègue à `marketsApi` (`shared/api`) — chemins alignés sur FastAPI `/api/v1/assets`.
 */

import { marketsApi } from "../../../shared/api";
import type { AssetDetailDto, AssetListItemDto, CandleDto } from "../../../shared/api/types/backend";

/** Liste paginable (défaut backend : limit 50, page 1). */
export async function listAssets(params?: {
  limit?: number;
  page?: number;
}): Promise<AssetListItemDto[]> {
  return marketsApi.listAssets(params);
}

/** Snapshot actif (prix, variation, high/low 24h). */
export async function getAssetDetail(symbol: string): Promise<AssetDetailDto> {
  return marketsApi.getAsset(symbol);
}

/**
 * Série OHLC pour le graphique.
 * @param timeframe — ex. `1h`, `4h`, `1d`, `30d` (voir `constants.ts`)
 */
export async function getAssetCandles(
  symbol: string,
  timeframe: string,
  limit?: number,
): Promise<CandleDto[]> {
  return marketsApi.getAssetCandles(symbol, { timeframe, limit });
}
