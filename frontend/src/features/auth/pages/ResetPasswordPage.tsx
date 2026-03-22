import React from "react";
import { AuthCard } from "../components/AuthCard";
import { AuthLinks } from "../components/AuthLinks";
import { ResetPasswordForm } from "../components/ResetPasswordForm";

/** Page “Reset Password” (publique). */
export function ResetPasswordPage() {
  return (
    <div className="space-y-4">
      <AuthCard title="Réinitialiser" subtitle="Définis un nouveau mot de passe.">
        <ResetPasswordForm />
      </AuthCard>
      <AuthLinks mode="reset" />
    </div>
  );
}

