import React from "react";
import { useParams } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Divider } from "../../../components/ui/Divider";
import { Link } from "react-router-dom";

export function MarketAssetPage() {
  /*
    Rôle: page Asset Detail / Chart privée.
    Objectif UX (guide): analyser un actif.
    Important (guide): PAS dans la sidebar (c'est le cas via `PrivateSidebar`).
    Contenu (guide): chart principal, timeframe, prix, accès simulation.
    Wireframe: chart-visuel.md.
  */

  const { asset } = useParams<{ asset: string }>();
  const symbol = asset ?? "BTC";

  const [timeframe, setTimeframe] = React.useState<"1m" | "5m" | "1h" | "1D">(
    "1h"
  );

  // TODO: remplacer par données backend (prix, série OHLC, indicateurs).
  const price = 43000;

  /**
   * Composant graphique placeholder (candlestick-like).
   * Objectif: donner la hiérarchie visuelle "graphique dominant" du wireframe.
   */
  function CandlestickPlaceholder() {
    const w = 740;
    const h = 300;
    const count = 28;

    // Graine pseudo-déterministe selon le timeframe pour varier la forme.
    const seed =
      timeframe === "1m" ? 1 : timeframe === "5m" ? 2 : timeframe === "1h" ? 3 : 4;

    const candles = Array.from({ length: count }).map((_, i) => {
      const t = i / (count - 1);
      const base = 0.45 + 0.15 * Math.sin((t * Math.PI * 2 + seed) * 1.2);
      const open = base + 0.05 * Math.sin(i * 0.7 + seed);
      const close = base + 0.05 * Math.cos(i * 0.6 + seed);
      const high =
        Math.max(open, close) + 0.08 * (0.3 + Math.abs(Math.sin(i + seed)));
      const low =
        Math.min(open, close) - 0.08 * (0.3 + Math.abs(Math.cos(i + seed)));
      return { open, close, high, low };
    });

    const y = (v: number) => h - v * h;

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[280px]">
        <rect x="0" y="0" width={w} height={h} fill="#111827" rx="14" />

        {/* Grid léger */}
        {Array.from({ length: 6 }).map((_, i) => {
          const yy = (i / 5) * h;
          return (
            <line
              key={i}
              x1="30"
              x2={w - 20}
              y1={yy}
              y2={yy}
              stroke="#ffffff"
              strokeOpacity="0.06"
            />
          );
        })}

        {candles.map((c, i) => {
          const cx = 30 + (i / (count - 1)) * (w - 50);
          const candleW = 10;
          const isUp = c.close >= c.open;
          const color = isUp ? "#22C55E" : "#EF4444";

          const yHigh = y(Math.min(1, c.high));
          const yLow = y(Math.max(0, c.low));
          const yOpen = y(Math.min(1, c.open));
          const yClose = y(Math.max(0, c.close));

          const top = Math.min(yOpen, yClose);
          const bottom = Math.max(yOpen, yClose);
          const bodyH = Math.max(6, bottom - top);

          return (
            <g key={i}>
              {/* Wick */}
              <line
                x1={cx}
                x2={cx}
                y1={yHigh}
                y2={yLow}
                stroke={color}
                strokeWidth="2"
                strokeOpacity="0.7"
              />
              {/* Body */}
              <rect
                x={cx - candleW / 2}
                y={top}
                width={candleW}
                height={bodyH}
                fill={color}
                fillOpacity="0.75"
                stroke={color}
                strokeOpacity="0.6"
                strokeWidth="1"
                rx="2"
              />
            </g>
          );
        })}

        <text
          x={w / 2}
          y={h - 16}
          textAnchor="middle"
          fill="#E6EDF3"
          fillOpacity="0.5"
          fontSize="12"
        >
          indicators / drawings / tools
        </text>
      </svg>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wireframe: titre actif + timeframe + prix */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {symbol} / USD
          </h1>
          <p className="mt-1 text-sm text-[#E6EDF3]/70">
            Price: ${price.toLocaleString()}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["1m", "5m", "1h", "1D"] as const).map((tf) => (
            <Button
              key={tf}
              size="sm"
              variant={tf === timeframe ? "primary" : "secondary"}
              onClick={() => setTimeframe(tf)}
              type="button"
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      {/* Chart principal dominant */}
      <Card className="p-4">
        <div className="px-2 pt-1">
          <div className="text-sm font-semibold">CANDLESTICK CHART</div>
        </div>
        <Divider className="my-3" />
        <CandlestickPlaceholder />
      </Card>

      {/* 2 colonnes: Indicators + Trade Panel (wireframe) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold">Indicators</h2>
          <Divider className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-[#E6EDF3]/70">RSI</div>
              <div className="text-sm font-semibold text-[#3B82F6]">56.2</div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-[#E6EDF3]/70">MA</div>
              <div className="text-sm font-semibold text-[#E6EDF3]">43,120</div>
            </div>
          </div>

          {/* TODO: brancher les indicateurs backend */}
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Trade Panel</h2>
          <Divider className="my-4" />

          <div className="flex flex-col gap-3">
            {/* TODO: bouton Buy/Sell branché sur le futur simulateur */}
            <div className="flex gap-2">
              <Button size="md" variant="secondary" disabled>
                Buy
              </Button>
              <Button size="md" variant="secondary" disabled>
                Sell
              </Button>
            </div>

            {/* Guide: accès simulation */}
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

