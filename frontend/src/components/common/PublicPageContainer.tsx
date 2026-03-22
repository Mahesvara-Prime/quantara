import React from "react";

/**
 * Conteneur responsive commun aux pages publiques.
 * Centralise largeur et padding pour éviter de répéter la même “grille” partout.
 */
export function PublicPageContainer({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</div>;
}

