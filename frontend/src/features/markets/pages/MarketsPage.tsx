import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Divider } from "../../../components/ui/Divider";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { ErrorRetryBanner } from "../../../components/ui/ErrorRetryBanner";
import { Spinner } from "../../../components/ui/Spinner";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { AssetListItemDto } from "../../../shared/api/types/backend";
import { listAssets } from "../services/markets.service";
import { MarketMiniSparkline, marketSparklinePoints } from "../utils/sparkline";

export function MarketsPage() {
  /*
    Rôle: page Markets privée.
    Objectif UX (guide): explorer les actifs via search, liste, prix/variation et mini chart.
    Données: GET /api/v1/assets.
  */

  const [query, setQuery] = React.useState("");
  const [assets, setAssets] = React.useState<AssetListItemDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryNonce, setRetryNonce] = React.useState(0);

  React.useEffect(() => {
    if (!isApiConfigured()) {
      setLoading(false);
      setError(null);
      setAssets([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    listAssets({ limit: 50, page: 1 })
      .then((rows) => {
        if (!cancelled) setAssets(rows);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiHttpError) {
          setError(e.message);
        } else {
          setError("Impossible de charger les marchés.");
        }
        setAssets([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [retryNonce]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(
      (a) =>
        a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q),
    );
  }, [assets, query]);

  const apiMissing = !isApiConfigured();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Marchés</h1>
        <p className="mt-1 text-sm text-[#E6EDF3]/60">
          Cotations et variations 24h — clique sur un actif pour le graphique détaillé.
        </p>
      </div>

      {apiMissing ? (
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code> (ex.{" "}
          <code className="rounded bg-white/10 px-1">http://127.0.0.1:8000</code>) puis relance le
          serveur de dev pour charger les actifs.
        </Alert>
      ) : null}

      {error && !apiMissing ? (
        <ErrorRetryBanner
          message={error}
          disabled={loading}
          onRetry={() => setRetryNonce((n) => n + 1)}
        />
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un actif…"
            aria-label="Rechercher un actif"
            disabled={apiMissing}
          />
        </div>

        <div className="flex gap-2">
          {["BTC", "ETH", "SOL"].map((sym) => (
            <Button
              key={sym}
              size="sm"
              variant="ghost"
              onClick={() => setQuery(sym)}
              className="border-white/10"
              type="button"
              disabled={apiMissing}
            >
              {sym}
            </Button>
          ))}
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">Liste des actifs</h2>
          {loading ? (
            <span className="inline-flex items-center gap-2 text-sm text-[#E6EDF3]/70">
              <Spinner /> Chargement…
            </span>
          ) : null}
        </div>
        <Divider className="my-4" />

        {!loading && !error && !apiMissing && filtered.length === 0 ? (
          <p className="text-sm text-[#E6EDF3]/70">Aucun actif ne correspond à ta recherche.</p>
        ) : null}

        <div className="space-y-2">
          {!apiMissing &&
            !loading &&
            filtered.map((asset) => {
              const isPositive = asset.change_percent >= 0;
              const variationColor = isPositive ? "#22C55E" : "#EF4444";

              return (
                <Link
                  key={asset.symbol}
                  to={`/markets/${encodeURIComponent(asset.symbol)}`}
                  className={[
                    "block rounded-xl border border-white/10 bg-[#111827]/20",
                    "p-3 transition-colors hover:bg-white/5",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:flex-nowrap">
                    <div className="min-w-0 flex-[1.15] sm:max-w-[40%]">
                      <div className="text-sm font-semibold">{asset.symbol}</div>
                      <div className="truncate text-xs text-[#E6EDF3]/60">{asset.name}</div>
                    </div>
                    <div className="min-w-0 flex-1 text-sm tabular-nums text-[#E6EDF3]/85">
                      ${asset.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </div>
                    <div
                      className="min-w-[4.5rem] shrink-0 text-right text-sm font-semibold tabular-nums"
                      style={{ color: variationColor }}
                    >
                      {asset.change_percent >= 0 ? "+" : ""}
                      {asset.change_percent.toFixed(2)}%
                    </div>
                    <div className="ml-auto flex w-20 shrink-0 items-center justify-end sm:ml-0">
                      <MarketMiniSparkline
                        uid={asset.symbol}
                        up={isPositive}
                        points={marketSparklinePoints(
                          asset.price,
                          asset.change_percent,
                          asset.symbol,
                        )}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </Card>
    </div>
  );
}
