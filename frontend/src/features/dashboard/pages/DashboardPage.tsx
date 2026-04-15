import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { ErrorRetryBanner } from "../../../components/ui/ErrorRetryBanner";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { DashboardSummaryDto } from "../../../shared/api/types/backend";
import { compositeSparklineFromPreview, MarketMiniSparkline } from "../../markets/utils/sparkline";
import { DashboardWelcomeCard } from "../../onboarding/components/DashboardWelcomeCard";
import { getDashboardSummary } from "../services/dashboard.service";

/**
 * Tableau de bord — GET /dashboard/summary, accueil optionnel, réessai sur erreur.
 */
export function DashboardPage() {
  const [data, setData] = React.useState<DashboardSummaryDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryNonce, setRetryNonce] = React.useState(0);

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
        else setError("Impossible de charger le tableau de bord.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiMissing, retryNonce]);

  const portfolio = data?.portfolio;
  const progress = data?.progress;
  const pnlColor =
    portfolio && portfolio.total_pnl >= 0 ? "#22C55E" : "#EF4444";
  const pnlPrefix = portfolio && portfolio.total_pnl >= 0 ? "+" : "";

  const marketOverviewSparkline = React.useMemo(() => {
    const preview = data?.market_preview;
    if (!preview?.length) return null;
    const { points, up } = compositeSparklineFromPreview(preview);
    if (points.length < 2) return null;
    return <MarketMiniSparkline uid="dash-overview" up={up} points={points} w={160} h={44} />;
  }, [data?.market_preview]);

  function formatTradeDate(iso: string) {
    try {
      return new Date(iso).toLocaleString("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  }

  const sideFr: Record<string, string> = {
    buy: "achat",
    sell: "vente",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="mt-1 text-sm text-[#E6EDF3]/60">
          Aperçu du portefeuille simulé, de la formation et du marché.
        </p>
      </div>

      <DashboardWelcomeCard />

      {apiMissing ? (
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code> pour afficher les
          données.
        </Alert>
      ) : null}

      {error && !apiMissing ? (
        <ErrorRetryBanner
          message={error}
          disabled={loading}
          onRetry={() => setRetryNonce((n) => n + 1)}
        />
      ) : null}

      {loading && !apiMissing ? (
        <div className="inline-flex items-center gap-2 text-sm text-[#E6EDF3]/70">
          <Spinner /> Chargement…
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold">Portefeuille (simulation)</h2>
          <Divider className="my-4" />

          {portfolio ? (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">Valeur totale</div>
                <div className="text-lg font-semibold text-[#E6EDF3]">
                  ${portfolio.total_value.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">Cash</div>
                <div className="text-sm font-semibold text-[#E6EDF3]">
                  ${portfolio.cash_balance.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">P / L latent</div>
                <div className="text-sm font-semibold" style={{ color: pnlColor }}>
                  {pnlPrefix}$
                  {Math.abs(portfolio.total_pnl).toLocaleString("fr-FR", {
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
          <h2 className="text-base font-semibold">Progression (formation)</h2>
          <Divider className="my-4" />

          {progress ? (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">Leçons terminées</div>
                <div className="text-lg font-semibold text-[#E6EDF3]">
                  {progress.total_lessons_completed}
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">Cours terminés</div>
                <div className="text-sm font-semibold text-[#E6EDF3]">
                  {progress.total_courses_completed}
                </div>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">Avancement global</div>
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

      <Card className="p-6">
        <h2 className="text-base font-semibold">Aperçu marché</h2>
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
                      <div className="max-w-[180px] truncate text-xs text-[#E6EDF3]/55">
                        {m.name}
                      </div>
                    </div>
                    <div className="text-sm text-[#E6EDF3]/80">
                      ${m.price.toLocaleString("fr-FR", { maximumFractionDigits: 6 })}
                    </div>
                    <div
                      className="min-w-[56px] text-right text-sm font-medium"
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

          <div className="rounded-xl border border-white/10 bg-[#111827] p-3">
            <div className="text-xs text-[#E6EDF3]/70">Tendance 24h (aperçu)</div>
            <p className="mt-1 text-[10px] leading-snug text-[#E6EDF3]/45">
              Synthèse des actifs listés (courbe cohérente avec les variations %).
            </p>
            <div className="mt-2 flex justify-center">
              {marketOverviewSparkline ??
                (!loading && data ? <span className="text-xs text-[#E6EDF3]/50">—</span> : null)}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold">Activité récente</h2>
          <Divider className="my-4" />

          {data?.recent_activity && data.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {data.recent_activity.map((t, idx) => (
                <div
                  key={`${t.symbol}-${t.created_at}-${idx}`}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span className="font-medium">{t.symbol}</span>
                  <span className="text-[#E6EDF3]/80">
                    {sideFr[t.side.toLowerCase()] ?? t.side}
                  </span>
                  <span className="text-xs text-[#E6EDF3]/60">{formatTradeDate(t.created_at)}</span>
                </div>
              ))}
            </div>
          ) : !loading && data ? (
            <div className="space-y-3 text-sm text-[#E6EDF3]/70">
              <p>Aucun trade récent.</p>
              <Link
                to="/simulation"
                className="inline-block font-medium text-[#3B82F6] underline underline-offset-2"
              >
                Passer un ordre simulé →
              </Link>
            </div>
          ) : null}
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Formation</h2>
          <div className="mt-1 text-sm text-[#E6EDF3]/70">Poursuivre les cours</div>
          <Divider className="my-4" />

          {progress ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">Avancement</div>
                <div className="text-sm font-semibold text-[#3B82F6]">
                  {progress.overall_progress.toFixed(1)}%
                </div>
              </div>
              <Link
                to="/learn"
                className="inline-block text-sm font-medium text-[#3B82F6] underline underline-offset-2"
              >
                Ouvrir Apprendre →
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
