import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "../../../components/common/Logo";
import { PublicPageContainer } from "../../../components/common/PublicPageContainer";
import { Button } from "../../../components/ui/Button";

/**
 * Navbar de la landing.
 * - Liens vers sections (ancres) pour garder une page publique simple et rapide.
 * - CTA vers Login / Sign Up.
 * - Toggle FR/EN (UI uniquement, sans i18n branchée pour l’instant).
 */
export function LandingNav() {
  const [lang, setLang] = React.useState<"FR" | "EN">("FR");

  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-[#111827]/80 backdrop-blur">
      <PublicPageContainer>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-[#E6EDF3]/85">
            <a className="hover:text-[#E6EDF3]" href="#features">
              Features
            </a>
            <a className="hover:text-[#E6EDF3]" href="#simulation">
              Simulation
            </a>
            <a className="hover:text-[#E6EDF3]" href="#learn">
              Learn
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden sm:inline-flex h-10 items-center rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-[#E6EDF3]/90 hover:bg-white/10"
              onClick={() => setLang((v) => (v === "FR" ? "EN" : "FR"))}
              aria-label="Toggle language"
            >
              {lang}
            </button>

            <Link to="/login">
              <Button variant="ghost" size="md">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="md">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </PublicPageContainer>
    </div>
  );
}

