import React from "react";
import { Link, useParams } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Divider } from "../../../components/ui/Divider";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { AssetDetailDto, CandleDto } from "../../../shared/api/types/backend";
import { ASSET_CHART_TIMEFRAMES, type ChartTimeframeApi } from "../constants";
import { AssetCandleChart } from "../components/AssetCandleChart";
import { getAssetCandles, getAssetDetail } from "../services/markets.service";

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

  const apiMissing = !isApiConfigured();

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

    Promise.all([
      getAssetDetail(symbol),
      getAssetCandles(symbol, timeframe, 120),
    ])
      .then(([d, c]) => {
        if (!cancelled) {
          setDetail(d);
          setCandles(c);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setDetail(null);
        setCandles([]);
        if (e instanceof ApiHttpError) {
          setError(e.message);
        } else {
          setError("Impossible de charger l’actif.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
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

      {/* Chart principal */}
      <Card className="p-4">
        <div className="px-2 pt-1">
          <div className="text-sm font-semibold">CANDLESTICK CHART</div>
        </div>
        <Divider className="my-3" />
        {loading && !apiMissing ? (
          <div className="flex h-[280px] items-center justify-center gap-2 text-sm text-[#E6EDF3]/70">
            <Spinner /> Chargement du graphique…
          </div>
        ) : (
          <AssetCandleChart candles={candles} />
        )}
      </Card>

      {/* Indicateurs mock + accès simulation (hors périmètre backend pour ce bloc) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold">Indicators</h2>
          <Divider className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-[#E6EDF3]/70">RSI</div>
              <div className="text-sm font-semibold text-[#3B82F6]">—</div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-[#E6EDF3]/70">MA</div>
              <div className="text-sm font-semibold text-[#E6EDF3]">—</div>
            </div>
          </div>

          <p className="mt-4 text-xs text-[#E6EDF3]/50">
            Indicateurs techniques : branchement ultérieur.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Trade Panel</h2>
          <Divider className="my-4" />

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button size="md" variant="secondary" disabled>
                Buy
              </Button>
              <Button size="md" variant="secondary" disabled>
                Sell
              </Button>
            </div>

            <Link to="/simulation" className="inline-block">
              <Button size="md" variant="primary" className="w-full">
                Access Simulation
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
