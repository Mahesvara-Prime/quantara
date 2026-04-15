import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

const STORAGE_KEY = "quantara_welcome_dismissed_v1";

/**
 * Bandeau d’accueil une fois (localStorage) — oriente vers les 3 piliers du produit.
 */
export function DashboardWelcomeCard() {
  const [visible, setVisible] = React.useState(() => {
    try {
      return typeof window !== "undefined" && !window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return true;
    }
  });

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <Card className="border-[#3B82F6]/25 bg-gradient-to-br from-[#1e3a5f]/25 to-[#111827]/80 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#F9FAFB]">Bienvenue sur Quantara</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#E6EDF3]/72">
            Voici par où commencer : parcours les cours, observe les marchés, puis entraîne-toi avec
            le portefeuille fictif. Tu peux refermer ce message quand tu veux.
          </p>
          <ul className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6">
            <li>
              <Link
                className="font-medium text-[#3B82F6] underline underline-offset-2 hover:text-[#60A5FA]"
                to="/learn"
              >
                Apprendre
              </Link>
              <span className="text-[#E6EDF3]/55"> — cours &amp; leçons</span>
            </li>
            <li>
              <Link
                className="font-medium text-[#3B82F6] underline underline-offset-2 hover:text-[#60A5FA]"
                to="/markets"
              >
                Marchés
              </Link>
              <span className="text-[#E6EDF3]/55"> — actifs &amp; graphiques</span>
            </li>
            <li>
              <Link
                className="font-medium text-[#3B82F6] underline underline-offset-2 hover:text-[#60A5FA]"
                to="/simulation"
              >
                Simulation
              </Link>
              <span className="text-[#E6EDF3]/55"> — ordres papier</span>
            </li>
          </ul>
        </div>
        <Button type="button" variant="secondary" size="md" className="shrink-0 sm:mt-0" onClick={dismiss}>
          Compris, masquer
        </Button>
      </div>
    </Card>
  );
}
