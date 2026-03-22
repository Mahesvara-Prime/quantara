import React from "react";
import { PublicPageContainer } from "../../../components/common/PublicPageContainer";
import { LandingFooter } from "../components/LandingFooter";
import { LandingHero } from "../components/LandingHero";
import { LandingNav } from "../components/LandingNav";
import { LandingSection } from "../components/LandingSection";

/**
 * Page Landing (interface publique).
 * Assemble: navbar → hero → sections → footer.
 */
export function LandingPage() {
  return (
    <div>
      <LandingNav />
      <LandingHero />

      <PublicPageContainer>
        <LandingSection
          id="features"
          title="Features"
          subtitle="Une interface minimaliste, lisible, conçue pour aller à l’essentiel."
          items={[
            {
              title: "Analyse détaillée",
              description:
                "Outils d'analyse avancés pour décrypter les mouvements de marché.",
            },
            {
              title: "Données temps réel",
              description:
                "Cotations actualisées et intentions de marché pour décisions informées.",
            },
            {
              title: "Interface intuitive",
              description:
                "Naviguer facilement entre graphiques, données et stratégies sans friction.",
            },
          ]}
        />

        <LandingSection
          id="simulation"
          title="Simulation"
          subtitle="Simuler avant d’agir : une expérience guidée, claire et structurée."
          items={[
            {
              title: "Backtesting",
              description:
                "Tester vos stratégies sur l'historique sans risque réel.",
            },
            {
              title: "Résultats instantanés",
              description:
                "Voir l'impact de vos positions et décisions en temps réel.",
            },
            {
              title: "Itération rapide",
              description:
                "Affiner votre stratégie jusqu'à la perfection avant de trader.",
            },
          ]}
        />

        <LandingSection
          id="learn"
          title="Learn"
          subtitle="Apprendre progressivement avec une interface simple, moderne et cohérente."
          items={[
            {
              title: "Cours progressifs",
              description:
                "Du débutant aux concepts avancés, progressez à votre rythme.",
            },
            {
              title: "Concepts appliqués",
              description:
                "Apprendre avec des exemples concrets du marché financier.",
            },
            {
              title: "Pratique guidée",
              description:
                "Exercices et challenges pour maîtriser les compétences de trading.",
            },
          ]}
        />
      </PublicPageContainer>

      <LandingFooter />
    </div>
  );
}
