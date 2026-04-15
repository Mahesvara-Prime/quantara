import React from "react";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../components/feedback/ToastContext";
import { useAuth } from "../../auth/AuthContext";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import { getSettings, updateSettings } from "../services/settings.service";
import { requestPasswordChange } from "../../auth/services/auth.service";

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

  const [pwdCurrent, setPwdCurrent] = React.useState("");
  const [pwdNew, setPwdNew] = React.useState("");
  const [pwdConfirm, setPwdConfirm] = React.useState("");
  const [pwdSubmitting, setPwdSubmitting] = React.useState(false);
  const [pwdError, setPwdError] = React.useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = React.useState<string | null>(null);

  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { showToast } = useToast();
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
      showToast("Préférences enregistrées.", "success");
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

  async function handlePasswordChangeRequest(e: React.FormEvent) {
    e.preventDefault();
    if (apiMissing) return;
    setPwdError(null);
    setPwdSuccess(null);

    if (!pwdCurrent.trim()) {
      setPwdError("Saisis ton mot de passe actuel.");
      return;
    }
    if (!pwdNew || pwdNew.length < 8) {
      setPwdError("Le nouveau mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (pwdNew !== pwdConfirm) {
      setPwdError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setPwdSubmitting(true);
    try {
      const msg = await requestPasswordChange(pwdCurrent, pwdNew, pwdConfirm);
      setPwdSuccess(msg);
      showToast("E-mail de confirmation envoyé.", "success");
      setPwdCurrent("");
      setPwdNew("");
      setPwdConfirm("");
    } catch (err) {
      if (err instanceof ApiHttpError) setPwdError(err.message);
      else setPwdError("Impossible d’envoyer la demande.");
    } finally {
      setPwdSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Paramètres</h1>
        <p className="mt-1 text-sm text-[#E6EDF3]/60">Préférences du compte et session.</p>
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
        <h2 className="text-base font-semibold">Préférences</h2>
        <Divider className="my-4" />

        {loading && !apiMissing ? (
          <div className="inline-flex items-center gap-2 text-sm text-[#E6EDF3]/70">
            <Spinner /> Chargement…
          </div>
        ) : null}

        {!loading && !apiMissing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="settings-lang" className="text-sm text-[#E6EDF3]/70">
                Language
              </label>
              <select
                id="settings-lang"
                value={
                  ["fr", "en", "de", "es"].includes(language.trim().toLowerCase())
                    ? language.trim().toLowerCase()
                    : "custom"
                }
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "custom") setLanguage("");
                  else setLanguage(v);
                }}
                className={[
                  "w-full rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-sm text-[#E6EDF3]",
                  "focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/40",
                ].join(" ")}
                aria-label="Langue"
              >
                <option value="fr">Français (fr)</option>
                <option value="en">English (en)</option>
                <option value="de">Deutsch (de)</option>
                <option value="es">Español (es)</option>
                <option value="custom">Autre (saisie libre)</option>
              </select>
              {!["fr", "en", "de", "es"].includes(language.trim().toLowerCase()) ? (
                <Input
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  aria-label="Code langue personnalisé"
                  placeholder="ex. it, pt, ja"
                  className="mt-2"
                />
              ) : null}
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-[#111827]"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
              <span className="text-sm text-[#E6EDF3]/90">Notifications activées</span>
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
                "Enregistrer"
              )}
            </Button>
          </div>
        ) : null}
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold">Mot de passe</h2>
        <p className="mt-1 text-sm text-[#E6EDF3]/60">
          Après envoi, ouvre le lien reçu par e-mail pour confirmer le nouveau mot de passe (valide environ
          1 h).
        </p>
        <Divider className="my-4" />

        {apiMissing ? null : (
          <form className="space-y-4" onSubmit={handlePasswordChangeRequest}>
            {pwdError ? (
              <Alert variant="error" title="Erreur">
                {pwdError}
              </Alert>
            ) : null}
            {pwdSuccess ? (
              <Alert variant="success" title="Étape suivante">
                {pwdSuccess}
              </Alert>
            ) : null}

            <div className="space-y-2">
              <label htmlFor="settings-pwd-current" className="text-sm text-[#E6EDF3]/70">
                Mot de passe actuel
              </label>
              <Input
                id="settings-pwd-current"
                type="password"
                autoComplete="current-password"
                value={pwdCurrent}
                onChange={(e) => setPwdCurrent(e.target.value)}
                disabled={pwdSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="settings-pwd-new" className="text-sm text-[#E6EDF3]/70">
                Nouveau mot de passe
              </label>
              <Input
                id="settings-pwd-new"
                type="password"
                autoComplete="new-password"
                value={pwdNew}
                onChange={(e) => setPwdNew(e.target.value)}
                disabled={pwdSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="settings-pwd-confirm" className="text-sm text-[#E6EDF3]/70">
                Confirmer le nouveau mot de passe
              </label>
              <Input
                id="settings-pwd-confirm"
                type="password"
                autoComplete="new-password"
                value={pwdConfirm}
                onChange={(e) => setPwdConfirm(e.target.value)}
                disabled={pwdSubmitting}
              />
            </div>

            <Button size="md" variant="secondary" type="submit" disabled={pwdSubmitting}>
              {pwdSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner /> Envoi…
                </span>
              ) : (
                "Envoyer la confirmation par e-mail"
              )}
            </Button>
          </form>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold">Déconnexion</h2>
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
            Se déconnecter
          </Button>
        </div>
      </Card>
    </div>
  );
}
