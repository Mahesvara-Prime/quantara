import React from "react";
import type { RouteObject } from "react-router-dom";
import { PublicAuthLayout } from "../layouts/PublicAuthLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { LandingPage } from "../../features/landing";
import {
  ConfirmPasswordChangePage,
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
} from "../../features/auth";

/**
 * Routes publiques.
 * - Landing sous `PublicLayout`
 * - Auth (login/register/forgot/reset) sous `PublicAuthLayout` (card centrée)
 */
export const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      {
        element: <PublicAuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/reset-password", element: <ResetPasswordPage /> },
          { path: "/confirm-password-change", element: <ConfirmPasswordChangePage /> },
        ],
      },
    ],
  },
];

