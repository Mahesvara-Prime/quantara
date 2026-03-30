import React from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { FormField } from "../../../components/forms/FormField";

/**
 * Formulaire "reset password" avec validation complète.
 * - Nouveau mot de passe (minimum 8 caractères).
 * - Confirmation mot de passe (doit correspondre).
 * - Messages d''erreur clairs.
 * - Prêt pour appel API auth.service.resetPassword().
 */
export function ResetPasswordForm() {
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState<string[]>([]);
  const [submitted, setSubmitted] = React.useState(false);

  /**
   * Valide le formulaire avant soumission.
   * Retourne true si tous les champs sont valides, false sinon.
   */
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (validateForm()) {
      setSubmitted(true);
      // TODO: Appeler auth.service.resetPassword(password) ici
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
        <Alert variant="success" title="Mot de passe mis à jour (UI)">
          Tu peux maintenant te connecter avec ton nouveau mot de passe.
        </Alert>
      )}

      {!submitted && errors.length === 0 && (
        <Alert variant="info">Choisis un nouveau mot de passe (UI uniquement).</Alert>
      )}

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
        }}
      />

      <Button className="w-full" type="submit">
        Mettre à jour
      </Button>
    </form>
  );
}