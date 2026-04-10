/**
 * Données de secours lorsque `VITE_API_BASE_URL` n'est pas défini.
 *
 * Avec une URL backend (`AuthProvider`), le login utilise POST /auth/login et le JWT ;
 * ce mock sert uniquement au mode développement sans API.
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
  // Modifiable par le dev pour tester l'accès aux pages privées.
  isAuthenticated: false,
  // Mock user (modifier ces champs pour tester login).
  user: {
    firstName: "Kelvin",
    lastName: "Azur",
    email: "apek062000@gmail.com",
    password: "Quantara20026@",
  },
};

/** Utilisé par `AuthContext` en mode sans API (login mock). */
export function setAuthenticated(isAuthenticated: boolean) {
  authMock.isAuthenticated = isAuthenticated;
}

