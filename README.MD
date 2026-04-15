# Quantara

Quantara est une plateforme d'analyse, de simulation et d'apprentissage des marchés financiers.

Le projet vise à fournir un environnement permettant aux utilisateurs de :

- analyser les marchés
- visualiser des graphiques financiers
- simuler des stratégies de trading
- apprendre les concepts du trading
- suivre leur progression

# Vision du projet

Quantara combine trois piliers :

- analyse des marchés
- simulation de trading
- apprentissage pédagogique

L'objectif est de créer une plateforme permettant aux utilisateurs de comprendre les marchés financiers et d'améliorer leurs décisions.

# Architecture du projet

Le projet est organisé sous forme de **monorepo**.

```text
quantara/
├── frontend/
├── backend/
├── docs/
├── infra/
└── .github/
```

# Licence

Le code est publié sous [licence MIT](LICENSE).

# Configuration et déploiement

- **Frontend** : copier `frontend/.env.example` vers `frontend/.env`, définir `VITE_API_BASE_URL` (URL du backend, ex. `http://127.0.0.1:8000` en local). Rebuild le front pour la production avec l’URL publique de l’API.
- **Backend** : copier `backend/.env.example` vers `backend/.env`. Variables importantes : `DATABASE_URL`, `JWT_SECRET_KEY` (chaîne longue et aléatoire en production), `CORS_ALLOWED_ORIGINS` (origines du front, séparées par des virgules), `PUBLIC_APP_URL` (origine du SPA pour les liens e-mail).
- **Compte de démo** : depuis `backend/`, après migrations et base prête : `python -m scripts.seed_test_user`. Les identifiants par défaut sont pour le développement local ; en environnement partagé, définir `QUANTARA_SEED_EMAIL` et `QUANTARA_SEED_PASSWORD` (voir `backend/.env.example`).
- Ne pas commiter de fichiers `.env` ni de secrets dans le dépôt.

# Technologies

## Frontend

- React
- TypeScript
- Vite
- TailwindCSS

## Backend

- FastAPI
- Python
- SQLAlchemy

## Base de données

- PostgreSQL

## Infrastructure

- Docker

# Documentation

La documentation du projet se trouve dans :

```text
docs/
```

Elle contient :

- architecture
- conception fonctionnelle
- décisions techniques
- diagrammes
- documents de projet

# Statut du projet

Projet actuellement en développement.
