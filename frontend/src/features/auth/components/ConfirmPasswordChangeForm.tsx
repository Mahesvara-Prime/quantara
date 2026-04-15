import React from "react";
import { Link } from "react-router-dom";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { FormField } from "../../../components/forms/FormField";
import { Spinner } from "../../../components/ui/Spinner";
import { ApiHttpError } from "../../../shared/api/httpClient";
import { confirmPasswordChange } from "../services/auth.service";

type Props = {
  token: string;
};

/**
 * Saisie du nouveau mot de passe après clic sur le lien reçu par e-mail.
 */
export function ConfirmPasswordChangeForm({ token }: Props) {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage(null);

    const next: string[] = [];
    if (!password) next.push("Nouveau mot de passe requis.");
    else if (password.length < 8) next.push("Le mot de passe doit faire au moins 8 caractères.");
    if (!confirmPassword) next.push("Confirmation requise.");
    else if (password !== confirmPassword) next.push("Les mots de passe ne correspondent pas.");
    if (next.length) {
      setErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      const msg = await confirmPasswordChange(token, password, confirmPassword);
      setSuccessMessage(msg);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof ApiHttpError) setErrors([err.message]);
      else setErrors(["Une erreur est survenue. Réessaie plus tard."]);
    } finally {
      setSubmitting(false);
    }
  }

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
      {errors.length > 0 ? (
        <Alert variant="error" title="Erreur">
          <ul className="list-inside list-disc space-y-1">
            {errors.map((x, i) => (
              <li key={i} className="text-sm">
                {x}
              </li>
            ))}
          </ul>
        </Alert>
      ) : null}

      <FormField
        id="confirm-pwd-new"
        label="Nouveau mot de passe"
        inputProps={{
          type: "password",
          placeholder: "••••••••",
          value: password,
          onChange: (e) => setPassword(e.target.value),
          autoComplete: "new-password",
          required: true,
          disabled: submitting,
        }}
      />

      <FormField
        id="confirm-pwd-repeat"
        label="Confirmer le mot de passe"
        inputProps={{
          type: "password",
          placeholder: "••••••••",
          value: confirmPassword,
          onChange: (e) => setConfirmPassword(e.target.value),
          autoComplete: "new-password",
          required: true,
          disabled: submitting,
        }}
      />

      <Button className="w-full" type="submit" disabled={submitting}>
        {submitting ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Spinner /> Validation…
          </span>
        ) : (
          "Confirmer le nouveau mot de passe"
        )}
      </Button>
    </form>
  );
}
