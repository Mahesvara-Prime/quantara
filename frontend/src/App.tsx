import React from "react";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";
import { router } from "./app/router";

/**
 * Racine de l’UI.
 * `AuthProvider` enveloppe le router pour la session (JWT / mock) et les gardes de route.
 */
export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

