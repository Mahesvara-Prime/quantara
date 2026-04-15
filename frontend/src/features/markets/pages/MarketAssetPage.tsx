import React from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Divider } from "../../../components/ui/Divider";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { AssetDetailDto, CandleDto, PositionDto } from "../../../shared/api/types/backend";
import { getPortfolioPositions } from "../../private/services/portfolio.service";
import { ASSET_CHART_TIMEFRAMES, type ChartTimeframeApi } from "../constants";
import { AssetCandleChart, type ChartTradingOverlay } from "../components/AssetCandleChart";
import { getAssetCandles, getAssetDetail } from "../services/markets.service";

function candleLimitForTimeframe(timeframe: ChartTimeframeApi): number {
  switch (timeframe) {
    case "1h":
      return 300;
    case "4h":
      return 400;
    case "1d":
      return 500;
    case "30d":
      return 500;
    case "90d":
      return 700;
    default:
      return 500;
  }
}

export function MarketAssetPage() {
  /*
    Rôle: page Asset Detail / Chart privée.
    Données: GET /api/v1/assets/{symbol} et GET /api/v1/assets/{symbol}/candles.
    Timeframes alignés sur le backend (rules.validate_timeframe).
  */

  const { asset } = useParams<{ asset: string }>();
  const symbol = (asset ?? "BTC").trim();

  const [timeframe, setTimeframe] = React.useState<ChartTimeframeApi>(
    ASSET_CHART_TIMEFRAMES[0].apiValue,
  );

  const [detail, setDetail] = React.useState<AssetDetailDto | null>(null);
  const [candles, setCandles] = React.useState<CandleDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [chartWarning, setChartWarning] = React.useState<string | null>(null);
  const [positions, setPositions] = React.useState<PositionDto[]>([]);

  const apiMissing = !isApiConfigured();

  const tradingOverlay = React.useMemo((): ChartTradingOverlay | null => {
    const sym = symbol.trim().toUpperCase();
    const p = positions.find((x) => x.symbol.trim().toUpperCase() === sym);
    if (!p || p.quantity <= 0) return null;
    return {
      averageEntryPrice: p.average_entry_price,
      stopLoss: p.stop_loss ?? undefined,
      takeProfit: p.take_profit ?? undefined,
    };
  }, [positions, symbol]);

  React.useEffect(() => {
    if (apiMissing) {
      setPositions([]);
      return;
    }
    getPortfolioPositions()
      .then(setPositions)
      .catch(() => setPositions([]));
  }, [apiMissing, symbol]);

  React.useEffect(() => {
    if (apiMissing || !symbol) {
      setLoading(false);
      setDetail(null);
      setCandles([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setChartWarning(null);

    const candleLimit = candleLimitForTimeframe(timeframe);
    (async () => {
      const [detailRes, candlesRes] = await Promise.allSettled([
        getAssetDetail(symbol),
        getAssetCandles(symbol, timeframe, candleLimit),
      ]);
      if (cancelled) return;

      if (detailRes.status === "fulfilled") {
        setDetail(detailRes.value);
      } else {
        setDetail(null);
        const reason = detailRes.reason;
        if (reason instanceof ApiHttpError) setError(reason.message);
        else setError("Impossible de charger l’actif.");
      }

      if (candlesRes.status === "fulfilled") {
        setCandles(candlesRes.value);
      } else {
        const reason = candlesRes.reason;
        if (reason instanceof ApiHttpError) {
          setChartWarning(
            reason.status === 503
              ? "Le fournisseur de marché limite temporairement les requêtes. Dernières bougies conservées."
              : reason.message,
          );
        } else {
          setChartWarning("Impossible de charger les bougies pour cette période.");
        }
      }
      setLoading(false);
    })().catch((e) => {
      if (cancelled) return;
      if (e instanceof ApiHttpError) setError(e.message);
      else setError("Impossible de charger l’actif.");
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [symbol, timeframe, apiMissing]);

  const price = detail?.price ?? 0;
  const changePct = detail?.change_percent ?? 0;
  const isPositive = changePct >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {detail?.symbol ?? symbol} / USD
          </h1>
          {detail ? (
            <p className="mt-1 text-sm text-[#E6EDF3]/70">{detail.name}</p>
          ) : null}
          <p className="mt-1 text-sm text-[#E6EDF3]/70">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Chargement du prix…
              </span>
            ) : detail ? (
              <>
                Price: ${price.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                <span
                  className="ml-2 font-semibold"
                  style={{ color: isPositive ? "#22C55E" : "#EF4444" }}
                >
                  {isPositive ? "+" : ""}
                  {changePct.toFixed(2)}%
                </span>
              </>
            ) : null}
          </p>
          {detail ? (
            <p className="mt-1 text-xs text-[#E6EDF3]/55">
              24h high ${detail.high_24h.toLocaleString(undefined, { maximumFractionDigits: 6 })} ·
              low ${detail.low_24h.toLocaleString(undefined, { maximumFractionDigits: 6 })}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {ASSET_CHART_TIMEFRAMES.map((tf) => (
            <Button
              key={tf.apiValue}
              size="sm"
              variant={tf.apiValue === timeframe ? "primary" : "secondary"}
              onClick={() => setTimeframe(tf.apiValue)}
              type="button"
              disabled={apiMissing || loading}
            >
              {tf.label}
            </Button>
          ))}
        </div>
      </div>

      {apiMissing ? (
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code> pour afficher le
          détail et le graphique.
        </Alert>
      ) : null}

      {error && !apiMissing ? (
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
      ) : null}

      {chartWarning && !apiMissing ? (
        <Alert variant="info" title="Graphique">
          {chartWarning}
        </Alert>
      ) : null}

      {/* Chart principal */}
      <Card className="p-4">
        <div className="px-2 pt-1">
          <div className="text-sm font-semibold">Graphique</div>
          <p className="mt-1 text-xs text-[#E6EDF3]/50">
            SMA, EMA, Bollinger, volume estimé, RSI — lignes Entrée / Stop / TP si position simulée
            ouverte sur {symbol}.
          </p>
        </div>
        <Divider className="my-3" />
        {loading && !apiMissing ? (
          <div className="flex h-[280px] items-center justify-center gap-2 text-sm text-[#E6EDF3]/70">
            <Spinner /> Chargement du graphique…
          </div>
        ) : (
          <AssetCandleChart candles={candles} tradingOverlay={tradingOverlay} />
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold">Simulation papier</h2>
        <Divider className="my-4" />

        <Alert variant="info" title="Ordres">
          Passe par la page <strong className="text-[#E6EDF3]">Simulation</strong> pour acheter ou
          vendre au prix marché ; tu peux y renseigner stop loss et take profit (affichés sur ce
          graphique tant que la position est ouverte).
        </Alert>

        <div className="mt-4">
          <Link to={`/simulation?symbol=${encodeURIComponent(symbol)}`} className="inline-block w-full">
            <Button size="md" variant="primary" className="w-full" type="button">
              Ouvrir la simulation · {symbol}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
