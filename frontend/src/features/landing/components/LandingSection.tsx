import React from "react";
import { Card } from "../../../components/ui/Card";

export type LandingSectionItem = {
  title: string;
  description: string;
};

/**
 * Section générique landing — cartes avec survol discret et hiérarchie lisible.
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
    <section id={id} className="scroll-mt-24 py-14 sm:py-20">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#3B82F6]/90">
          Quantara
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#F9FAFB] sm:text-3xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#E6EDF3]/75 sm:text-base">
          {subtitle}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <Card
            key={it.title}
            className={[
              "group border-white/[0.08] bg-[#111827]/40 p-5 transition-all duration-200",
              "hover:border-[#3B82F6]/25 hover:bg-[#111827]/70 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.08)]",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3B82F6]/15 text-xs font-bold text-[#3B82F6]"
                aria-hidden
              >
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-semibold text-[#E6EDF3] group-hover:text-[#F9FAFB]">
                  {it.title}
                </div>
                <div className="mt-2 text-sm leading-relaxed text-[#E6EDF3]/72">{it.description}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
