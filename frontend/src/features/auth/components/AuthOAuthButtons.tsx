import React from "react";
import { Button } from "../../../components/ui/Button";

/**
 * Boutons OAuth (UI uniquement).
 * Important : aucune intégration backend, aucune redirection, aucun token.
 */
export function AuthOAuthButtons() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Button type="button" variant="secondary">
        Continuer avec Google
      </Button>
      <Button type="button" variant="secondary">
        Continuer avec LinkedIn
      </Button>
    </div>
  );
}

