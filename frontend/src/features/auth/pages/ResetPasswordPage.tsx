import { useSearchParams } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { AuthLinks } from "../components/AuthLinks";
import { ResetPasswordForm } from "../components/ResetPasswordForm";
import { Alert } from "../../../components/ui/Alert";

/** Page « Réinitialiser » (publique) — ouverte depuis l’e-mail (?token=…). */
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  return (
    <div className="space-y-4">
      <AuthCard title="Réinitialiser" subtitle="Définis un nouveau mot de passe.">
        {!token ? (
          <Alert variant="error" title="Lien incomplet">
            Ce lien ne contient pas de jeton valide. Ouvre le lien reçu par e-mail ou refais une demande
            depuis « Mot de passe oublié ».
          </Alert>
        ) : (
          <ResetPasswordForm token={token} />
        )}
      </AuthCard>
      <AuthLinks mode="reset" />
    </div>
  );
}
