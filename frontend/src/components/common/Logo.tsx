import React from "react";

/**
 * Logo texte (placeholder).
 * L’objectif est d’avoir un composant unique remplaçable plus tard par un SVG officiel.
 */
export function Logo() {
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="h-9 w-9 rounded-xl bg-[#3B82F6]/20 border border-[#3B82F6]/30" />
      <span className="text-[#E6EDF3] font-semibold tracking-wide">Quantara</span>
    </div>
  );
}

