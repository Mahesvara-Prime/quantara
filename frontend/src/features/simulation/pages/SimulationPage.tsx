import React from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Label } from "../../../components/ui/Label";
import { Alert } from "../../../components/ui/Alert";
import { CandlestickPlaceholder } from "../../private/components/CandlestickPlaceholder";

export function SimulationPage() {
  return <Simulation />;
}

/**
 * Rôle: page Simulation privée.
 * Objectif UX (guide): simuler un trade, simple et pédagogique.
 * Wireframe: simulation-visuel.md
 *
 * Contenu:
 * - graphique principal (candlestick placeholder)
 * - trade panel: Buy/Sell, amount, volume/units, stop loss, take profit
 * - bouton “Execute Trade”
 */
function Simulation() {
  const [side, setSide] = React.useState<"buy" | "sell">("buy");

  const [amount, setAmount] = React.useState<string>("1");
  const [units, setUnits] = React.useState<string>("0.5");
  const [stopLoss, setStopLoss] = React.useState<string>("42000");
  const [takeProfit, setTakeProfit] = React.useState<string>("45000");

  const [result, setResult] = React.useState<
    null | { variant: "info" | "success" | "error"; title: string; body: string }
  >(null);

  function executeTrade() {
    // Simulation UI seulement: pas de backend.
    setResult({
      variant: "success",
      title: "Trade simulé",
      body: `Action: ${side === "buy" ? "Buy" : "Sell"} • Amount: ${amount} • Units: ${units}`,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Simulation</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        {/* Colonne gauche: chart principal */}
        <div>
          <CandlestickPlaceholder hint="Timeframe placeholder • données mock" />
        </div>

        {/* Colonne droite: Trade Panel */}
        <Card className="p-6">
          <h2 className="text-base font-semibold">Trade Panel</h2>
          <Divider className="my-4" />

          {/* Buy / Sell */}
          <div className="flex gap-2">
            <Button
              size="md"
              variant={side === "buy" ? "primary" : "secondary"}
              type="button"
              onClick={() => setSide("buy")}
            >
              Buy
            </Button>
            <Button
              size="md"
              variant={side === "sell" ? "primary" : "secondary"}
              type="button"
              onClick={() => setSide("sell")}
            >
              Sell
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="sim-amount">Amount</Label>
              <Input
                id="sim-amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
              />
            </div>

            {/* Volume / Units */}
            <div className="space-y-2">
              <Label htmlFor="sim-units">Volume / Units</Label>
              <Input
                id="sim-units"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                inputMode="decimal"
              />
            </div>

            {/* Stop Loss */}
            <div className="space-y-2">
              <Label htmlFor="sim-stop">Stop Loss</Label>
              <Input
                id="sim-stop"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                inputMode="decimal"
              />
            </div>

            {/* Take Profit */}
            <div className="space-y-2">
              <Label htmlFor="sim-tp">Take Profit</Label>
              <Input
                id="sim-tp"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                inputMode="decimal"
              />
            </div>
          </div>

          {/* Execute Trade */}
          <div className="mt-6">
            <Button
              size="lg"
              variant="primary"
              className="w-full"
              onClick={executeTrade}
              type="button"
            >
              Execute Trade
            </Button>
          </div>

          {result ? (
            <div className="mt-4">
              <Alert variant={result.variant} title={result.title}>
                {result.body}
              </Alert>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

