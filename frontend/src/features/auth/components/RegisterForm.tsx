import React from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Divider } from "../../../components/ui/Divider";
import { Spinner } from "../../../components/ui/Spinner";
import { FormField } from "../../../components/forms/FormField";
import { AuthOAuthButtons } from "./AuthOAuthButtons";
import { useAuth } from "../AuthContext";
import { AuthEmailAlreadyUsedError } from "../services/auth.service";
import { isApiConfigured } from "../../../shared/api";

/**
 * Formulaire Register avec validation locale + POST /auth/register lorsque l’API est configurée.
 */
export function RegisterForm() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState<string[]>([]);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  /**
   * Valide le formulaire avant soumission.
   * Retourne true si tous les champs sont valides, false sinon.
   */
  const validateForm = () => {
    const newErrors: string[] = [];

    if (!firstName.trim()) {
      newErrors.push("Prénom requis");
    }
    if (!lastName.trim()) {
      newErrors.push("Nom requis");
    }
    if (!email.trim()) {
      newErrors.push("Email requis");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.push("Format email invalide");
    }
    if (!password) {
      newErrors.push("Mot de passe requis");
    } else if (password.length < 8) {
      newErrors.push("Mot de passe minimum 8 caractères");
    }
    if (!confirmPassword) {
      newErrors.push("Confirmation mot de passe requise");
    } else if (password !== confirmPassword) {
      newErrors.push("Les mots de passe ne correspondent pas");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setApiError(null);

    if (!validateForm()) return;

    if (!isApiConfigured()) {
      setApiError(
        "Pour créer un compte, configure VITE_API_BASE_URL et lance le backend, ou utilise un compte seed (voir docs/architecture/identity.md).",
      );
      return;
    }

    setSubmitting(true);
    try {
      await signUp(firstName.trim(), lastName.trim(), email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof AuthEmailAlreadyUsedError) {
        setApiError(err.message);
      } else if (err instanceof Error) {
        setApiError(err.message);
      } else {
        setApiError("Inscription impossible. Réessaie dans un instant.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <Alert variant="error" title="Erreurs à corriger">
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, idx) => (
              <li key={idx} className="text-sm">
                {error}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {apiError ? (
        <Alert variant="error" title="Inscription">
          {apiError}
        </Alert>
      ) : null}

      <FormField
        id="register-firstname"
        label="Prénom"
        inputProps={{
          type: "text",
          placeholder: "Jean",
          value: firstName,
          onChange: (e) => setFirstName(e.target.value),
          required: true,
        }}
      />

      <FormField
        id="register-lastname"
        label="Nom"
        inputProps={{
          type: "text",
          placeholder: "Dupont",
          value: lastName,
          onChange: (e) => setLastName(e.target.value),
          required: true,
        }}
      />

      <FormField
        id="register-email"
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
        id="register-password"
        label="Mot de passe"
        inputProps={{
          type: "password",
          placeholder: "Minimum 8 caractères",
          value: password,
          onChange: (e) => setPassword(e.target.value),
          autoComplete: "new-password",
          required: true,
        }}
      />

      <FormField
        id="register-confirmPassword"
        label="Confirmer mot de passe"
        inputProps={{
          type: "password",
          placeholder: "Confirmez votre mot de passe",
          value: confirmPassword,
          onChange: (e) => setConfirmPassword(e.target.value),
          required: true,
        }}
      />

      <Button className="w-full" type="submit" disabled={submitting}>
        {submitting ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Spinner /> Création du compte…
          </span>
        ) : (
          "Créer un compte"
        )}
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