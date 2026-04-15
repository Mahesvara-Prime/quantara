import React from "react";
import { Navigate } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { AuthLinks } from "../components/AuthLinks";
import { LoginForm } from "../components/LoginForm";
import { useAuth } from "../AuthContext";

/**
 * Page Login (publique).
 * Le centrage/structure est géré par `PublicAuthLayout`.
 * Si déjà connecté, redirection vers le dashboard.
 */
export function LoginPage() {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-sm text-[#E6EDF3]/70">
        Chargement…
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-4">
      <AuthCard
        title="Se connecter"
        subtitle="Accède à ton tableau de bord, aux marchés, à la simulation et aux cours."
      >
        <LoginForm />
      </AuthCard>
      <AuthLinks mode="login" />
    </div>
  );
}

