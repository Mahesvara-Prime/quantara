import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /**
   * Message d’erreur (UI).
   * On évite toute validation complexe ici : les règles métier doivent rester ailleurs.
   */
  error?: string;
};

/**
 * Champ de saisie réutilisable.
 * Standardise le style (surface sombre, bordure subtile, focus accent).
 */
export function Input({ error, className = "", ...props }: InputProps) {
  return (
    <input
      className={[
        "h-10 w-full rounded-lg bg-[#111827] px-3 text-sm text-[#E6EDF3]",
        "border border-white/10 placeholder:text-white/35",
        "focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent",
        error ? "border-red-400/60 focus:ring-red-400/60" : "",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

