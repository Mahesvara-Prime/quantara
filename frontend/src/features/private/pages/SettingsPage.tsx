import React from "react";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import { getSettings, updateSettings } from "../services/settings.service";

/**
 * Préférences — GET/PATCH /settings (language, notifications).
 */
export function SettingsPage() {
  const [language, setLanguage] = React.useState("");
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saveMsg, setSaveMsg] = React.useState<string | null>(null);

  const navigate = useNavigate();
  const { signOut } = useAuth();
  const apiMissing = !isApiConfigured();

  React.useEffect(() => {
    if (apiMissing) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getSettings()
      .then((s) => {
        if (!cancelled) {
          setLanguage(s.language);
          setNotificationsEnabled(s.notifications_enabled);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiHttpError) setError(e.message);
        else setError("Impossible de charger les réglages.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiMissing]);

  async function handleSavePreferences() {
    if (apiMissing) return;
    setSaveMsg(null);
    setSaving(true);
    setError(null);
    try {
      await updateSettings({
        language: language.trim() || undefined,
        notifications_enabled: notificationsEnabled,
      });
      setSaveMsg("Préférences enregistrées.");
    } catch (e) {
      if (e instanceof ApiHttpError) setError(e.message);
      else setError("Échec de l’enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      </div>

      {apiMissing ? (
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code>.
        </Alert>
      ) : null}

      {error && !apiMissing ? (
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
      ) : null}

      {saveMsg && !error ? (
        <Alert variant="success" title="OK">
          {saveMsg}
        </Alert>
      ) : null}

      {/* Language + notifications */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Preferences</h2>
        <Divider className="my-4" />

        {loading && !apiMissing ? (
          <div className="inline-flex items-center gap-2 text-sm text-[#E6EDF3]/70">
            <Spinner /> Chargement…
          </div>
        ) : null}

        {!loading && !apiMissing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-[#E6EDF3]/70">Language</div>
              <Input
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Language"
                placeholder="e.g. fr, en"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-[#111827]"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
              <span className="text-sm text-[#E6EDF3]/90">Notifications enabled</span>
            </label>

            <Button
              size="md"
              variant="primary"
              type="button"
              disabled={saving}
              onClick={handleSavePreferences}
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner /> Enregistrement…
                </span>
              ) : (
                "Save preferences"
              )}
            </Button>
          </div>
        ) : null}
      </Card>

      {/* Password — hors API MVP */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Password</h2>
        <Divider className="my-4" />
        <p className="text-sm text-[#E6EDF3]/60">
          Changement de mot de passe : non exposé dans l’API MVP (utiliser le flux métier prévu plus
          tard).
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold">Logout</h2>
        <Divider className="my-4" />

        <Alert variant="info" title="Session">
          Tu seras déconnecté·e et renvoyé·e vers la page de connexion.
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
