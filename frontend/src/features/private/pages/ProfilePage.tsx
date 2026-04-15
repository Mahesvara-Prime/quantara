import React from "react";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { ErrorRetryBanner } from "../../../components/ui/ErrorRetryBanner";
import { useToast } from "../../../components/feedback/ToastContext";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { ProfileDto } from "../../../shared/api/types/backend";
import { useAuth } from "../../auth/AuthContext";
import { getProfile, updateProfile } from "../services/profile.service";

/**
 * Profil — GET/PATCH /profile (source de vérité : id, noms, email, statut actif).
 */
export function ProfilePage() {
  const [profile, setProfile] = React.useState<ProfileDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryNonce, setRetryNonce] = React.useState(0);

  const [editing, setEditing] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  }>({});

  const { refreshUser } = useAuth();
  const { showToast } = useToast();
  const apiMissing = !isApiConfigured();

  React.useEffect(() => {
    if (apiMissing) {
      setLoading(false);
      setProfile(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getProfile()
      .then((p) => {
        if (!cancelled) setProfile(p);
      })
      .catch((e) => {
        if (cancelled) return;
        setProfile(null);
        if (e instanceof ApiHttpError) setError(e.message);
        else setError("Impossible de charger le profil.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiMissing, retryNonce]);

  React.useEffect(() => {
    if (!profile) return;
    setFirstName(profile.first_name);
    setLastName(profile.last_name);
    setEmail(profile.email);
  }, [profile]);

  function startEdit() {
    if (!profile) return;
    setFieldErrors({});
    setFirstName(profile.first_name);
    setLastName(profile.last_name);
    setEmail(profile.email);
    setEditing(true);
  }

  function cancelEdit() {
    if (!profile) return;
    setFieldErrors({});
    setFirstName(profile.first_name);
    setLastName(profile.last_name);
    setEmail(profile.email);
    setEditing(false);
  }

  async function handleSave() {
    if (!profile || apiMissing) return;
    setFieldErrors({});
    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim().toLowerCase();
    const next: { firstName?: string; lastName?: string; email?: string } = {};
    if (!fn) next.firstName = "Le prénom est requis.";
    if (!ln) next.lastName = "Le nom est requis.";
    if (!em) next.email = "L’email est requis.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) next.email = "Format d’email invalide.";
    if (Object.keys(next).length) {
      setFieldErrors(next);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await updateProfile({
        first_name: fn,
        last_name: ln,
        email: em,
      });
      setProfile(updated);
      setEditing(false);
      await refreshUser();
      showToast("Profil mis à jour.", "success");
    } catch (e) {
      if (e instanceof ApiHttpError) setError(e.message);
      else setError("Échec de l’enregistrement du profil.");
    } finally {
      setSaving(false);
    }
  }

  const avatarLetter =
    profile?.first_name?.trim().slice(0, 1).toUpperCase() ?? "?";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Profil</h1>
      </div>

      {apiMissing ? (
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code>.
        </Alert>
      ) : null}

      {error && !apiMissing ? (
        <ErrorRetryBanner
          message={error}
          disabled={loading || saving}
          onRetry={() => setRetryNonce((n) => n + 1)}
        />
      ) : null}

      {loading && !apiMissing ? (
        <div className="inline-flex items-center gap-2 text-sm text-[#E6EDF3]/70">
          <Spinner /> Chargement…
        </div>
      ) : null}

      {profile && !loading ? (
        <>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={[
                  "h-14 w-14 shrink-0 rounded-full",
                  "bg-[#3B82F6]/20 border border-[#3B82F6]/30",
                  "flex items-center justify-center",
                ].join(" ")}
                aria-label="Avatar"
              >
                <span className="text-sm font-semibold text-[#E6EDF3]">{avatarLetter}</span>
              </div>

              <div className="min-w-0 flex-1">
                {!editing ? (
                  <>
                    <div className="text-sm text-[#E6EDF3]/70">Nom</div>
                    <div className="mt-1 text-base font-semibold truncate">
                      {profile.first_name} {profile.last_name}
                    </div>

                    <div className="mt-3 text-sm text-[#E6EDF3]/70">Email</div>
                    <div className="mt-1 text-base font-semibold truncate">{profile.email}</div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="profile-first-name" className="text-xs text-[#E6EDF3]/60">
                        Prénom
                      </label>
                      <Input
                        id="profile-first-name"
                        className="mt-1"
                        autoComplete="given-name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        error={fieldErrors.firstName}
                        disabled={saving}
                      />
                      {fieldErrors.firstName ? (
                        <p className="mt-1 text-xs text-red-400/90">{fieldErrors.firstName}</p>
                      ) : null}
                    </div>
                    <div>
                      <label htmlFor="profile-last-name" className="text-xs text-[#E6EDF3]/60">
                        Nom
                      </label>
                      <Input
                        id="profile-last-name"
                        className="mt-1"
                        autoComplete="family-name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        error={fieldErrors.lastName}
                        disabled={saving}
                      />
                      {fieldErrors.lastName ? (
                        <p className="mt-1 text-xs text-red-400/90">{fieldErrors.lastName}</p>
                      ) : null}
                    </div>
                    <div>
                      <label htmlFor="profile-email" className="text-xs text-[#E6EDF3]/60">
                        Email
                      </label>
                      <Input
                        id="profile-email"
                        className="mt-1"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={fieldErrors.email}
                        disabled={saving}
                      />
                      {fieldErrors.email ? (
                        <p className="mt-1 text-xs text-red-400/90">{fieldErrors.email}</p>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Divider className="my-4" />

            {!editing ? (
              <Button size="md" variant="secondary" type="button" onClick={startEdit}>
                Modifier le profil
              </Button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button size="md" variant="primary" type="button" disabled={saving} onClick={handleSave}>
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner /> Enregistrement…
                    </span>
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  type="button"
                  disabled={saving}
                  onClick={cancelEdit}
                >
                  Annuler
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold">Compte</h2>
            <Divider className="my-4" />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">Identifiant</div>
                <div className="text-sm font-semibold text-[#E6EDF3]">{profile.id}</div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">Statut</div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: profile.is_active ? "#22C55E" : "#EF4444" }}
                >
                  {profile.is_active ? "Actif" : "Inactif"}
                </div>
              </div>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
