import React from "react";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";

export function TradeHistoryPage() {
  return (
    <TradeHistory />
  );
}

/**
 * Rôle: page Trade History privée.
 * Objectif UX (guide): voir l'historique via une table claire.
 * Wireframe: trade-history-visuel.md
 *
 * Contenu:
 * - filtres All / Buy / Sell
 * - table Date / Asset / Type / Price / Amount / P/L
 */
function TradeHistory() {
  type SideFilter = "all" | "buy" | "sell";

  // TODO: remplacer par données backend.
  type TradeRow = {
    date: string;
    asset: string;
    type: "Buy" | "Sell";
    price: number;
    amount: number;
    pnl: number;
  };

  const allRows: TradeRow[] = [
    { date: "01/03", asset: "BTC", type: "Buy", price: 42000, amount: 500, pnl: 50 },
    { date: "02/03", asset: "ETH", type: "Sell", price: 3200, amount: 300, pnl: -20 },
  ];

  const [filter, setFilter] = React.useState<SideFilter>("all");
  const [error, setError] = React.useState<string | null>(null);

  const rows = allRows.filter((r) => {
    if (filter === "all") return true;
    return r.type.toLowerCase() === filter;
  });

  function selectFilter(next: SideFilter) {
    setError(null);
    setFilter(next);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Trade History</h1>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[#E6EDF3]/70">Filters</div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "all", label: "All" },
                { id: "buy", label: "Buy" },
                { id: "sell", label: "Sell" },
              ] as const
            ).map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant={filter === t.id ? "primary" : "secondary"}
                type="button"
                onClick={() => selectFilter(t.id)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        <Divider className="my-4" />

        {/* Table claire (wireframe) */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#E6EDF3]/70">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Asset</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 pr-3">Amount</th>
                <th className="py-2 pr-3 text-right">P/L</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => {
                const pnlColor = r.pnl >= 0 ? "#22C55E" : "#EF4444";
                const pnlPrefix = r.pnl >= 0 ? "+" : "";

                return (
                  <tr
                    key={`${r.date}-${r.asset}-${idx}`}
                    className="border-t border-white/10"
                  >
                    <td className="py-3 pr-3">{r.date}</td>
                    <td className="py-3 pr-3 font-medium">{r.asset}</td>
                    <td className="py-3 pr-3">{r.type}</td>
                    <td className="py-3 pr-3 text-[#E6EDF3]/80">
                      ${r.price.toLocaleString()}
                    </td>
                    <td className="py-3 pr-3 text-[#E6EDF3]/80">
                      ${r.amount.toLocaleString()}
                    </td>
                    <td className="py-3 pr-3 text-right font-semibold" style={{ color: pnlColor }}>
                      {pnlPrefix}${Math.abs(r.pnl).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-[#E6EDF3]/70">
                    No trades for this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {error ? (
          <div className="mt-4">
            <Alert variant="error" title="Erreur">
              {error}
            </Alert>
          </div>
        ) : null}

        {/* TODO: pagination si besoin */}
      </Card>
    </div>
  );
}


