import { useSearchParams } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { AuthLinks } from "../components/AuthLinks";
import { ConfirmPasswordChangeForm } from "../components/ConfirmPasswordChangeForm";
import { Alert } from "../../../components/ui/Alert";

/** Page publique — ouverte depuis le lien e-mail (query ?token=…). */
export function ConfirmPasswordChangePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  return (
    <div className="space-y-4">
      <AuthCard
        title="Confirmer le changement"
        subtitle="Définis ton nouveau mot de passe pour finaliser la modification."
      >
        {!token ? (
          <Alert variant="error" title="Lien incomplet">
            Ce lien ne contient pas de jeton valide. Ouvre le lien reçu par e-mail ou recommence depuis
            Paramètres.
          </Alert>
        ) : (
          <ConfirmPasswordChangeForm token={token} />
        )}
      </AuthCard>
      <AuthLinks mode="login" />
    </div>
  );
}
