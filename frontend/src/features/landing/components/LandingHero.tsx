import React from "react";
import { Link } from "react-router-dom";
import { PublicPageContainer } from "../../../components/common/PublicPageContainer";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../auth/AuthContext";
import bgLanding from "../../../assets/img/bg_landing.webp";

/**
 * Hero — promesse claire, rappel pédagogique / papier trading, CTA doubles.
 */
export function LandingHero() {
  const { user, ready, signOut } = useAuth();
  const isLoggedIn = Boolean(ready && user);

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage: `url(${bgLanding})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#111827]/45 via-[#111827]/78 to-[#111827]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />

      <PublicPageContainer>
        <div className="relative py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-[#E6EDF3]/90">
              <span
                className="h-1.5 w-1.5 motion-reduce:animate-none animate-pulse rounded-full bg-[#22C55E]"
                aria-hidden
              />
              Marchés · Simulation papier · Formation
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#F9FAFB] sm:text-5xl sm:leading-[1.1]">
              Comprendre les marchés, s’entraîner sans risque, progresser pas à pas.
            </h1>

            <p className="mt-5 text-base leading-relaxed text-[#E6EDF3]/80 sm:text-lg">
              Quantara regarde les cours en direct, un moteur de{" "}
              <strong className="font-semibold text-[#E6EDF3]">trading simulé</strong> et des parcours
              pédagogiques — pour apprendre dans un cadre clair, sans jargon inutile.
            </p>

            <ul className="mt-6 flex flex-col gap-2 text-sm text-[#E6EDF3]/72 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
              <li>Données marché &amp; graphiques interactifs</li>
              <li>Portefeuille fictif &amp; historique des ordres</li>
              <li>Cours et suivi de progression</li>
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              {isLoggedIn ? (
                <>
                  <Link to="/dashboard">
                    <Button size="lg" type="button">
                      Tableau de bord
                    </Button>
                  </Link>
                  <Button variant="secondary" size="lg" type="button" onClick={() => signOut()}>
                    Se déconnecter
                  </Button>
                  <a href="#features" className="hidden sm:inline">
                    <Button variant="ghost" size="lg" type="button" className="border border-white/10">
                      Découvrir la plateforme
                    </Button>
                  </a>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" type="button">
                      Créer un compte gratuit
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary" size="lg" type="button">
                      J’ai déjà un compte
                    </Button>
                  </Link>
                  <a href="#features" className="hidden sm:inline">
                    <Button variant="ghost" size="lg" type="button" className="border border-white/10">
                      Découvrir la plateforme
                    </Button>
                  </a>
                </>
              )}
            </div>

            <p className="mt-8 max-w-xl text-xs leading-relaxed text-[#E6EDF3]/50">
              Aucun investissement réel : l’objectif est pédagogique. Les performances simulées ne
              garantissent rien sur les marchés réels.
            </p>
          </div>
        </div>
      </PublicPageContainer>
    </div>
  );
}
