import React from "react";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { ProfileDto } from "../../../shared/api/types/backend";
import { getProfile } from "../services/profile.service";

/**
 * Profil — GET /profile (source de vérité : id, noms, email, statut actif).
 */
export function ProfilePage() {
  const [profile, setProfile] = React.useState<ProfileDto | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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
  }, [apiMissing]);

  const avatarLetter =
    profile?.first_name?.trim().slice(0, 1).toUpperCase() ?? "?";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
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
                  "h-14 w-14 rounded-full",
                  "bg-[#3B82F6]/20 border border-[#3B82F6]/30",
                  "flex items-center justify-center",
                ].join(" ")}
                aria-label="Avatar"
              >
                <span className="text-sm font-semibold text-[#E6EDF3]">{avatarLetter}</span>
              </div>

              <div className="min-w-0">
                <div className="text-sm text-[#E6EDF3]/70">Name</div>
                <div className="mt-1 text-base font-semibold truncate">
                  {profile.first_name} {profile.last_name}
                </div>

                <div className="mt-3 text-sm text-[#E6EDF3]/70">Email</div>
                <div className="mt-1 text-base font-semibold truncate">{profile.email}</div>
              </div>
            </div>

            <Divider className="my-4" />

            <Button size="md" variant="secondary" type="button" disabled>
              Edit Profile
            </Button>
            <p className="mt-2 text-xs text-[#E6EDF3]/50">Édition du profil : hors périmètre MVP.</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold">Account</h2>
            <Divider className="my-4" />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">User ID</div>
                <div className="text-sm font-semibold text-[#E6EDF3]">{profile.id}</div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-[#E6EDF3]/70">Status</div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: profile.is_active ? "#22C55E" : "#EF4444" }}
                >
                  {profile.is_active ? "Active" : "Inactive"}
                </div>
              </div>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
