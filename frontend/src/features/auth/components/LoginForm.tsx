import React from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Divider } from "../../../components/ui/Divider";
import { FormField } from "../../../components/forms/FormField";
import { AuthOAuthButtons } from "./AuthOAuthButtons";
import { ApiHttpError } from "../../../shared/api/httpClient";
import { useAuth } from "../AuthContext";
import { AuthInvalidCredentialsError } from "../services/auth.service";

/**
 * Formulaire Login avec validation.
 * - Email et Mot de passe requis.
 * - Validation locale avec messages d'erreur clairs.
 * - Connexion réelle via `AuthProvider.signIn` (backend si `VITE_API_BASE_URL`, sinon mock).
 */
export function LoginForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof AuthInvalidCredentialsError) {
        setErrors(["Email ou mot de passe incorrect."]);
        return;
      }
      if (err instanceof ApiHttpError) {
        setErrors([err.message || "Impossible de contacter le serveur."]);
        return;
      }
      if (err instanceof Error && err.message) {
        setErrors([err.message]);
        return;
      }
      setErrors(["Une erreur inattendue est survenue. Réessaie plus tard."]);
    } finally {
      setSubmitting(false);
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

      <Button className="w-full" type="submit" disabled={submitting}>
        {submitting ? "Connexion…" : "Se connecter"}
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