import React from "react";
import { Outlet } from "react-router-dom";
import { PrivateSidebar } from "../../components/common/PrivateSidebar";

/**
 * Layout principal de l'interface privée.
 * - Sidebar fixe à gauche (via `PrivateSidebar`)
 * - Contenu à droite (via `Outlet`)
 * - Fond sombre cohérent avec la charte Quantara
 */
export function PrivateLayout() {
  return (
    <div className="min-h-dvh bg-[#111827] text-[#E6EDF3]">
      <PrivateSidebar />

      <main className="min-h-dvh lg:pl-64">
        <div className="py-6 px-4 sm:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

