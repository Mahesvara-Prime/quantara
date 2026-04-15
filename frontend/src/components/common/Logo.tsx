import React from "react";
import { Link } from "react-router-dom";

export type LogoProps = {
  /** Si défini, le logo renvoie vers cette route (ex. `/` = landing). */
  to?: string;
  onClick?: () => void;
};

/**
 * Logo texte (placeholder).
 * L’objectif est d’avoir un composant unique remplaçable plus tard par un SVG officiel.
 */
export function Logo({ to, onClick }: LogoProps) {
  const inner = (
    <>
      <div className="h-9 w-9 shrink-0 rounded-xl bg-[#3B82F6]/20 border border-[#3B82F6]/30" />
      <span className="text-[#E6EDF3] font-semibold tracking-wide">Quantara</span>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={[
          "inline-flex max-w-full items-center gap-2 select-none rounded-lg outline-none",
          "transition-opacity hover:opacity-90",
          "focus-visible:ring-2 focus-visible:ring-[#3B82F6]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]",
        ].join(" ")}
        aria-label="Quantara — accueil"
      >
        {inner}
      </Link>
    );
  }

  return <div className="flex items-center gap-2 select-none">{inner}</div>;
}

