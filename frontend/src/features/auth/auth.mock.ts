/**
 * Fake authentication centralisée (pour l'interface privée).
 *
 * Rôle:
 * - Servir de source unique pour tester l'accès aux routes privées
 * - Permettre de modifier facilement `isAuthenticated` + le mock user
 *
 * Note:
 * - Ce fichier est volontairement simple et auto-documenté pour pouvoir
 *   être remplacé facilement par une authentification backend plus tard.
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

/**
 * Met à jour la valeur d'auth (utilisé par login/logout).
 * TODO backend: brancher la session réelle.
 */
export function setAuthenticated(isAuthenticated: boolean) {
  authMock.isAuthenticated = isAuthenticated;
}

/** Logout mock: coupe l'accès et laisse le router rediriger. */
export function logoutMock() {
  authMock.isAuthenticated = false;
}

