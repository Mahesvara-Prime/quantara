import React from "react";
import { Navigate } from "react-router-dom";
import { authMock } from "../auth.mock";

/**
 * Garde d'accès "fake" (backend non prêt).
 *
 * Remplacement futur:
 * - lire la session backend (token/cookies/etc.)
 * - supprimer `authMock` et brancher une vraie source d'auth
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!authMock.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

