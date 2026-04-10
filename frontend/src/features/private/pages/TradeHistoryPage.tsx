import React from "react";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { TradeHistoryItemDto } from "../../../shared/api/types/backend";
import { getTrades } from "../services/trades.service";

export function TradeHistoryPage() {
  return <TradeHistory />;
}

type SideFilter = "all" | "buy" | "sell";

/**
 * Historique des trades simulés — GET /api/v1/trades (filtre buy/sell côté client).
 */
function TradeHistory() {
  const [rows, setRows] = React.useState<TradeHistoryItemDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<SideFilter>("all");

  const apiMissing = !isApiConfigured();

  React.useEffect(() => {
    if (apiMissing) {
      setLoading(false);
      setRows([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getTrades({ limit: 200 })
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setRows([]);
        if (e instanceof ApiHttpError) {
          setError(e.message);
        } else {
          setError("Impossible de charger l’historique.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiMissing]);

  const filtered = React.useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((r) => r.side.toLowerCase() === filter);
  }, [rows, filter]);

  function formatDate(iso: string) {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Trade History</h1>
      </div>

      {apiMissing ? (
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code> pour charger
          l’historique.
        </Alert>
      ) : null}

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[#E6EDF3]/70">Filters</div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "all" as const, label: "All" },
                { id: "buy" as const, label: "Buy" },
                { id: "sell" as const, label: "Sell" },
              ] as const
            ).map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant={filter === t.id ? "primary" : "secondary"}
                type="button"
                onClick={() => setFilter(t.id)}
                disabled={loading}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        <Divider className="my-4" />

        {loading && !apiMissing ? (
          <div className="inline-flex items-center gap-2 py-4 text-sm text-[#E6EDF3]/70">
            <Spinner /> Chargement…
          </div>
        ) : null}

        {error && !apiMissing ? (
          <Alert variant="error" title="Erreur">
            {error}
          </Alert>
        ) : null}

        {!loading && !error ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#E6EDF3]/70">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Symbol</th>
                  <th className="py-2 pr-3">Side</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <tr key={`${r.created_at}-${r.symbol}-${idx}`} className="border-t border-white/10">
                    <td className="py-3 pr-3 text-[#E6EDF3]/85">{formatDate(r.created_at)}</td>
                    <td className="py-3 pr-3 font-medium">{r.symbol}</td>
                    <td className="py-3 pr-3 capitalize">{r.side}</td>
                    <td className="py-3 pr-3 text-[#E6EDF3]/80">
                      {r.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                    </td>
                    <td className="py-3 pr-3 text-right text-[#E6EDF3]/80">
                      ${r.price.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-[#E6EDF3]/70">
                      Aucun trade pour ce filtre.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
