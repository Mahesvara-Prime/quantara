import React from "react";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/*
        Rôle: page Dashboard privée.
        Objectif UX (guide): vue globale rapide, synthétique, pas de surcharge.
        Wireframe (dashboard-visuel.md): 2 cartes en haut, 1 carte "Market Overview",
        puis 2 cartes en bas.
      */}

      {/* En-tête synthétique (pas de surcharge) */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
      </div>

      {/* Bloc 1: Portfolio + Progression */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          {/* Section: Portfolio (wireframe: Value + Profit/Loss) */}
          <h2 className="text-base font-semibold">Portfolio</h2>
          <Divider className="my-4" />

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-4">
              <div className="text-sm text-[#E6EDF3]/70">Value</div>
              <div className="text-lg font-semibold text-[#E6EDF3]">$12,450</div>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <div className="text-sm text-[#E6EDF3]/70">+ Profit/Loss</div>
              <div className="text-sm font-semibold text-[#22C55E]">+$1,240</div>
            </div>
          </div>

          {/* TODO: brancher les données backend */}
        </Card>

        <Card className="p-6">
          {/* Section: Progress (wireframe: Learning + % Completed) */}
          <h2 className="text-base font-semibold">Progress</h2>
          <Divider className="my-4" />

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-4">
              <div className="text-sm text-[#E6EDF3]/70">Learning</div>
              <div className="text-lg font-semibold text-[#E6EDF3]">8/12</div>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <div className="text-sm text-[#E6EDF3]/70">% Completed</div>
              <div className="text-sm font-semibold text-[#3B82F6]">66.7%</div>
            </div>
          </div>

          {/* TODO: brancher la progression backend */}
        </Card>
      </div>

      {/* Bloc 2: Market Overview (wireframe: mini chart / top assets) */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Market Overview</h2>
        <Divider className="my-4" />

        <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
          {/* Zone "Top assets" */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">BTC</div>
              <div className="text-sm text-[#E6EDF3]/70">$43,000</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">ETH</div>
              <div className="text-sm text-[#E6EDF3]/70">$3,200</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">SOL</div>
              <div className="text-sm text-[#E6EDF3]/70">$120</div>
            </div>
          </div>

          {/* Mini chart (placeholder visuel) */}
          <div className="rounded-xl bg-[#111827] border border-white/10 p-3">
            <div className="text-xs text-[#E6EDF3]/70">mini chart</div>
            <svg
              viewBox="0 0 160 44"
              className="mt-2 h-10 w-full"
              aria-label="Mini chart placeholder"
            >
              <defs>
                <linearGradient id="dashGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#3B82F6" stopOpacity="0.25" />
                  <stop offset="1" stopColor="#3B82F6" stopOpacity="1" />
                </linearGradient>
              </defs>
              <path
                d="M0,30 C20,24 35,34 50,26 C70,16 85,20 100,14 C120,6 138,15 160,10"
                fill="none"
                stroke="url(#dashGrad)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M0,44 L0,30 C20,24 35,34 50,26 C70,16 85,20 100,14 C120,6 138,15 160,10 L160,44 Z"
                fill="url(#dashGrad)"
                opacity="0.2"
              />
            </svg>
          </div>
        </div>

        {/* TODO: afficher top assets + variation depuis backend */}
      </Card>

      {/* Bloc 3: Recent Trades + Courses continue */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold">Recent Trades</h2>
          <Divider className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-medium">BTC</div>
              <div className="text-sm text-[#E6EDF3]/70">Buy</div>
              <div className="text-sm text-[#22C55E]">+2.1%</div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-medium">ETH</div>
              <div className="text-sm text-[#E6EDF3]/70">Sell</div>
              <div className="text-sm text-[#EF4444]">-0.8%</div>
            </div>
          </div>

          {/* TODO: table/rows depuis backend */}
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Courses</h2>
          <div className="text-sm text-[#E6EDF3]/70">Continue</div>
          <Divider className="my-4" />

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-medium">Trading Basics</div>
              <div className="text-sm text-[#3B82F6]">40%</div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-medium">Risk Management</div>
              <div className="text-sm text-[#3B82F6]">70%</div>
            </div>
          </div>

          {/* TODO: navigation vers /learn */}
        </Card>
      </div>
    </div>
  );
}

