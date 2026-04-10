import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

/**
 * Garde d'accès : routes privées réservées aux utilisateurs connectés.
 * - Mode API : présence d'un JWT valide + profil chargé (ou erreur → déconnexion côté bootstrap).
 * - Mode mock : état synchronisé avec `auth.mock` via `AuthProvider`.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#111827] text-[#E6EDF3]/80 text-sm"
        aria-busy="true"
      >
        Chargement…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

