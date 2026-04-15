import { Link } from "react-router-dom";
import { PublicPageContainer } from "../../../components/common/PublicPageContainer";
import { Button } from "../../../components/ui/Button";
import { LandingFooter } from "../components/LandingFooter";
import { LandingHero } from "../components/LandingHero";
import { LandingNav } from "../components/LandingNav";
import { LandingSection } from "../components/LandingSection";

/**
 * Landing publique — contenu FR, aligné sur le périmètre réel du produit (MVP).
 */
export function LandingPage() {
  return (
    <div>
      <LandingNav />
      <LandingHero />

      <PublicPageContainer>
        <LandingSection
          id="features"
          title="Ce que tu peux faire aujourd’hui"
          subtitle="Des briques concrètes : pas de promesse floue, uniquement ce qui est disponible dans l’application."
          items={[
            {
              title: "Marchés & graphiques",
              description:
                "Liste d’actifs, variations 24h, mini-tendances lisibles et fiche détail avec graphique chandelier interactif (données fournies par l’API).",
            },
            {
              title: "Vue d’ensemble",
              description:
                "Tableau de bord avec aperçu de ton portfolio fictif, de ta progression sur les cours et des derniers mouvements sur ton compte simulé.",
            },
            {
              title: "Interface sobre",
              description:
                "Navigation latérale (ou menu mobile), thème sombre confortable et formulaires cohérents sur tout le parcours connecté.",
            },
          ]}
        />

        <LandingSection
          id="simulation"
          title="Trading simulé"
          subtitle="Tu t’entraînes avec un portefeuille papier : les ordres sont enregistrés côté serveur, sans argent réel."
          items={[
            {
              title: "Achats & ventes",
              description:
                "Passe des ordres buy (montant en USD) ou sell (quantité d’actif), avec prix issu du fournisseur de marché au moment de l’exécution.",
            },
            {
              title: "Positions & historique",
              description:
                "Consulte tes lignes ouvertes, ferme une position en vendant la quantité détenue, et retrouve chaque exécution dans l’historique des trades.",
            },
            {
              title: "Graphique sur la page Simulation",
              description:
                "Visualise les bougies du symbole que tu saisis avant d’envoyer un ordre — la même source que la fiche marché.",
            },
          ]}
        />

        <LandingSection
          id="learn"
          title="Formation"
          subtitle="Des parcours structurés pour monter en compétence à ton rythme, avec suivi de complétion."
          items={[
            {
              title: "Catalogue de cours",
              description:
                "Parcours les cours publiés, ouvre une leçon, marque-la comme terminée pour faire avancer ta progression.",
            },
            {
              title: "Progression visible",
              description:
                "Pourcentage par cours et synthèse globale sur la page Progress — pour savoir où tu en es d’un coup d’œil.",
            },
            {
              title: "Lien avec la pratique",
              description:
                "Combine lecture et simulation : les concepts du marché prennent sens quand tu observes les mêmes actifs en direct.",
            },
          ]}
        />

        <section className="scroll-mt-24 py-14 sm:py-16">
          <div
            className={[
              "relative overflow-hidden rounded-2xl border border-[#3B82F6]/20",
              "bg-gradient-to-br from-[#1e3a5f]/35 via-[#111827] to-[#111827]",
              "px-6 py-10 sm:px-10 sm:py-12",
            ].join(" ")}
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#3B82F6]/10 blur-3xl" />
            <div className="relative max-w-xl">
              <h2 className="text-xl font-semibold tracking-tight text-[#F9FAFB] sm:text-2xl">
                Prêt à explorer Quantara ?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#E6EDF3]/72">
                Crée un compte en quelques secondes, ou connecte-toi si tu as déjà commencé ton
                parcours.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button size="lg" type="button">
                    S’inscrire
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg" type="button">
                    Se connecter
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </PublicPageContainer>

      <LandingFooter />
    </div>
  );
}
