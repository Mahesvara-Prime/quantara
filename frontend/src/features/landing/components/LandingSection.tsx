import React from "react";
import { Card } from "../../../components/ui/Card";

export type LandingSectionItem = {
  title: string;
  description: string;
};

/**
 * Section générique pour la landing.
 * Centralise la structure (titre, sous-titre, grille) afin de rester modulaire et cohérent.
 */
export function LandingSection({
  id,
  title,
  subtitle,
  items,
}: {
  id: string;
  title: string;
  subtitle: string;
  items: LandingSectionItem[];
}) {
  return (
    <section id={id} className="py-14 sm:py-16 scroll-mt-20">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-[#E6EDF3]/75">{subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Card key={it.title} className="p-5">
            <div className="text-sm font-medium">{it.title}</div>
            <div className="mt-2 text-sm leading-relaxed text-[#E6EDF3]/75">
              {it.description}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

