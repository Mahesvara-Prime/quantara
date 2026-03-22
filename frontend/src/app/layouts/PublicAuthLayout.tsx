import React from "react";
import { Outlet } from "react-router-dom";
import { Logo } from "../../components/common/Logo";
import { PublicPageContainer } from "../../components/common/PublicPageContainer";

/**
 * Layout dédié aux écrans d’auth publics.
 * - Centre une card (contenu rendu via l’Outlet).
 * - Ajoute un en-tête minimal (logo) pour la cohérence de marque.
 */
export function PublicAuthLayout() {
  return (
    <div className="min-h-dvh bg-[#111827] text-[#E6EDF3]">
      <PublicPageContainer>
        <div className="py-10">
          <div className="mb-8 flex items-center justify-center">
            <Logo />
          </div>

          <div className="mx-auto w-full max-w-md">
            <Outlet />
          </div>
        </div>
      </PublicPageContainer>
    </div>
  );
}

