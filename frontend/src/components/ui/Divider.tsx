import React from "react";

/** Séparateur visuel, utilisé pour structurer des blocs (auth, sections). */
export function Divider({ className = "" }: { className?: string }) {
  return <div className={["h-px w-full bg-white/10", className].join(" ")} />;
}

