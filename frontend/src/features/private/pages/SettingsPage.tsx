import React from "react";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import { useNavigate } from "react-router-dom";
import { logoutMock } from "../../auth/auth.mock";

export function SettingsPage() {
  /*
    Rôle: page Settings privée.
    Objectif UX (guide): réglages organisés en sections sans surcharger.
    Guide: langue, password, logout.
  */

  // Données mock (pas de backend).
  const [language, setLanguage] = React.useState("Français");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const navigate = useNavigate();

  /** Logout mock: coupe l'accès aux routes privées puis renvoie sur /login. */
  function handleLogout() {
    logoutMock();
    navigate("/login", { replace: true });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      </div>

      {/* Language */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Language</h2>
        <Divider className="my-4" />

        {/* UI simple: input pour faciliter la modification mock */}
        <div className="space-y-2">
          <div className="text-sm text-[#E6EDF3]/70">Display language</div>
          <Input
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Language"
          />
        </div>
      </Card>

      {/* Password */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Password</h2>
        <Divider className="my-4" />

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-[#E6EDF3]/70">New password</div>
            <Input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              aria-label="New password"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm text-[#E6EDF3]/70">Confirm password</div>
            <Input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              aria-label="Confirm password"
            />
          </div>

          <Button
            size="md"
            variant="secondary"
            type="button"
            disabled={!newPassword || !confirmPassword}
          >
            Save Password
          </Button>
        </div>

        {/* TODO: validation + save backend */}
      </Card>

      {/* Logout */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Logout</h2>
        <Divider className="my-4" />

        <Alert variant="info" title="Mock">
          Logout mock (sans backend). Utilise ce bouton pour tester l'accès aux pages privées.
        </Alert>

        <div className="mt-4">
          <Button
            size="md"
            variant="secondary"
            type="button"
            className="w-full"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}

