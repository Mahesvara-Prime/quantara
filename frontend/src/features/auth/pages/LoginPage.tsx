import React from "react";
import { AuthCard } from "../components/AuthCard";
import { AuthLinks } from "../components/AuthLinks";
import { LoginForm } from "../components/LoginForm";

/**
 * Page Login (publique).
 * Le centrage/structure est géré par `PublicAuthLayout`.
 */
export function LoginPage() {
  return (
    <div className="space-y-4">
      <AuthCard title="Se connecter" subtitle="Accède à ton espace Quantara.">
        <LoginForm />
      </AuthCard>
      <AuthLinks mode="login" />
    </div>
  );
}

