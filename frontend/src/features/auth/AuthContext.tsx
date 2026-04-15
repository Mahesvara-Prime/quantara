import React from "react";
import { getAccessToken } from "../../shared/api";
import { authMock, setAuthenticated } from "./auth.mock";
import {
  AuthInvalidCredentialsError,
  clearBackendSession,
  getCurrentUser,
  isApiConfigured,
  loginWithBackend,
  registerWithBackend,
  type AuthSessionUser,
} from "./services/auth.service";

type AuthContextValue = {
  /** Profil affiché (sidebar, profile, etc.). Null si non connecté. */
  user: AuthSessionUser | null;
  /** True une fois l'état initial résolu (token + /me ou mock). */
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  /** Inscription API uniquement (no-op côté mock sans backend). */
  signUp: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  /**
   * Recharge le profil depuis GET /auth/me (JWT actuel).
   * No-op sans API configurée ; en cas d’échec, déconnecte comme au chargement initial.
   */
  refreshUser: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

function mockUserToSession(): AuthSessionUser {
  const u = authMock.user;
  return {
    id: 0,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
  };
}

/**
 * Fournit la session utilisateur pour toute l'app (routes publiques + privées).
 * - API : JWT dans `localStorage`, validation via GET /auth/me au chargement.
 * - Mock : même fichier `auth.mock` qu'avant si pas d'URL backend.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthSessionUser | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (isApiConfigured()) {
          const token = getAccessToken();
          if (token) {
            const u = await getCurrentUser();
            if (!cancelled) setUser(u);
          }
        } else if (authMock.isAuthenticated) {
          if (!cancelled) setUser(mockUserToSession());
        }
      } catch {
        clearBackendSession();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signUp = React.useCallback(
    async (firstName: string, lastName: string, email: string, password: string) => {
      if (!isApiConfigured()) {
        throw new Error(
          "Inscription via API indisponible : définis VITE_API_BASE_URL ou utilise un compte seed (python -m scripts.seed_test_user).",
        );
      }
      const u = await registerWithBackend(firstName, lastName, email, password);
      setUser(u);
    },
    [],
  );

  const signIn = React.useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const pwd = password.trim();

    if (isApiConfigured()) {
      const u = await loginWithBackend(normalizedEmail, pwd);
      setUser(u);
      return;
    }

    const expectedEmail = authMock.user.email.trim().toLowerCase();
    const expectedPassword = authMock.user.password.trim();
    if (
      normalizedEmail === expectedEmail &&
      pwd === expectedPassword
    ) {
      setAuthenticated(true);
      setUser(mockUserToSession());
      return;
    }

    throw new AuthInvalidCredentialsError();
  }, []);

  const signOut = React.useCallback(() => {
    clearBackendSession();
    setAuthenticated(false);
    setUser(null);
  }, []);

  const refreshUser = React.useCallback(async () => {
    try {
      if (!isApiConfigured()) return;
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const u = await getCurrentUser();
      setUser(u);
    } catch {
      clearBackendSession();
      setAuthenticated(false);
      setUser(null);
    }
  }, []);

  const value = React.useMemo(
    () => ({ user, ready, signIn, signUp, signOut, refreshUser }),
    [user, ready, signIn, signUp, signOut, refreshUser],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé sous <AuthProvider>.");
  }
  return ctx;
}
