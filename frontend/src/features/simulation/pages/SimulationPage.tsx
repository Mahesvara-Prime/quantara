import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "../../../components/feedback/ToastContext";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Label } from "../../../components/ui/Label";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { CandleDto, PositionDto } from "../../../shared/api/types/backend";
import { AssetCandleChart, type ChartTradingOverlay } from "../../markets/components/AssetCandleChart";
import { ASSET_CHART_TIMEFRAMES } from "../../markets/constants";
import { getAssetCandles } from "../../markets/services/markets.service";
import { getPortfolioPositions } from "../../private/services/portfolio.service";
import { executeTrade } from "../services/simulation.service";

export function SimulationPage() {
  return <Simulation />;
}

/**
 * Page Simulation — ordres papier + graphique OHLC pour le symbole saisi (même source que Markets).
 */
function Simulation() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const symFromUrl = searchParams.get("symbol")?.trim().toUpperCase() ?? "";

  const [symbol, setSymbol] = React.useState(() => symFromUrl || "BTC");
  const [debouncedSymbol, setDebouncedSymbol] = React.useState(() => symFromUrl || "BTC");
  const [side, setSide] = React.useState<"buy" | "sell">("buy");
  const [amount, setAmount] = React.useState<string>("100");
  const [stopLoss, setStopLoss] = React.useState<string>("");
  const [takeProfit, setTakeProfit] = React.useState<string>("");

  const [positions, setPositions] = React.useState<PositionDto[]>([]);
  const [candles, setCandles] = React.useState<CandleDto[]>([]);
  const [chartLoading, setChartLoading] = React.useState(false);
  const [chartError, setChartError] = React.useState<string | null>(null);

  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<
    null | { variant: "success" | "error"; title: string; body: string }
  >(null);

  const apiMissing = !isApiConfigured();

  React.useEffect(() => {
    if (symFromUrl) {
      setSymbol(symFromUrl);
      setDebouncedSymbol(symFromUrl);
    }
  }, [symFromUrl]);

  React.useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSymbol(symbol.trim().toUpperCase() || "BTC");
    }, 400);
    return () => window.clearTimeout(t);
  }, [symbol]);

  React.useEffect(() => {
    if (apiMissing || !debouncedSymbol) {
      setCandles([]);
      setChartError(null);
      setChartLoading(false);
      return;
    }

    let cancelled = false;
    setChartLoading(true);
    setChartError(null);

    getAssetCandles(debouncedSymbol, ASSET_CHART_TIMEFRAMES[0].apiValue, 100)
      .then((c) => {
        if (!cancelled) setCandles(c);
      })
      .catch((e) => {
        if (cancelled) return;
        setCandles([]);
        if (e instanceof ApiHttpError) setChartError(e.message);
        else setChartError("Impossible de charger les bougies.");
      })
      .finally(() => {
        if (!cancelled) setChartLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSymbol, apiMissing]);

  const refreshPositions = React.useCallback(() => {
    if (apiMissing) return;
    getPortfolioPositions()
      .then(setPositions)
      .catch(() => setPositions([]));
  }, [apiMissing]);

  React.useEffect(() => {
    refreshPositions();
  }, [refreshPositions, debouncedSymbol]);

  const tradingOverlay = React.useMemo((): ChartTradingOverlay | null => {
    const sym = debouncedSymbol.trim().toUpperCase();
    const p = positions.find((x) => x.symbol.trim().toUpperCase() === sym);
    if (!p || p.quantity <= 0) return null;
    return {
      averageEntryPrice: p.average_entry_price,
      stopLoss: p.stop_loss ?? undefined,
      takeProfit: p.take_profit ?? undefined,
    };
  }, [positions, debouncedSymbol]);

  async function handleExecuteTrade() {
    setResult(null);
    if (apiMissing) {
      setResult({
        variant: "error",
        title: "Configuration",
        body: "Définis VITE_API_BASE_URL et connecte-toi pour exécuter un trade simulé.",
      });
      return;
    }

    const sym = symbol.trim().toUpperCase();
    const amt = Number.parseFloat(amount.replace(",", "."));
    if (!sym) {
      setResult({ variant: "error", title: "Validation", body: "Indique un symbole (ex. BTC)." });
      return;
    }
    if (!Number.isFinite(amt) || amt <= 0) {
      setResult({
        variant: "error",
        title: "Validation",
        body: "Le montant doit être un nombre strictement positif.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const body: Parameters<typeof executeTrade>[0] = { symbol: sym, side, amount: amt };
      if (side === "buy") {
        const slRaw = stopLoss.replace(",", ".").trim();
        const tpRaw = takeProfit.replace(",", ".").trim();
        if (slRaw) {
          const sl = Number.parseFloat(slRaw);
          if (Number.isFinite(sl) && sl > 0) body.stop_loss = sl;
        }
        if (tpRaw) {
          const tp = Number.parseFloat(tpRaw);
          if (Number.isFinite(tp) && tp > 0) body.take_profit = tp;
        }
      }
      const trade = await executeTrade(body);
      refreshPositions();
      setResult({
        variant: "success",
        title: "Ordre exécuté",
        body: `${trade.side.toUpperCase()} ${trade.symbol} · prix ${trade.price.toLocaleString(undefined, { maximumFractionDigits: 8 })} · qté ${trade.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })} · id #${trade.id}`,
      });
      showToast("Ordre simulé enregistré.", "success");
    } catch (e) {
      if (e instanceof ApiHttpError) {
        setResult({ variant: "error", title: "Erreur serveur", body: e.message });
      } else {
        setResult({
          variant: "error",
          title: "Erreur",
          body: "Impossible d’exécuter le trade. Réessaie plus tard.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Simulation</h1>
        <p className="mt-1 text-sm text-[#E6EDF3]/60">
          Achat : montant en USD · Vente : quantité d’actif. Le graphique suit le symbole ci-dessous
          (même source que la fiche Marchés). Tu peux ouvrir cette page depuis une fiche avec le bon
          symbole déjà rempli.
        </p>
      </div>

      {apiMissing ? (
        <Alert variant="error" title="API non configurée">
          Ajoute <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code> et redémarre le
          serveur de dev.
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[#E6EDF3]/90">
              Graphique · {debouncedSymbol}
            </h2>
            <Link
              to={`/markets/${encodeURIComponent(debouncedSymbol)}`}
              className="text-xs font-medium text-[#3B82F6] underline underline-offset-2"
            >
              Fiche actif →
            </Link>
          </div>
          {chartLoading ? (
            <div className="flex min-h-[200px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0d1117] text-sm text-[#E6EDF3]/70">
              <Spinner /> Chargement des bougies…
            </div>
          ) : chartError ? (
            <Alert variant="error" title="Graphique">
              {chartError}
            </Alert>
          ) : (
            <AssetCandleChart candles={candles} tradingOverlay={tradingOverlay} />
          )}
        </div>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Panneau d’ordre</h2>
          <Divider className="my-4" />

          <div className="flex gap-2">
            <Button
              size="md"
              variant={side === "buy" ? "primary" : "secondary"}
              type="button"
              onClick={() => setSide("buy")}
              disabled={submitting}
            >
              Achat
            </Button>
            <Button
              size="md"
              variant={side === "sell" ? "primary" : "secondary"}
              type="button"
              onClick={() => setSide("sell")}
              disabled={submitting}
            >
              Vente
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sim-symbol">Symbole</Label>
              <Input
                id="sim-symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="BTC"
                autoCapitalize="characters"
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sim-amount">Montant / quantité</Label>
              <Input
                id="sim-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                disabled={submitting}
              />
            </div>

            {side === "buy" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="sim-sl">Stop loss (USD, optionnel)</Label>
                  <Input
                    id="sim-sl"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    placeholder="Sous le prix d’entrée"
                    inputMode="decimal"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sim-tp">Take profit (USD, optionnel)</Label>
                  <Input
                    id="sim-tp"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    placeholder="Au-dessus du prix d’entrée"
                    inputMode="decimal"
                    disabled={submitting}
                  />
                </div>
                <p className="text-xs text-[#E6EDF3]/50">
                  Les niveaux s’affichent sur le graphique pour la position ouverte sur ce symbole.
                </p>
              </>
            ) : null}
          </div>

          <div className="mt-6">
            <Button
              size="lg"
              variant="primary"
              className="w-full"
              onClick={handleExecuteTrade}
              type="button"
              disabled={submitting || apiMissing}
            >
              {submitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Spinner /> Exécution…
                </span>
              ) : (
                "Exécuter l’ordre"
              )}
            </Button>
          </div>

          {result ? (
            <div className="mt-4">
              <Alert variant={result.variant === "success" ? "success" : "error"} title={result.title}>
                {result.body}
              </Alert>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
