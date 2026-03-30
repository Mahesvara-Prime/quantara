import React from "react";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

/**
 * Label simple, réutilisable.
 * Reste volontairement minimal (pas de logique de formulaire ici).
 */
export function Label({ className = "", ...props }: LabelProps) {
  return (
    <label
      className={["text-sm text-[#E6EDF3]/90", className].join(" ")}
      {...props}
    />
  );
}

