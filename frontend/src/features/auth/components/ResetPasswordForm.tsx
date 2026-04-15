import React from "react";
import { Link } from "react-router-dom";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { FormField } from "../../../components/forms/FormField";
import { Spinner } from "../../../components/ui/Spinner";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import { confirmPasswordReset } from "../services/auth.service";

type Props = {
  token: string;
};

/**
 * Nouveau mot de passe après lien « mot de passe oublié » — POST /auth/password-reset/confirm.
 */
export function ResetPasswordForm({ token }: Props) {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const apiMissing = !isApiConfigured();

  const validateForm = () => {
    const newErrors: string[] = [];
    if (!password) {
      newErrors.push("Nouveau mot de passe requis");
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
    setSuccessMessage(null);
    if (apiMissing) return;
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const msg = await confirmPasswordReset(token, password, confirmPassword);
      setSuccessMessage(msg);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof ApiHttpError) setErrors([err.message]);
      else setErrors(["Impossible de mettre à jour le mot de passe."]);
    } finally {
      setSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <div className="space-y-4">
        <Alert variant="success" title="Mot de passe mis à jour">
          {successMessage}
        </Alert>
        <Link
          to="/login"
          className="block text-center text-sm font-medium text-[#3B82F6] hover:underline"
        >
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {apiMissing ? (
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code>.
        </Alert>
      ) : null}

      {errors.length > 0 ? (
        <Alert variant="error" title="Erreurs à corriger">
          <ul className="list-inside list-disc space-y-1">
            {errors.map((error, idx) => (
              <li key={idx} className="text-sm">
                {error}
              </li>
            ))}
          </ul>
        </Alert>
      ) : null}

      <FormField
        id="reset-password"
        label="Nouveau mot de passe"
        inputProps={{
          type: "password",
          placeholder: "••••••••",
          value: password,
          onChange: (e) => setPassword(e.target.value),
          autoComplete: "new-password",
          required: true,
          disabled: submitting || apiMissing,
        }}
      />

      <FormField
        id="reset-confirmPassword"
        label="Confirmer mot de passe"
        inputProps={{
          type: "password",
          placeholder: "••••••••",
          value: confirmPassword,
          onChange: (e) => setConfirmPassword(e.target.value),
          autoComplete: "new-password",
          required: true,
          disabled: submitting || apiMissing,
        }}
      />

      <Button className="w-full" type="submit" disabled={submitting || apiMissing}>
        {submitting ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Spinner /> Mise à jour…
          </span>
        ) : (
          "Mettre à jour"
        )}
      </Button>
    </form>
  );
}
