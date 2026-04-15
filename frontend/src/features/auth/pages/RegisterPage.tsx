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
        subtitle="Rejoins Quantara pour accéder aux marchés, à la simulation papier et aux parcours de formation."
      >
        <RegisterForm />
      </AuthCard>
      <AuthLinks mode="register" />
    </div>
  );
}

