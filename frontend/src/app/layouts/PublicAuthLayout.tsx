import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Logo } from "../../components/common/Logo";
import { PublicPageContainer } from "../../components/common/PublicPageContainer";

/**
 * Layout auth public — même univers visuel que la landing (fond, accent), logo cliquable.
 */
export function PublicAuthLayout() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#111827] text-[#E6EDF3]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-30%,rgba(59,130,246,0.14),transparent)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <PublicPageContainer>
        <div className="relative py-10 sm:py-14">
          <div className="mb-8 flex flex-col items-center gap-2">
            <Link
              to="/"
              className="rounded-xl outline-none ring-offset-4 ring-offset-[#111827] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50"
            >
              <Logo />
            </Link>
            <Link
              to="/"
              className="text-xs text-[#E6EDF3]/50 transition-colors hover:text-[#E6EDF3]/75"
            >
              ← Retour à l’accueil
            </Link>
          </div>

          <div className="mx-auto w-full max-w-md">
            <Outlet />
          </div>

          <p className="mx-auto mt-10 max-w-md text-center text-xs text-[#E6EDF3]/45">
            En continuant, tu accèdes à un environnement{" "}
            <strong className="font-medium text-[#E6EDF3]/55">éducatif et simulé</strong>. Aucune
            opération sur de l’argent réel n’est proposée ici.
          </p>
        </div>
      </PublicPageContainer>
    </div>
  );
}
