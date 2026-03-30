import React from "react";
import { Link } from "react-router-dom";
import { PublicPageContainer } from "../../../components/common/PublicPageContainer";
import { Button } from "../../../components/ui/Button";
import bgLanding from "../../../assets/img/bg_landing.webp";

/**
 * Hero principal.
 * Utilise `bg_landing.webp` comme décor subtil (vignettage + gradient) pour rester minimal.
 */
export function LandingHero() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${bgLanding})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#111827]/40 via-[#111827]/75 to-[#111827]" />

      <PublicPageContainer>
        <div className="relative py-16 sm:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#E6EDF3]/85">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
              Fintech UI • Public interface
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Analyse, simulation et apprentissage des marchés — en un seul endroit.
            </h1>

            <p className="mt-4 text-base leading-relaxed text-[#E6EDF3]/80">
              Une expérience claire et moderne pour explorer des fonctionnalités, simuler des scénarios et apprendre
              progressivement, sans complexité inutile.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register">
                <Button size="lg">Créer un compte</Button>
              </Link>
              <a href="#features">
                <Button variant="secondary" size="lg">
                  Voir les features
                </Button>
              </a>
            </div>
          </div>
        </div>
      </PublicPageContainer>
    </div>
  );
}

