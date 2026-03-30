import React from "react";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";

/**
 * Candlestick-like placeholder (sans lib chart externe).
 *
 * Rôle:
 * - Reproduire la hiérarchie visuelle du wireframe (graphique dominant).
 * - Donner un rendu “pédagogique” avant branchage backend.
 *
 * Note:
 * - Ce composant est volontairement isolé pour être remplacé facilement
 *   par un vrai composant graphique plus tard.
 */
export function CandlestickPlaceholder({
  title = "CANDLESTICK CHART",
  hint,
}: {
  title?: string;
  hint?: string;
}) {
  const [timeframe] = React.useState<"1m" | "5m" | "1h" | "1D">("1h");

  // Génère une forme pseudo-déterministe.
  const seed =
    timeframe === "1m" ? 1 : timeframe === "5m" ? 2 : timeframe === "1h" ? 3 : 4;

  const w = 860;
  const h = 360;
  const count = 34;

  const candles = Array.from({ length: count }).map((_, i) => {
    const t = i / (count - 1);
    const base = 0.45 + 0.15 * Math.sin((t * Math.PI * 2 + seed) * 1.2);
    const open = base + 0.05 * Math.sin(i * 0.7 + seed);
    const close = base + 0.05 * Math.cos(i * 0.6 + seed);
    const high = Math.max(open, close) + 0.08 * (0.3 + Math.abs(Math.sin(i + seed)));
    const low = Math.min(open, close) - 0.08 * (0.3 + Math.abs(Math.cos(i + seed)));
    return { open, close, high, low };
  });

  const y = (v: number) => h - v * h;

  return (
    <Card className="p-4">
      <div className="px-2 pt-1">
        <div className="text-sm font-semibold">{title}</div>
        {hint ? <div className="mt-1 text-xs text-[#E6EDF3]/70">{hint}</div> : null}
      </div>
      <Divider className="my-3" />

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[290px]">
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

        {/* Placeholder "indicators/tools" */}
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
    </Card>
  );
}

