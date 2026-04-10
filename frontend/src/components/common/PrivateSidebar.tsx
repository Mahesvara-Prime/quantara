import React from "react";
import { NavLink } from "react-router-dom";
import { Divider } from "../ui/Divider";
import { Logo } from "./Logo";
import { useAuth } from "../../features/auth/AuthContext";

type NavItem = {
  to: string;
  label: string;
};

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/markets", label: "Markets" },
  { to: "/simulation", label: "Simulation" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/trade-history", label: "Trade History" },
  { to: "/learn", label: "Learn" },
  { to: "/progress", label: "Progress" },
  { to: "/profile", label: "Profile" },
  { to: "/settings", label: "Settings" },
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

/**
 * Sidebar gauche fixe pour l'interface privée.
 * - Ne contient pas les pages de détail (ex: /markets/:asset).
 * - Met en évidence l'élément actif via `NavLink`.
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
        <Logo />
        <p className="mt-3 text-sm leading-snug text-[#E6EDF3]/80 break-words">
          Welcome back, {first} {last}
        </p>
      </div>

      <Divider className="mx-2 shrink-0" />

      {/* Une colonne verticale : chaque lien est block full-width (évite le flux inline qui cassait) */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 pb-6 pt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) => sidebarLinkClass(isActive)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

