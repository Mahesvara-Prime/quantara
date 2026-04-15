/**
 * Données de secours lorsque `VITE_API_BASE_URL` n'est pas défini.
 *
 * Avec une URL backend (`AuthProvider`), le login utilise POST /auth/login et le JWT ;
 * l’inscription utilise POST /auth/register. Ce mock sert uniquement au mode sans API.
 *
 * Ne pas y mettre de vrais mots de passe : utilise des identifiants factices pour les tests locaux.
 */

export type MockUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type AuthMock = {
  isAuthenticated: boolean;
  user: MockUser;
};

export const authMock: AuthMock = {
  isAuthenticated: false,
  user: {
    firstName: "Dev",
    lastName: "User",
    email: "dev@example.local",
    password: "change-me-local-only",
  },
};

/** Utilisé par `AuthContext` en mode sans API (login mock). */
export function setAuthenticated(isAuthenticated: boolean) {
  authMock.isAuthenticated = isAuthenticated;
}
