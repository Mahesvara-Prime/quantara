import React from "react";
import { NavLink } from "react-router-dom";
import { Divider } from "../ui/Divider";
import { Logo } from "./Logo";
import { authMock } from "../../features/auth/auth.mock";

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
    "px-4 py-2 rounded-lg text-sm transition-colors",
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
  return (
    <aside
      className={[
        "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64",
        "bg-[#111827] border-r border-white/10",
      ].join(" ")}
    >
      <div className="px-4 py-5">
        <Logo />
        <p className="mt-3 text-sm text-[#E6EDF3]/80">
          Welcome back, {authMock.user.firstName} {authMock.user.lastName}
        </p>
      </div>

      <Divider className="my-4" />

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => sidebarLinkClass(isActive)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

