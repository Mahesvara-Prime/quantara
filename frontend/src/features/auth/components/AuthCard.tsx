import React from "react";
import { Card } from "../../../components/ui/Card";

/**
 * Carte standard des écrans d’auth — relief discret, hiérarchie titres.
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
    <Card className="border-white/[0.09] bg-[#111827]/80 p-6 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-8">
      <h1 className="text-xl font-semibold tracking-tight text-[#F9FAFB] sm:text-2xl">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#E6EDF3]/68">{subtitle}</p>
      <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div>{children}</div>
    </Card>
  );
}
