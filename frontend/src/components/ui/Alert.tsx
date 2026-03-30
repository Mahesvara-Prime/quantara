import React from "react";

type AlertVariant = "info" | "success" | "error";

/**
 * Alert UI (info/success/error).
 * Sert à afficher un retour utilisateur sans dépendre d’une logique métier.
 */
export function Alert({
  variant = "info",
  title,
  children,
}: {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
}) {
  const styles: Record<AlertVariant, string> = {
    info: "border-white/10 bg-white/5 text-[#E6EDF3]",
    success: "border-emerald-400/30 bg-emerald-500/10 text-[#E6EDF3]",
    error: "border-red-400/30 bg-red-500/10 text-[#E6EDF3]",
  };

  return (
    <div className={["rounded-lg border px-4 py-3 text-sm", styles[variant]].join(" ")}>
      {title ? <div className="mb-1 font-medium">{title}</div> : null}
      <div className="text-[#E6EDF3]/90">{children}</div>
    </div>
  );
}

