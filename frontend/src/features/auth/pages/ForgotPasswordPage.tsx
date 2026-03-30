import React from "react";
import { AuthCard } from "../components/AuthCard";
import { AuthLinks } from "../components/AuthLinks";
import { ForgotPasswordForm } from "../components/ForgotPasswordForm";

/** Page “Mot de passe oublié” (publique). */
export function ForgotPasswordPage() {
  return (
    <div className="space-y-4">
      <AuthCard
        title="Mot de passe oublié"
        subtitle="Reçois un lien de réinitialisation par email."
      >
        <ForgotPasswordForm />
      </AuthCard>
      <AuthLinks mode="forgot" />
    </div>
  );
}

