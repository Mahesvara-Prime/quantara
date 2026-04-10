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

      {/* Largeur sidebar alignée sur `PrivateSidebar` (w-72 = 18rem) */}
      <main className="min-h-dvh md:pl-72">
        <div className="mx-auto max-w-[1600px] py-6 px-4 sm:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

