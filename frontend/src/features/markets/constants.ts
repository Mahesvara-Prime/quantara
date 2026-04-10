/**
 * Timeframes supportés par GET /api/v1/assets/{symbol}/candles
 * (voir `backend/app/modules/market_data/rules.py` — `validate_timeframe`).
 */
export const ASSET_CHART_TIMEFRAMES = [
  { label: "1H", apiValue: "1h" },
  { label: "4H", apiValue: "4h" },
  { label: "1D", apiValue: "1d" },
  { label: "30D", apiValue: "30d" },
] as const;

export type ChartTimeframeApi = (typeof ASSET_CHART_TIMEFRAMES)[number]["apiValue"];
