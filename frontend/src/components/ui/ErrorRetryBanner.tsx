import React from "react";
import { Alert } from "./Alert";
import { Button } from "./Button";

/**
 * Message d’erreur API + action « Réessayer » (incrémente un compteur consommé par useEffect).
 */
export function ErrorRetryBanner({
  message,
  onRetry,
  disabled,
}: {
  message: string;
  onRetry: () => void;
  disabled?: boolean;
}) {
  return (
    <Alert variant="error" title="Erreur">
      <div className="space-y-3">
        <p className="text-[#E6EDF3]/90">{message}</p>
        <p className="text-xs text-[#E6EDF3]/55">
          Si le fournisseur de cours limite les requêtes, attends quelques secondes avant de réessayer.
        </p>
        <Button type="button" size="sm" variant="secondary" disabled={disabled} onClick={onRetry}>
          Réessayer
        </Button>
      </div>
    </Alert>
  );
}
