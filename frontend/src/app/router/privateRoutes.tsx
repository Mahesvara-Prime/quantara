import React from "react";
import type { RouteObject } from "react-router-dom";
import { RequireAuth } from "../../features/auth/components/RequireAuth";
import { PrivateLayout } from "../layouts/PrivateLayout";
import {
  PortfolioPage,
  ProfilePage,
  SettingsPage,
  TradeHistoryPage,
} from "../../features/private";
import { DashboardPage } from "../../features/dashboard";
import { MarketsPage, MarketAssetPage } from "../../features/markets";
import { SimulationPage } from "../../features/simulation";
import { LearnPage, CourseDetailPage, LessonPage } from "../../features/education";
import { ProgressPage } from "../../features/progress";

/**
 * Routes privées (interface authentifiée).
 *
 * - Le public existant reste inchangé (`publicRoutes`).
 * - Les pages privées sont protégées via `RequireAuth` (fake auth pour l'instant).
 */
export const privateRoutes: RouteObject[] = [
  {
    element: (
      <RequireAuth>
        <PrivateLayout />
      </RequireAuth>
    ),
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/markets", element: <MarketsPage /> },
      {
        path: "/markets/:asset",
        element: <MarketAssetPage />,
      },
      { path: "/simulation", element: <SimulationPage /> },
      { path: "/portfolio", element: <PortfolioPage /> },
      {
        path: "/trade-history",
        element: <TradeHistoryPage />,
      },
      { path: "/learn", element: <LearnPage /> },
      {
        path: "/learn/:course",
        element: <CourseDetailPage />,
      },
      {
        path: "/learn/:course/:lesson",
        element: <LessonPage />,
      },
      { path: "/progress", element: <ProgressPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
];

