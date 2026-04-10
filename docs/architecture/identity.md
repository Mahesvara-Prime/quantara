# Module 1 — Identity

## 1. Rôle du module

Le module `identity` est responsable de la gestion de l’utilisateur et de l’authentification dans Quantara.

Il constitue la fondation du backend, permettant :

- d’identifier les utilisateurs
- de sécuriser l’accès aux routes privées
- d’associer les données (portfolio, progression, etc.) à un utilisateur

> Sans ce module, aucune logique personnalisée par utilisateur n’est possible.

## 2. Responsabilités

Le module `identity` doit gérer :

### A. Utilisateur

- définition de l’entité utilisateur
- stockage des informations principales

### B. Authentification

- login via email / mot de passe
- vérification des credentials

### C. Sécurité

- utilisation de mots de passe hashés
- base pour la gestion des tokens

### D. Utilisateur courant

- récupération de l’utilisateur connecté

### E. Protection des routes

- intégration avec les dépendances FastAPI (`deps.py`)

## 3. Ce que le module ne doit pas faire

Le module `identity` ne doit pas gérer :

- la simulation
- le portfolio
- la progression
- les cours
- les données marché

Il doit rester centré uniquement sur l’identité et l’accès.

## 4. Structure du module

```text
app/modules/identity/
├── models.py
├── schemas.py
├── repository.py
├── service.py
└── rules.py
```

## 5. models.py

### Rôle

Définir l’entité `User`.

### Champs recommandés

- id
- first_name
- last_name
- email
- hashed_password
- is_active
- created_at
- updated_at

### Règles

- ne jamais stocker de mot de passe en clair
- utiliser `hashed_password`

## 6. schemas.py

### Rôle

Définir les schémas Pydantic (API).

### Schémas MVP

#### LoginRequest

```json
{
  "email": "string",
  "password": "string"
}
```

#### UserResponse

```json
{
  "id": "int",
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "is_active": "boolean"
}
```

#### AuthTokenResponse

```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

## 7. repository.py

### Rôle

Accès aux données utilisateur.

### Fonctions principales

- `get_user_by_email(db, email)`
- `get_user_by_id(db, user_id)`
- `create_user(db, data)` (optionnel)

### Important

Le repository :

- ne contient pas de logique métier
- ne valide pas les credentials
- ne génère pas de token

## 8. service.py

### Rôle

Logique métier du module.

### Fonctions principales

#### login_user(db, email, password)

- vérifie l’existence de l’utilisateur
- vérifie le mot de passe
- retourne le token

#### get_current_user_profile(db, user_id)

- retourne les informations utilisateur

## 9. rules.py

### Rôle

Règles métier pures.

### Fonctions possibles

- `normalize_email(email)`
- `validate_login_input(email, password)`
- `can_authenticate(user)`

## 10. Routes API

Base :

```
/api/v1/auth/
```

### Endpoints MVP

#### POST /auth/login

Connexion utilisateur

#### GET /auth/me

Utilisateur courant

## 11. Flux du login

```text
POST /auth/login
   ↓
Route FastAPI
   ↓
Service (login_user)
   ↓
Repository (get_user_by_email)
   ↓
Security (verify_password)
   ↓
Security (create_token)
   ↓
Response
```

## 12. Données minimales requises

- un utilisateur en base
- email
- mot de passe hashé
- statut actif

## 13. Dépendances (deps.py)

Fonctions à prévoir :

- `get_current_user`
- `get_current_active_user`

Utilisées dans :

- simulation
- portfolio
- progress
- profile

## 14. Périmètre MVP

### Inclus

- User model
- Login
- Token simple
- Auth protégée

### Exclu (plus tard)

- register complet
- social login
- MFA
- refresh tokens
- rôles avancés

## 15. Interactions

Le module `identity` est utilisé par :

- simulation
- progress
- education
- profile

## 16. À éviter

- mot de passe en clair
- logique dans les routes
- SQL dans les endpoints
- mélange avec d’autres modules

## 17. Résultat attendu

Le module doit permettre :

- login utilisateur
- récupération user courant
- protection des routes
- identification dans tout le backend

## 18. Résumé

> Le module `identity` fournit la base d’authentification et d’identité utilisateur sur laquelle repose tout le backend de Quantara.
