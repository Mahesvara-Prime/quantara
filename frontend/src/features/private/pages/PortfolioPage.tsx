import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Divider } from "../../../components/ui/Divider";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { ErrorRetryBanner } from "../../../components/ui/ErrorRetryBanner";
import { useToast } from "../../../components/feedback/ToastContext";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { PortfolioSummaryDto, PositionDto } from "../../../shared/api/types/backend";
import { executeTrade } from "../../simulation/services/simulation.service";
import { getPortfolio, getPortfolioPositions } from "../services/portfolio.service";

export function PortfolioPage() {
  return <Portfolio />;
}

/**
 * Portefeuille simulé — résumé, positions, fermeture avec toast.
 */
function Portfolio() {
  const { showToast } = useToast();
  const [summary, setSummary] = React.useState<PortfolioSummaryDto | null>(null);
  const [positions, setPositions] = React.useState<PositionDto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryNonce, setRetryNonce] = React.useState(0);
  const [closingSymbol, setClosingSymbol] = React.useState<string | null>(null);

  const apiMissing = !isApiConfigured();

  async function refreshPortfolio() {
    const [s, p] = await Promise.all([getPortfolio(), getPortfolioPositions()]);
    setSummary(s);
    setPositions(p);
  }

  async function closePosition(symbol: string, quantity: number) {
    setClosingSymbol(symbol);
    try {
      await executeTrade({ symbol, side: "sell", amount: quantity });
      setError(null);
      showToast(`Position ${symbol} fermée.`, "success");
      try {
        await refreshPortfolio();
      } catch {
        showToast("Vente enregistrée. Actualise la page si les chiffres ne bougent pas.", "info");
      }
    } catch (e) {
      if (e instanceof ApiHttpError) {
        setError(e.message);
        showToast(e.message, "error");
      } else {
        setError("Impossible de fermer la position.");
        showToast("Échec de la fermeture.", "error");
      }
    } finally {
      setClosingSymbol(null);
    }
  }

  React.useEffect(() => {
    if (apiMissing) {
      setLoading(false);
      setSummary(null);
      setPositions([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getPortfolio(), getPortfolioPositions()])
      .then(([s, p]) => {
        if (!cancelled) {
          setSummary(s);
          setPositions(p);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setSummary(null);
        setPositions([]);
        if (e instanceof ApiHttpError) {
          setError(e.message);
        } else {
          setError("Impossible de charger le portefeuille.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiMissing, retryNonce]);

  const profitColor =
    summary != null && summary.total_pnl >= 0 ? "#22C55E" : "#EF4444";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Portefeuille</h1>
        <p className="mt-1 text-sm text-[#E6EDF3]/60">
          Simulation papier : soldes et positions ouvertes.
        </p>
      </div>

      {apiMissing ? (
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code> pour afficher le
          portefeuille simulé.
        </Alert>
      ) : null}

      {error && !apiMissing ? (
        <ErrorRetryBanner
          message={error}
          disabled={loading}
          onRetry={() => {
            setError(null);
            setRetryNonce((n) => n + 1);
          }}
        />
      ) : null}

      <Card className="p-6">
        <div className="flex flex-col gap-4">
          {loading && !apiMissing ? (
            <div className="inline-flex items-center gap-2 text-sm text-[#E6EDF3]/70">
              <Spinner /> Chargement…
            </div>
          ) : null}

          {summary && !loading ? (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <div>
                  <div className="text-sm text-[#E6EDF3]/70">Valeur totale</div>
                  <div className="text-lg font-semibold text-[#E6EDF3]">
                    ${summary.total_value.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[#E6EDF3]/70">Cash</div>
                  <div className="text-lg font-semibold text-[#E6EDF3]">
                    ${summary.cash_balance.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[#E6EDF3]/70">P / L total</div>
                  <div className="text-lg font-semibold" style={{ color: profitColor }}>
                    {summary.total_pnl >= 0 ? "+" : ""}
                    ${summary.total_pnl.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {!loading && !summary && !error && !apiMissing ? (
            <p className="text-sm text-[#E6EDF3]/70">Aucune donnée portefeuille.</p>
          ) : null}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold">Positions ouvertes</h2>
        <Divider className="my-4" />

        {!loading && positions.length === 0 && !error && !apiMissing ? (
          <div className="space-y-3 text-sm text-[#E6EDF3]/70">
            <p>Tu n’as pas encore de position ouverte.</p>
            <Link
              to="/simulation"
              className="inline-block font-medium text-[#3B82F6] underline underline-offset-2"
            >
              Passer un ordre simulé →
            </Link>
          </div>
        ) : null}

        <div className="space-y-2">
          {positions.map((p) => {
            const posColor = p.pnl >= 0 ? "#22C55E" : "#EF4444";
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
                <div className="text-sm text-[#E6EDF3]/70">
                  Qté {p.quantity.toLocaleString("fr-FR", { maximumFractionDigits: 8 })}
                </div>
                <div className="text-sm text-[#E6EDF3]/70">
                  Entrée ${p.average_entry_price.toLocaleString("fr-FR", { maximumFractionDigits: 4 })}
                </div>
                <div className="text-sm text-[#E6EDF3]/80">
                  ${p.current_price.toLocaleString("fr-FR", { maximumFractionDigits: 4 })}
                </div>
                <div className="text-sm font-semibold" style={{ color: posColor }}>
                  {pnlPrefix}${Math.abs(p.pnl).toLocaleString("fr-FR", { maximumFractionDigits: 2 })}{" "}
                  P/L
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="shrink-0"
                  disabled={closingSymbol !== null || loading}
                  onClick={() => void closePosition(p.symbol, p.quantity)}
                >
                  {closingSymbol === p.symbol ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner /> Fermeture…
                    </span>
                  ) : (
                    "Fermer la position"
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold">Performance (indicatif)</h2>
        <div className="mt-1 text-sm text-[#E6EDF3]/70">
          Courbe illustrative — historique agrégé non branché pour l’instant.
        </div>
        <Divider className="my-4" />

        <LineChartPlaceholder />
      </Card>
    </div>
  );
}

function LineChartPlaceholder() {
  const w = 720;
  const h = 220;
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
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[180px] w-full">
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
