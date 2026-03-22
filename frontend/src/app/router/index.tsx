import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";

/**
 * Point d’entrée du router.
 * Facile à étendre plus tard (ex: routes privées) sans casser l’interface publique.
 */
export const router = createBrowserRouter(publicRoutes);

