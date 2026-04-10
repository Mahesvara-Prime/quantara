import React from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Label } from "../../../components/ui/Label";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { CandlestickPlaceholder } from "../../private/components/CandlestickPlaceholder";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import { executeTrade } from "../services/simulation.service";

export function SimulationPage() {
  return <Simulation />;
}

/**
 * Page Simulation privée — envoi d’un ordre papier au backend (symbol, side, amount).
 * Buy : montant en USD à dépenser. Sell : quantité d’actif à vendre (voir API).
 */
function Simulation() {
  const [symbol, setSymbol] = React.useState("BTC");
  const [side, setSide] = React.useState<"buy" | "sell">("buy");
  const [amount, setAmount] = React.useState<string>("100");

  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<
    null | { variant: "success" | "error"; title: string; body: string }
  >(null);

  const apiMissing = !isApiConfigured();

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
      const trade = await executeTrade({ symbol: sym, side, amount: amt });
      setResult({
        variant: "success",
        title: "Ordre exécuté",
        body: `${trade.side.toUpperCase()} ${trade.symbol} · prix ${trade.price.toLocaleString(undefined, { maximumFractionDigits: 8 })} · qté ${trade.quantity.toLocaleString(undefined, { maximumFractionDigits: 8 })} · id #${trade.id}`,
      });
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
          Buy : montant USD à allouer · Sell : quantité d’actif à vendre (backend MVP).
        </p>
      </div>

      {apiMissing ? (
        <Alert variant="error" title="API non configurée">
          Ajoute <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code> et redémarre le
          serveur de dev.
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div>
          <CandlestickPlaceholder hint="Graphique placeholder · données marché via Markets" />
        </div>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Trade Panel</h2>
          <Divider className="my-4" />

          <div className="flex gap-2">
            <Button
              size="md"
              variant={side === "buy" ? "primary" : "secondary"}
              type="button"
              onClick={() => setSide("buy")}
              disabled={submitting}
            >
              Buy
            </Button>
            <Button
              size="md"
              variant={side === "sell" ? "primary" : "secondary"}
              type="button"
              onClick={() => setSide("sell")}
              disabled={submitting}
            >
              Sell
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sim-symbol">Symbol</Label>
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
              <Label htmlFor="sim-amount">Amount</Label>
              <Input
                id="sim-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                disabled={submitting}
              />
            </div>
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
                "Execute Trade"
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
