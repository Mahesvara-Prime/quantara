import React from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Divider } from "../../../components/ui/Divider";
import { FormField } from "../../../components/forms/FormField";
import { AuthOAuthButtons } from "./AuthOAuthButtons";
import { authMock, setAuthenticated } from "../auth.mock";

/**
 * Formulaire Login avec validation.
 * - Email et Mot de passe requis.
 * - Validation locale avec messages d''erreur clairs.
 * - Prêt pour appel API auth.service.login().
 */
export function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<string[]>([]);
  const navigate = useNavigate();
  const alertTitle =
    errors.length === 1 && errors[0] === "Email ou mot de passe incorrect."
      ? "Identifiants incorrects"
      : "Erreurs à corriger";

  /**
   * Valide le formulaire avant soumission.
   * Retourne true si tous les champs sont valides, false sinon.
   */
  const validateForm = () => {
    const newErrors: string[] = [];
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      newErrors.push("Email requis");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.push("Format email invalide");
    }
    if (!trimmedPassword) {
      newErrors.push("Mot de passe requis");
    } else if (trimmedPassword.length < 8) {
      newErrors.push("Mot de passe minimum 8 caractères");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (validateForm()) {
      // Auth fake: comparaison locale email/password.
      const normalizedEmail = email.trim().toLowerCase();
      const expectedEmail = authMock.user.email.trim().toLowerCase();
      const normalizedPassword = password.trim();
      const expectedPassword = authMock.user.password.trim();

      if (
        normalizedEmail === expectedEmail &&
        normalizedPassword === expectedPassword
      ) {
        // Auth ok: accès aux routes privées puis redirection dashboard.
        setAuthenticated(true);
        navigate("/dashboard", { replace: true });
        return;
      }

      // Identifiants invalides: rester sur /login avec un message clair.
      setErrors(["Email ou mot de passe incorrect."]);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <Alert variant="error" title={alertTitle}>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, idx) => (
              <li key={idx} className="text-sm">
                {error}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      <FormField
        id="login-email"
        label="Email"
        inputProps={{
          type: "email",
          placeholder: "you@company.com",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          autoComplete: "email",
          required: true,
        }}
      />

      <FormField
        id="login-password"
        label="Mot de passe"
        inputProps={{
          type: "password",
          placeholder: "••••••••",
          value: password,
          onChange: (e) => setPassword(e.target.value),
          autoComplete: "current-password",
          required: true,
        }}
      />

      <Button className="w-full" type="submit">
        Se connecter
      </Button>

      <div className="relative py-2">
        <Divider />
        <div className="absolute inset-x-0 -top-2 flex justify-center">
          <span className="bg-[#1F2937] px-2 text-xs text-[#E6EDF3]/60">ou</span>
        </div>
      </div>

      <AuthOAuthButtons />
    </form>
  );
}