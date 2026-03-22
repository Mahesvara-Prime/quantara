import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Layout des pages publiques.
 * Applique le fond global (bleu profond) et la couleur de texte.
 */
export function PublicLayout() {
  return (
    <div className="min-h-dvh bg-[#111827] text-[#E6EDF3]">
      <Outlet />
    </div>
  );
}

