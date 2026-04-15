import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "../../../components/common/Logo";
import { PublicPageContainer } from "../../../components/common/PublicPageContainer";
import { Divider } from "../../../components/ui/Divider";

/**
 * Pied de page — navigation utile, ton honnête MVP.
 */
export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0f1419]">
      <PublicPageContainer>
        <div className="py-14">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <Link to="/" className="inline-block rounded-lg outline-none ring-offset-2 ring-offset-[#0f1419] focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50">
                <Logo />
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#E6EDF3]/65">
                Une plateforme pour explorer les marchés, s’exercer au trading fictif et suivre des
                contenus pédagogiques — dans une interface pensée pour la clarté.
              </p>
            </div>

            <FooterColumn
              title="Produit"
              links={[
                { label: "Fonctionnalités", href: "#features" },
                { label: "Simulation", href: "#simulation" },
                { label: "Formation", href: "#learn" },
              ]}
            />
            <FooterColumn
              title="Compte"
              links={[
                { label: "Connexion", href: "/login", router: true },
                { label: "Inscription", href: "/register", router: true },
              ]}
            />
            <FooterColumn
              title="Informations"
              links={[
                {
                  label: "Plateforme en évolution",
                  href: "#",
                  muted: true,
                },
                {
                  label: "Données & confidentialité (bientôt)",
                  href: "#",
                  muted: true,
                },
              ]}
            />
          </div>

          <Divider className="my-10 border-white/[0.07]" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-[#E6EDF3]/50">
              © {new Date().getFullYear()} Quantara — produit en construction, usage éducatif.
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[#E6EDF3]/60">
              <Link to="/login" className="transition-colors hover:text-[#E6EDF3]">
                Connexion
              </Link>
              <Link to="/register" className="transition-colors hover:text-[#E6EDF3]">
                Inscription
              </Link>
              <a href="#features" className="transition-colors hover:text-[#E6EDF3]">
                Haut de page
              </a>
            </div>
          </div>
        </div>
      </PublicPageContainer>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string; router?: boolean; muted?: boolean }>;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-[#E6EDF3]/45">{title}</div>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            {l.router ? (
              <Link
                to={l.href}
                className="text-[#E6EDF3]/70 transition-colors hover:text-[#E6EDF3]"
              >
                {l.label}
              </Link>
            ) : (
              <a
                href={l.href}
                className={
                  l.muted
                    ? "cursor-default text-[#E6EDF3]/45"
                    : "text-[#E6EDF3]/70 transition-colors hover:text-[#E6EDF3]"
                }
                onClick={l.muted ? (e) => e.preventDefault() : undefined}
              >
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
