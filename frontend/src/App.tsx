import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";

/**
 * Racine de l’UI.
 * Ne contient aucune logique métier : on branche uniquement le router.
 */
export function App() {
  return <RouterProvider router={router} />;
}

