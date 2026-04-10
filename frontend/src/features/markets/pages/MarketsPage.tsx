import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Divider } from "../../../components/ui/Divider";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { AssetListItemDto } from "../../../shared/api/types/backend";
import { listAssets } from "../services/markets.service";

/** Hash déterministe pour bruit reproductible par symbole. */
function hashSymbol(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pseudo01(i: number, seed: number): number {
  const x = Math.sin(i * 12.9898 + seed * 0.001) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Série synthétique cohérente avec le prix affiché et la variation % 24h (liste API sans historique).
 * Début ≈ prix / (1+r), fin = prix courant, micro-volatilité le long du chemin.
 */
function marketSparklinePoints(price: number, changePercent: number, symbol: string): number[] {
  const n = 22;
  const seed = hashSymbol(symbol);
  let r = changePercent / 100;
  if (Math.abs(r) < 1e-8) {
    r = changePercent >= 0 ? 1e-5 : -1e-5;
  }
  const clampedR = Math.max(-0.8, Math.min(0.8, r));
  const startPrice = price / (1 + clampedR);
  const volScale = Math.min(6, Math.abs(changePercent));
  const points: number[] = [];

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    if (i === 0) {
      points.push(startPrice);
      continue;
    }
    if (i === n - 1) {
      points.push(price);
      continue;
    }
    const linear = startPrice + (price - startPrice) * t;
    const cycles = 2 + (seed % 5);
    const envelope = Math.sin(Math.PI * t) * 0.45 + 0.55;
    const wiggle =
      Math.abs(price) *
      0.01 *
      (1 + volScale / 12) *
      envelope *
      (Math.sin(t * Math.PI * cycles + seed * 0.02) * 0.55 +
        (pseudo01(i, seed) - 0.45) * 0.9);
    points.push(linear + wiggle);
  }

  return points;
}

function linePath(points: number[], w: number, h: number): string {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || Math.abs(max) * 1e-8 || 1;
  const pad = range * 0.08;
  const lo = min - pad;
  const hi = max + pad;
  const span = hi - lo;
  const denom = Math.max(1, points.length - 1);
  return points
    .map((p, i) => {
      const x = (i / denom) * w;
      const y = h - ((p - lo) / span) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

/**
 * Mini sparkline : tendance alignée sur la variation % (vert / rouge).
 */
function Sparkline({
  points,
  uid,
  up,
}: {
  points: number[];
  uid: string;
  up: boolean;
}) {
  const w = 80;
  const h = 28;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || Math.abs(max) * 1e-8 || 1;
  const pad = range * 0.08;
  const lo = min - pad;
  const hi = max + pad;
  const span = hi - lo;
  const denom = Math.max(1, points.length - 1);

  const lineD = linePath(points, w, h);
  const lastY = h - ((points[points.length - 1] - lo) / span) * h;
  const areaD = `${lineD} L ${w},${h} L 0,${h} Z`;

  const stroke = up ? "#22C55E" : "#F87171";
  const fillId = `sparkFill-${uid}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className="shrink-0"
      aria-hidden
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="1" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${fillId})`} />
      <path
        d={lineD}
        fill="none"
        stroke={stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.95}
      />
      <circle cx={w} cy={lastY} r="2.25" fill={stroke} opacity={0.95} />
    </svg>
  );
}

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
  }, []);

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
        <h1 className="text-xl font-semibold tracking-tight">Markets</h1>
      </div>

      {apiMissing ? (
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code> (ex.{" "}
          <code className="rounded bg-white/10 px-1">http://127.0.0.1:8000</code>) puis relance le
          serveur de dev pour charger les actifs.
        </Alert>
      ) : null}

      {/* Search (wireframe: "Search [ BTC, ETH... ]") */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets..."
            aria-label="Search assets"
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

      {/* Asset list card */}
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold">Asset List</h2>
          {loading ? (
            <span className="inline-flex items-center gap-2 text-sm text-[#E6EDF3]/70">
              <Spinner /> Chargement…
            </span>
          ) : null}
        </div>
        <Divider className="my-4" />

        {error && !apiMissing ? (
          <Alert variant="error" title="Erreur">
            {error}
          </Alert>
        ) : null}

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
                      <Sparkline
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
