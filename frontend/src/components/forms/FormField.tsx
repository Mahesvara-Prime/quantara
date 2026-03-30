import React from "react";
import { Input, type InputProps } from "../ui/Input";
import { Label } from "../ui/Label";

export type FormFieldProps = {
  /** Identifiant du champ, réutilisé pour l’accessibilité (label ↔ input). */
  id: string;
  /** Libellé affiché au-dessus du champ. */
  label: string;
  /** Message d’erreur (UI). */
  error?: string;
  /** Props passées à l’input sous-jacent. */
  inputProps: Omit<InputProps, "id" | "error">;
};

/**
 * Bloc de champ standard (Label + Input + Error).
 * Évite la duplication et garde la cohérence visuelle des formulaires.
 */
export function FormField({ id, label, error, inputProps }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} error={error} {...inputProps} />
      {error ? <div className="text-xs text-red-300/80">{error}</div> : null}
    </div>
  );
}

