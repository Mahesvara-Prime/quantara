import React from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { FormField } from "../../../components/forms/FormField";
import { Spinner } from "../../../components/ui/Spinner";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import { requestPasswordReset } from "../services/auth.service";

/**
 * Mot de passe oublié — POST /auth/password-reset/request.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [errors, setErrors] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const apiMissing = !isApiConfigured();

  const validateForm = () => {
    const newErrors: string[] = [];
    if (!email.trim()) {
      newErrors.push("Email requis");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.push("Format email invalide");
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
      const msg = await requestPasswordReset(email);
      setSuccessMessage(msg);
      setEmail("");
    } catch (err) {
      if (err instanceof ApiHttpError) setErrors([err.message]);
      else setErrors(["Impossible d’envoyer la demande. Réessaie plus tard."]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {apiMissing ? (
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code> pour envoyer un lien
          de réinitialisation.
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

      {successMessage ? (
        <Alert variant="success" title="Demande enregistrée">
          {successMessage}
        </Alert>
      ) : null}

      {!successMessage && !apiMissing ? (
        <Alert variant="info" title="Sécurité">
          Pour protéger ton compte, le message affiché est le même que l’e-mail existe ou non. Vérifie
          ta boîte de réception et tes spams.
        </Alert>
      ) : null}

      <FormField
        id="forgot-email"
        label="Email"
        inputProps={{
          type: "email",
          placeholder: "you@company.com",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          autoComplete: "email",
          required: true,
          disabled: submitting || Boolean(successMessage) || apiMissing,
        }}
      />

      <Button className="w-full" type="submit" disabled={submitting || Boolean(successMessage) || apiMissing}>
        {submitting ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Spinner /> Envoi…
          </span>
        ) : (
          "Envoyer le lien"
        )}
      </Button>
    </form>
  );
}
