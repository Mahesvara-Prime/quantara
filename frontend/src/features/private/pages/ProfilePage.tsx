import React from "react";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Button } from "../../../components/ui/Button";
import { authMock } from "../../auth/auth.mock";

export function ProfilePage() {
  /*
    Rôle: page Profile privée.
    Objectif UX (guide): très léger -> avatar, nom, email + CTA [ Edit Profile ]
    Wireframe: profile-visuel.md
  */

  // Données mock: issues de la fake auth (name/email/avatar/role).
  const { user } = authMock;
  const avatarLetter = user.firstName.trim().slice(0, 1).toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
      </div>

      {/* Card: infos utilisateur */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          {/* Avatar placeholder (sans composant dédié existant) */}
          <div
            className={[
              "h-14 w-14 rounded-full",
              "bg-[#3B82F6]/20 border border-[#3B82F6]/30",
              "flex items-center justify-center",
            ].join(" ")}
            aria-label="Avatar"
          >
            <span className="text-sm font-semibold text-[#E6EDF3]">
              {avatarLetter}
            </span>
          </div>

          <div className="min-w-0">
            <div className="text-sm text-[#E6EDF3]/70">Name</div>
            <div className="mt-1 text-base font-semibold truncate">
              {user.firstName} {user.lastName}
            </div>

            <div className="mt-3 text-sm text-[#E6EDF3]/70">Email</div>
            <div className="mt-1 text-base font-semibold truncate">
              {user.email}
            </div>
          </div>
        </div>

        <Divider className="my-4" />

        {/* CTA: éditer le profil (mock, pas de backend) */}
        <Button size="md" variant="secondary" type="button">
          Edit Profile
        </Button>
      </Card>

      {/* Card: info de compte (wireframe) */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Account Info</h2>
        <Divider className="my-4" />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-[#E6EDF3]/70">Joined</div>
            <div className="text-sm font-semibold text-[#E6EDF3]">Jan 2026</div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-[#E6EDF3]/70">Plan</div>
            <div className="text-sm font-semibold text-[#E6EDF3]">Free</div>
          </div>
        </div>

        {/* TODO: brancher les vraies infos backend */}
      </Card>
    </div>
  );
}

