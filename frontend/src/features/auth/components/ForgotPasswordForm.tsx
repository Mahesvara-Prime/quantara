import React from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { FormField } from "../../../components/forms/FormField";

/**
 * Formulaire "mot de passe oublié" avec validation.
 * - Email requis et validé.
 * - Message d''erreur clair si vide ou format invalide.
 * - Prêt pour appel API auth.service.forgotPassword().
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [errors, setErrors] = React.useState<string[]>([]);
  const [submitted, setSubmitted] = React.useState(false);

  /**
   * Valide le formulaire avant soumission.
   * Retourne true si l''email est valide, false sinon.
   */
  const validateForm = () => {
    const newErrors: string[] = [];

    if (!email.trim()) {
      newErrors.push("Email requis");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.push("Format email invalide");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (validateForm()) {
      setSubmitted(true);
      // TODO: Appeler auth.service.forgotPassword(email) ici
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

      {submitted && errors.length === 0 && (
        <Alert variant="success" title="Email envoyé (UI)">
          Si un compte existe, tu recevras un lien de réinitialisation.
        </Alert>
      )}

      {!submitted && errors.length === 0 && (
        <Alert variant="info">
          Renseigne ton email pour recevoir un lien de réinitialisation (UI uniquement).
        </Alert>
      )}

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
        }}
      />

      <Button className="w-full" type="submit">
        Envoyer le lien
      </Button>
    </form>
  );
}