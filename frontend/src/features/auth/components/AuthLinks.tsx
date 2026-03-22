import React from "react";
import { Link } from "react-router-dom";

/**
 * Liens secondaires réutilisables sur les écrans d’auth.
 * On garde cette logique de navigation au même endroit pour éviter la duplication.
 */
export function AuthLinks({ mode }: { mode: "login" | "register" | "forgot" | "reset" }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[#E6EDF3]/70">
      {mode !== "login" ? (
        <Link className="hover:text-[#E6EDF3]" to="/login">
          Déjà un compte ? Se connecter
        </Link>
      ) : (
        <Link className="hover:text-[#E6EDF3]" to="/register">
          Pas de compte ? Créer un compte
        </Link>
      )}

      {mode !== "forgot" && mode !== "reset" ? (
        <Link className="hover:text-[#E6EDF3]" to="/forgot-password">
          Mot de passe oublié ?
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}

