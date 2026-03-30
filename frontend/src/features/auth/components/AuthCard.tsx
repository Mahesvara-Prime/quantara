import React from "react";
import { Card } from "../../../components/ui/Card";

/**
 * Conteneur standard des écrans d’auth.
 * Centralise le style (card) et la hiérarchie (titre/sous-titre) pour garder une UI cohérente.
 */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6 sm:p-7">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-[#E6EDF3]/70">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </Card>
  );
}

