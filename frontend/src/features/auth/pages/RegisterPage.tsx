import React from "react";
import { AuthCard } from "../components/AuthCard";
import { AuthLinks } from "../components/AuthLinks";
import { RegisterForm } from "../components/RegisterForm";

/** Page Register (publique). */
export function RegisterPage() {
  return (
    <div className="space-y-4">
      <AuthCard
        title="Créer un compte"
        subtitle="Commence avec une interface claire et minimaliste."
      >
        <RegisterForm />
      </AuthCard>
      <AuthLinks mode="register" />
    </div>
  );
}

