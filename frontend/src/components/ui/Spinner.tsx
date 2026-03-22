import React from "react";

/**
 * Spinner minimal pour états de chargement (UI).
 * Aucune dépendance externe : rapide, cohérent, facile à réutiliser.
 */
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={[
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white",
        className,
      ].join(" ")}
      aria-hidden="true"
    />
  );
}

