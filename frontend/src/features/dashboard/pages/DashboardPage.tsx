import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { DashboardSummaryDto } from "../../../shared/api/types/backend";
import { getDashboardSummary } from "../services/dashboard.service";

/**
 * Dashboard — vue synthétique depuis GET /dashboard/summary.
 */
export function DashboardPage() {
  const [data, setData] = React.useState<DashboardSummaryDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const apiMissing = !isApiConfigured();

  React.useEffect(() => {
    if (apiMissing) {
      setLoading(false);
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getDashboardSummary()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (cancelled) return;
        setData(null);
        if (e instanceof ApiHttpError) setError(e.message);
        else setError("Impossible de charger le dashboard.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiMissing]);

  const portfolio = data?.portfolio;
  const progress = data?.progress;
  const pnlColor =
    portfolio && portfolio.total_pnl >= 0 ? "#22C55E" : "#EF4444";
  const pnlPrefix = portfolio && portfolio.total_pnl >= 0 ? "+" : "";

  function formatTradeDate(iso: string) {
    try {
      return new Date(iso).toLocaleString(undefined, {
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
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
      </div>

      {apiMissing ? (
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code> pour afficher le
          dashboard.
        </Alert>
      ) : null}

      {error && !apiMissing ? (
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
      ) : null}

      {loading && !apiMissing ? (
        <div className="inline-flex items-center gap-2 text-sm text-[#E6EDF3]/70">
          <Spinner /> Chargement…
        </div>
      ) : null}

      {/* Portfolio + Progress */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold">Portfolio</h2>
          <Divider className="my-4" />

          {portfolio ? (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">Total value</div>
                <div className="text-lg font-semibold text-[#E6EDF3]">
                  ${portfolio.total_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">Cash</div>
                <div className="text-sm font-semibold text-[#E6EDF3]">
                  ${portfolio.cash_balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">P/L</div>
                <div className="text-sm font-semibold" style={{ color: pnlColor }}>
                  {pnlPrefix}$
                  {Math.abs(portfolio.total_pnl).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          ) : !loading && !error ? (
            <p className="text-sm text-[#E6EDF3]/70">—</p>
          ) : null}
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Learning progress</h2>
          <Divider className="my-4" />

          {progress ? (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">Lessons completed</div>
                <div className="text-lg font-semibold text-[#E6EDF3]">
                  {progress.total_lessons_completed}
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">Courses completed</div>
                <div className="text-sm font-semibold text-[#E6EDF3]">
                  {progress.total_courses_completed}
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">Overall</div>
                <div className="text-sm font-semibold text-[#3B82F6]">
                  {progress.overall_progress.toFixed(1)}%
                </div>
              </div>
            </div>
          ) : !loading && !error ? (
            <p className="text-sm text-[#E6EDF3]/70">—</p>
          ) : null}
        </Card>
      </div>

      {/* Market overview */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Market overview</h2>
        <Divider className="my-4" />

        <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
          <div className="space-y-3">
            {data?.market_preview && data.market_preview.length > 0 ? (
              data.market_preview.map((m) => {
                const up = m.change_percent >= 0;
                return (
                  <div key={m.symbol} className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium">{m.symbol}</div>
                      <div className="text-xs text-[#E6EDF3]/55 truncate max-w-[180px]">
                        {m.name}
                      </div>
                    </div>
                    <div className="text-sm text-[#E6EDF3]/80">
                      ${m.price.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </div>
                    <div
                      className="text-sm font-medium min-w-[56px] text-right"
                      style={{ color: up ? "#22C55E" : "#EF4444" }}
                    >
                      {up ? "+" : ""}
                      {m.change_percent.toFixed(2)}%
                    </div>
                  </div>
                );
              })
            ) : !loading && data ? (
              <p className="text-sm text-[#E6EDF3]/70">Aucun aperçu marché pour le moment.</p>
            ) : null}
          </div>

          <div className="rounded-xl bg-[#111827] border border-white/10 p-3">
            <div className="text-xs text-[#E6EDF3]/70">Trend (indicatif)</div>
            <svg
              viewBox="0 0 160 44"
              className="mt-2 h-10 w-full"
              aria-hidden
            >
              <defs>
                <linearGradient id="dashGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#3B82F6" stopOpacity="0.25" />
                  <stop offset="1" stopColor="#3B82F6" stopOpacity="1" />
                </linearGradient>
              </defs>
              <path
                d="M0,30 C20,24 35,34 50,26 C70,16 85,20 100,14 C120,6 138,15 160,10"
                fill="none"
                stroke="url(#dashGrad)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </Card>

      {/* Recent activity + Learn */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold">Recent activity</h2>
          <Divider className="my-4" />

          {data?.recent_activity && data.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {data.recent_activity.map((t, idx) => (
                <div
                  key={`${t.symbol}-${t.created_at}-${idx}`}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span className="font-medium">{t.symbol}</span>
                  <span className="text-[#E6EDF3]/80 capitalize">{t.side}</span>
                  <span className="text-[#E6EDF3]/60 text-xs">{formatTradeDate(t.created_at)}</span>
                </div>
              ))}
            </div>
          ) : !loading && data ? (
            <p className="text-sm text-[#E6EDF3]/70">Aucun trade récent.</p>
          ) : null}
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Courses</h2>
          <div className="text-sm text-[#E6EDF3]/70">Continue learning</div>
          <Divider className="my-4" />

          {progress ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">Overall</div>
                <div className="text-sm font-semibold text-[#3B82F6]">
                  {progress.overall_progress.toFixed(1)}%
                </div>
              </div>
              <Link
                to="/learn"
                className="inline-block text-sm font-medium text-[#3B82F6] underline underline-offset-2"
              >
                Open Learn →
              </Link>
            </div>
          ) : !loading && !error ? (
            <p className="text-sm text-[#E6EDF3]/70">—</p>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
