import React from "react";
import { NavLink } from "react-router-dom";
import { Divider } from "../ui/Divider";
import { Logo } from "./Logo";
import { useAuth } from "../../features/auth/AuthContext";

type NavItem = {
  to: string;
  label: string;
};

export const privateNavItems: NavItem[] = [
  { to: "/dashboard", label: "Tableau de bord" },
  { to: "/markets", label: "Marchés" },
  { to: "/simulation", label: "Simulation" },
  { to: "/portfolio", label: "Portefeuille" },
  { to: "/trade-history", label: "Historique" },
  { to: "/learn", label: "Apprendre" },
  { to: "/progress", label: "Progression" },
  { to: "/profile", label: "Profil" },
  { to: "/settings", label: "Paramètres" },
];

function sidebarLinkClass(isActive: boolean) {
  return [
    "block w-full rounded-lg px-3 py-2.5 text-left text-sm leading-snug transition-colors",
    "whitespace-normal break-words",
    isActive
      ? "bg-[#1F2937] text-[#E6EDF3] border border-white/10"
      : "text-[#E6EDF3]/80 hover:bg-white/5",
  ].join(" ");
}

function PrivateNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 pb-6 pt-2">
      {privateNavItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/dashboard"}
          onClick={onNavigate}
          className={({ isActive }) => sidebarLinkClass(isActive)}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

/**
 * Barre supérieure + tiroir navigation (&lt; md) — complète la sidebar desktop.
 */
export function PrivateMobileNav() {
  const [open, setOpen] = React.useState(false);
  const { user } = useAuth();
  const first = user?.firstName?.trim() ?? "";
  const last = user?.lastName?.trim() ?? "";

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header
        className={[
          "fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#111827] px-4",
          "md:hidden",
        ].join(" ")}
      >
        <Logo to="/" />
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-[#E6EDF3] hover:bg-white/5"
          aria-expanded={open}
          aria-controls="private-mobile-drawer"
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
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" id="private-mobile-drawer">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
          />
          <aside
            className={[
              "absolute left-0 top-0 flex h-full w-[min(18rem,100vw)] flex-col",
              "border-r border-white/10 bg-[#111827] shadow-xl",
            ].join(" ")}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
              <div className="min-w-0">
                <Logo to="/" onClick={() => setOpen(false)} />
                <p className="mt-2 text-xs leading-snug text-[#E6EDF3]/70 break-words">
                  {first || last ? `Bonjour ${first} ${last}`.trim() : "Menu"}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-lg leading-none text-[#E6EDF3]/90 hover:bg-white/5"
                aria-label="Fermer"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>
            <PrivateNavLinks onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
    </>
  );
}

/**
 * Sidebar gauche fixe pour l'interface privée (≥ md).
 */
export function PrivateSidebar() {
  const { user } = useAuth();
  const first = user?.firstName?.trim() ?? "";
  const last = user?.lastName?.trim() ?? "";

  return (
    <aside
      className={[
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-30",
        "w-72 min-w-72 shrink-0 border-r border-white/10 bg-[#111827]",
      ].join(" ")}
      aria-label="Navigation principale"
    >
      <div className="shrink-0 px-4 py-5">
        <Logo to="/" />
        <p className="mt-3 text-sm leading-snug text-[#E6EDF3]/80 break-words">
          Bon retour{first || last ? `, ${first} ${last}`.trim() : ""}
        </p>
      </div>

      <Divider className="mx-2 shrink-0" />

      <PrivateNavLinks />
    </aside>
  );
}
