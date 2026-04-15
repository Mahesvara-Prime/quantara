import React from "react";

/** Hash déterministe pour bruit reproductible par symbole. */
export function hashSymbol(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function pseudo01(i: number, seed: number): number {
  const x = Math.sin(i * 12.9898 + seed * 0.001) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Série synthétique cohérente avec le prix affiché et la variation % 24h (liste sans historique OHLC).
 */
export function marketSparklinePoints(price: number, changePercent: number, symbol: string): number[] {
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
      (Math.sin(t * Math.PI * cycles + seed * 0.02) * 0.55 + (pseudo01(i, seed) - 0.45) * 0.9);
    points.push(linear + wiggle);
  }

  return points;
}

export function linePath(points: number[], w: number, h: number): string {
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

export type SparkPreviewItem = {
  symbol: string;
  price: number;
  change_percent: number;
};

/** Moyenne des courbes synthétiques — tendance d’ensemble de l’aperçu marché. */
export function compositeSparklineFromPreview(items: SparkPreviewItem[]): {
  points: number[];
  up: boolean;
} {
  if (items.length === 0) {
    return { points: [], up: true };
  }
  const series = items.map((m) =>
    marketSparklinePoints(m.price, m.change_percent, m.symbol),
  );
  const n = series[0].length;
  const points: number[] = [];
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (const s of series) sum += s[i];
    points.push(sum / series.length);
  }
  const avgChg = items.reduce((a, m) => a + m.change_percent, 0) / items.length;
  return { points, up: avgChg >= 0 };
}

type MiniProps = {
  points: number[];
  uid: string;
  up: boolean;
  /** Ligne liste marchés */
  w?: number;
  h?: number;
};

/**
 * Mini sparkline SVG : tendance alignée sur le signe `up` (vert / rouge).
 */
export function MarketMiniSparkline({ points, uid, up, w = 80, h = 28 }: MiniProps) {
  if (points.length < 2) return null;

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
  const fillId = `sparkFill-${uid.replace(/[^a-zA-Z0-9_-]/g, "")}`;

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
