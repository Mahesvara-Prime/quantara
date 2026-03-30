import React from "react";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";

export function ProgressPage() {
  /*
    Rôle: page Progress privée.
    Objectif UX (guide): MVP -> suivi performance simple.
    Wireframe (progress.md):
    - Overall Progress
    - 2 cartes: Courses / Trading
    - Performance Chart (placeholder)
    - Mistakes & Insights (liste)
  */
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Progress</h1>
        <p className="mt-1 text-sm text-[#E6EDF3]/70">Overall Progress: 35%</p>
      </div>

      {/* Cartes: Courses + Trading */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold">Courses</h2>
          <Divider className="my-4" />

          <div className="flex items-baseline justify-between gap-4">
            <div className="text-sm text-[#E6EDF3]/70">35% done</div>
            <div className="text-lg font-semibold text-[#3B82F6]">35%</div>
          </div>

          <div className="mt-4">
            {/* Barre de progression (UI) */}
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#3B82F6]"
                style={{ width: "35%" }}
              />
            </div>
          </div>

          {/* TODO: brancher la progression backend */}
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Trading</h2>
          <Divider className="my-4" />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-[#E6EDF3]/70">Win rate</div>
              <div className="text-lg font-semibold text-[#22C55E]">60%</div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-[#E6EDF3]/70">Total trades</div>
              <div className="text-sm font-semibold text-[#E6EDF3]">25</div>
            </div>
          </div>

          {/* TODO: brancher les stats backend */}
        </Card>
      </div>

      {/* Performance Chart (placeholder) */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Performance Chart</h2>
        <Divider className="my-4" />

        <div className="rounded-xl border border-white/10 bg-[#111827]/20 p-4">
          <div className="text-xs text-[#E6EDF3]/70">
            (progress over time)
          </div>
          <svg
            viewBox="0 0 720 220"
            className="mt-3 w-full h-[160px]"
            aria-label="Performance chart placeholder"
          >
            <rect x="0" y="0" width="720" height="220" rx="14" fill="#111827" />

            {Array.from({ length: 5 }).map((_, i) => {
              const y = (i / 4) * 220;
              return (
                <line
                  key={i}
                  x1="20"
                  x2="700"
                  y1={y}
                  y2={y}
                  stroke="#ffffff"
                  strokeOpacity="0.06"
                />
              );
            })}

            {/* Mock line */}
            <path
              d="M20,170 L140,155 L220,150 L330,120 L430,130 L560,90 L700,95"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* TODO: remplacer le placeholder par un vrai chart */}
      </Card>

      {/* Mistakes & Insights */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Mistakes & Insights</h2>
        <Divider className="my-4" />

        <ul className="space-y-2">
          <li className="text-sm text-[#E6EDF3]/80">- Entered too early</li>
          <li className="text-sm text-[#E6EDF3]/80">
            - No stop loss used
          </li>
        </ul>

        {/* TODO: structurer ces insights selon le backend */}
      </Card>
    </div>
  );
}

