import React from "react";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";

/**
 * Rôle: page Portfolio privée.
 * Objectif UX (guide): voir résultats rapidement.
 * Wireframe: portfolio-visuel.md
 *
 * Contenu:
 * - Total Balance
 * - Profit / Loss
 * - Open Positions (liste)
 * - Portfolio Performance (placeholder chart)
 */

export function PortfolioPage() {
  return (
    <Portfolio />
  );
}

/**
 * Composant interne pour structurer la page Portfolio.
 */
function Portfolio() {
  // TODO: remplacer par données backend.
  const totalBalance = 10250;
  const profitLoss = 250;
  const profitLossPct = 2.5;

  type PositionRow = {
    symbol: string;
    amount: number;
    price: number;
    variationPct: number;
    pnl: number;
  };

  const positions: PositionRow[] = [
    { symbol: "BTC", amount: 0.5, price: 43000, variationPct: 2.4, pnl: 120 },
    { symbol: "ETH", amount: 2.0, price: 3200, variationPct: -1.2, pnl: -80 },
  ];

  /**
   * Placeholder “line chart of balance over time”.
   * Rôle: fournir un repère visuel sans backend / sans lib chart.
   */
  function LineChartPlaceholder() {
    const w = 720;
    const h = 220;

    // Forme pseudo-déterministe.
    const points = [0.18, 0.25, 0.22, 0.3, 0.36, 0.33, 0.42, 0.46, 0.4, 0.52];

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    const path = points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * (w - 40) + 20;
        const y = h - ((p - min) / range) * (h - 30) - 15;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[180px]">
        <rect x="0" y="0" width={w} height={h} fill="#111827" rx="14" />
        {Array.from({ length: 5 }).map((_, i) => {
          const yy = (i / 4) * h;
          return (
            <line
              key={i}
              x1="20"
              x2={w - 20}
              y1={yy}
              y2={yy}
              stroke="#ffffff"
              strokeOpacity="0.06"
            />
          );
        })}
        <path
          d={path}
          fill="none"
          stroke="#3B82F6"
          strokeOpacity="0.9"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const profitColor = profitLoss >= 0 ? "#22C55E" : "#EF4444";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Portfolio</h1>
      </div>

      {/* Stats rapide (wireframe: Total Balance + Profit/Loss) */}
      <Card className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <div className="text-sm text-[#E6EDF3]/70">Total Balance</div>
          <div className="text-lg font-semibold text-[#E6EDF3]">
            ${totalBalance.toLocaleString()}
          </div>
          <div className="text-sm font-medium" style={{ color: profitColor }}>
            Profit / Loss:{" "}
            {profitLoss >= 0 ? "+" : ""}
            ${Math.abs(profitLoss).toLocaleString()} ({profitLossPct.toFixed(1)}%)
          </div>
        </div>
      </Card>

      {/* Open Positions */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Open Positions</h2>
        <Divider className="my-4" />

        <div className="space-y-2">
          {positions.map((p) => {
            const posColor = p.pnl >= 0 ? "#22C55E" : "#EF4444";
            const variationPrefix = p.variationPct >= 0 ? "+" : "";
            const pnlPrefix = p.pnl >= 0 ? "+" : "";

            return (
              <div
                key={p.symbol}
                className={[
                  "flex flex-wrap items-center justify-between gap-3 rounded-xl",
                  "border border-white/10 bg-[#111827]/20 px-4 py-3",
                ].join(" ")}
              >
                <div className="min-w-[72px] text-sm font-semibold">{p.symbol}</div>
                <div className="text-sm text-[#E6EDF3]/70">{p.amount}</div>
                <div className="text-sm text-[#E6EDF3]/70">
                  ${p.price.toLocaleString()}
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: p.variationPct >= 0 ? "#22C55E" : "#EF4444" }}
                >
                  {variationPrefix}
                  {p.variationPct.toFixed(1)}%
                </div>
                <div className="text-sm font-semibold" style={{ color: posColor }}>
                  {pnlPrefix}${Math.abs(p.pnl).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        {/* TODO: ajouter sorting / pagination si nécessaire */}
      </Card>

      {/* Portfolio Performance */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Portfolio Performance</h2>
        <div className="mt-1 text-sm text-[#E6EDF3]/70">
          (line chart of balance over time)
        </div>
        <Divider className="my-4" />

        <LineChartPlaceholder />
      </Card>
    </div>
  );
}


