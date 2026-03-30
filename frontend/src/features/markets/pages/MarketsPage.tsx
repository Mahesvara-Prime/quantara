import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Divider } from "../../../components/ui/Divider";
import { Button } from "../../../components/ui/Button";

type Asset = {
  symbol: string;
  price: number;
  variationPct: number;
};

/**
 * Rôle: mini chart SVG (sparkline) pour lister les actifs.
 * Wireframe: markets-visuel.md -> "mini chart" à droite de chaque actif.
 */
function Sparkline({ points }: { points: number[] }) {
  const w = 70;
  const h = 22;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className="opacity-90"
      aria-label="Mini chart"
    >
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3B82F6" stopOpacity="0.35" />
          <stop offset="1" stopColor="#3B82F6" stopOpacity="1" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#sparkGrad)" strokeWidth="2.25" />
    </svg>
  );
}

export function MarketsPage() {
  /*
    Rôle: page Markets privée.
    Objectif UX (guide): explorer les actifs via search, liste, prix/variation et mini chart.
    Wireframe: markets-visuel.md.
  */

  const [query, setQuery] = React.useState("");

  // TODO: remplacer par des données backend.
  const assets: Asset[] = [
    { symbol: "BTC", price: 43000, variationPct: 2.4 },
    { symbol: "ETH", price: 3200, variationPct: -1.2 },
    { symbol: "SOL", price: 120, variationPct: 5.6 },
  ];

  const filtered = assets.filter((a) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return a.symbol.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Markets</h1>
      </div>

      {/* Search (wireframe: "Search [ BTC, ETH... ]") */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets..."
            aria-label="Search assets"
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
        </div>
        <Divider className="my-4" />

        <div className="space-y-2">
          {filtered.map((asset, idx) => {
            const isPositive = asset.variationPct >= 0;
            const variationColor = isPositive ? "#22C55E" : "#EF4444";

            return (
              <Link
                key={asset.symbol}
                to={`/markets/${asset.symbol}`}
                className={[
                  "block rounded-xl border border-white/10 bg-[#111827]/20",
                  "p-3 transition-colors hover:bg-white/5",
                ].join(" ")}
              >
                {/* Wireframe: BTC / $price / variation / mini chart */}
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-[72px] text-sm font-semibold">
                    {asset.symbol}
                  </div>
                  <div className="flex-1 text-sm text-[#E6EDF3]/70">
                    ${asset.price.toLocaleString()}
                  </div>
                  <div
                    className="min-w-[76px] text-right text-sm font-semibold"
                    style={{ color: variationColor }}
                  >
                    {asset.variationPct >= 0 ? "+" : ""}
                    {asset.variationPct.toFixed(1)}%
                  </div>
                  <div className="flex items-center">
                    <Sparkline
                      points={[
                        10 + idx * 2,
                        12 + idx,
                        9 + idx * 3,
                        15 + idx,
                        13 + idx * 2,
                        17 + idx,
                      ]}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* TODO: états vides / chargement via Spinner */}
      </Card>
    </div>
  );
}

