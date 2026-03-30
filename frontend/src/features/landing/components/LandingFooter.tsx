import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "../../../components/common/Logo";
import { PublicPageContainer } from "../../../components/common/PublicPageContainer";
import { Divider } from "../../../components/ui/Divider";

/**
 * Footer structuré.
 * Contient uniquement de la navigation statique (UI), sans logique métier.
 */
export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#111827]">
      <PublicPageContainer>
        <div className="py-12">
          <div className="grid gap-8 md:grid-cols-5">
            <div className="md:col-span-2">
              <Logo />
              <p className="mt-3 max-w-sm text-sm text-[#E6EDF3]/70">
                Une interface claire et moderne pour analyser, simuler et apprendre.
              </p>
            </div>

            <FooterColumn
              title="Product"
              links={[
                { label: "Features", href: "#features" },
                { label: "Simulation", href: "#simulation" },
                { label: "Learn", href: "#learn" },
              ]}
            />
            <FooterColumn
              title="Company"
              links={[
                { label: "About", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Contact", href: "#" },
              ]}
            />
            <FooterColumn
              title="Legal"
              links={[
                { label: "Privacy", href: "#" },
                { label: "Terms", href: "#" },
                { label: "Cookies", href: "#" },
              ]}
            />
          </div>

          <Divider className="my-8" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-[#E6EDF3]/55">
            <div>© {new Date().getFullYear()} Quantara. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="hover:text-[#E6EDF3]/80">
                Login
              </Link>
              <Link to="/register" className="hover:text-[#E6EDF3]/80">
                Sign Up
              </Link>
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
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <div className="text-sm font-medium">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-[#E6EDF3]/70">
        {links.map((l) => (
          <li key={l.label}>
            <a className="hover:text-[#E6EDF3]" href={l.href}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

