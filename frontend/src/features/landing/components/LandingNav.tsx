import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "../../../components/common/Logo";
import { PublicPageContainer } from "../../../components/common/PublicPageContainer";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../auth/AuthContext";

const anchorClass = "rounded-lg px-2 py-1.5 text-sm text-[#E6EDF3]/85 transition-colors hover:bg-white/5 hover:text-[#E6EDF3]";

/**
 * Navbar landing — FR, ancres sections, menu mobile (tiroir).
 * Connecté : prénom / nom + déconnexion (et accès tableau de bord).
 */
export function LandingNav() {
  const [open, setOpen] = React.useState(false);
  const { user, ready, signOut } = useAuth();

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const displayName = [user?.firstName?.trim(), user?.lastName?.trim()].filter(Boolean).join(" ");
  const isLoggedIn = Boolean(ready && user);

  const navLinks = (
    <>
      <a className={anchorClass} href="#features" onClick={() => setOpen(false)}>
        Fonctionnalités
      </a>
      <a className={anchorClass} href="#simulation" onClick={() => setOpen(false)}>
        Simulation
      </a>
      <a className={anchorClass} href="#learn" onClick={() => setOpen(false)}>
        Formation
      </a>
    </>
  );

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#111827]/85 backdrop-blur-md">
        <PublicPageContainer>
          <div className="flex h-16 items-center justify-between gap-3">
            <Link
              to="/"
              className="shrink-0 rounded-lg outline-none ring-offset-2 ring-offset-[#111827] focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50"
            >
              <Logo />
            </Link>

            <nav className="hidden items-center gap-1 md:flex">{navLinks}</nav>

            <div className="flex min-w-0 items-center gap-2">
              {isLoggedIn ? (
                <>
                  <span
                    className="hidden max-w-[11rem] truncate text-sm font-medium text-[#E6EDF3]/90 sm:block md:max-w-[16rem]"
                    title={displayName || undefined}
                  >
                    {displayName || "Compte"}
                  </span>
                  <Link to="/dashboard" className="hidden sm:block">
                    <Button variant="ghost" size="md" type="button">
                      Tableau de bord
                    </Button>
                  </Link>
                  <Button variant="secondary" size="md" type="button" onClick={() => signOut()}>
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:block">
                    <Button variant="ghost" size="md" type="button">
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="md" type="button">
                      Inscription
                    </Button>
                  </Link>
                </>
              )}

              <button
                type="button"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-[#E6EDF3] hover:bg-white/5 md:hidden"
                aria-expanded={open}
                aria-label="Ouvrir le menu"
                onClick={() => setOpen(true)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </PublicPageContainer>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/65"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[min(20rem,92vw)] flex-col border-l border-white/10 bg-[#111827] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <span className="text-sm font-semibold text-[#E6EDF3]">Menu</span>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-lg text-[#E6EDF3]/90 hover:bg-white/5"
                aria-label="Fermer"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-3">{navLinks}</nav>
            <div className="mt-auto space-y-2 border-t border-white/10 p-4">
              {isLoggedIn ? (
                <>
                  {displayName ? (
                    <p className="px-1 text-xs leading-snug text-[#E6EDF3]/70 break-words">{displayName}</p>
                  ) : null}
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="block">
                    <Button variant="primary" size="md" className="w-full" type="button">
                      Tableau de bord
                    </Button>
                  </Link>
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    type="button"
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="block">
                    <Button variant="secondary" size="md" className="w-full" type="button">
                      Connexion
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="block">
                    <Button variant="primary" size="md" className="w-full" type="button">
                      Inscription
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
