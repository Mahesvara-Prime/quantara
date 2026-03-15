# Quantara – Architecture du dépôt

## 1. Introduction

Ce document décrit l’architecture du dépôt du projet **Quantara**.  
Il a pour objectif de permettre à tout développeur rejoignant le projet de comprendre rapidement :

- l’organisation du code
- le rôle de chaque dossier
- les conventions de développement
- où ajouter une nouvelle fonctionnalité

Ce document est une **référence structurelle** pour garantir la cohérence du projet au fil de son évolution.

# 2. Vue globale de l’architecture

Quantara est organisé sous forme de **monorepo**, c’est-à-dire un seul dépôt contenant :

- le frontend
- le backend
- la documentation
- l’infrastructure
- les workflows CI/CD

Structure générale :

```text
quantara/
│
├── frontend/
├── backend/
├── docs/
├── infra/
└── .github/
```

Chaque section possède une responsabilité spécifique.

# 3. Dossier racine du projet

## quantara/

Le dossier racine contient les fichiers de configuration globaux nécessaires au projet.

### README.md

Le README est le point d'entrée principal du projet.  
Il contient :

- présentation de Quantara
- technologies utilisées
- instructions d’installation
- aperçu de la structure du projet

### .gitignore

Liste les fichiers qui ne doivent pas être versionnés.

Exemples :

- dépendances installées
- fichiers temporaires
- fichiers locaux
- fichiers compilés

### .editorconfig

Permet d’uniformiser les conventions d’édition :

- indentation
- encodage
- format des fins de ligne
- taille des tabulations

Cela garantit un code cohérent entre développeurs.

### .env.example

Contient les variables d’environnement nécessaires au projet.

Exemple :

```text
DATABASE_URL=
JWT_SECRET=
API_KEY=
```

Chaque développeur doit créer son propre `.env`.

### docker-compose.yml

Permet de lancer l’environnement complet du projet.

Services possibles :

- backend
- frontend
- base de données PostgreSQL

### Makefile

Permet d’exécuter rapidement des commandes utiles.

Exemples :

```text
make dev
make backend
make frontend
make test
```

# 4. Frontend

## frontend/

Ce dossier contient toute l’interface utilisateur de Quantara.

Le frontend est responsable de :

- l’affichage de l’application
- l’interaction utilisateur
- la visualisation des données
- les graphiques
- la simulation

# 4.1 frontend/src/

Contient le code principal du frontend.

## app/

Contient la configuration globale de l’application.

### router/

Définit les routes de l’application :

```text
/dashboard
/markets
/simulation
/education
/profile
```

### providers/

Contient les providers globaux :

- authentification
- configuration API
- gestion d’état global

### layouts/

Contient les layouts principaux :

- layout du dashboard
- layout public
- layout des pages éducatives

# 4.2 components/

Composants réutilisables.

Structure :

```text
ui/
charts/
forms/
common/
```

### ui/

Composants visuels génériques.

Exemples :

- Button
- Card
- Modal
- Input

### charts/

Composants liés aux graphiques financiers.

Exemples :

- candlestick chart
- line chart
- technical indicators

### forms/

Composants de formulaires.

Exemples :

- login
- register
- paramètres utilisateur

### common/

Composants partagés dans plusieurs modules.

# 4.3 features/

Organisation du frontend par domaine fonctionnel.

```text
auth/
markets/
charting/
simulation/
education/
progress/
dashboard/
```

Chaque dossier contient :

- composants
- logique
- hooks spécifiques

### auth/

Gestion de l’authentification :

- connexion
- inscription
- gestion session

### markets/

Affichage des marchés financiers.

Fonctionnalités :

- liste des actifs
- prix
- volumes
- variation

### charting/

Gestion des graphiques de marché.

Fonctionnalités :

- graphiques chandeliers
- graphiques lignes
- sélection de période

### simulation/

Simulation de trading.

Fonctionnalités :

- achat
- vente
- portefeuille virtuel
- historique des transactions

### education/

Module éducatif.

Fonctionnalités :

- cours
- modules
- progression

### progress/

Analyse des performances de l’utilisateur.

Fonctionnalités :

- statistiques
- progression pédagogique

### dashboard/

Interface principale de l’utilisateur.

# 4.4 services/

Communication avec l’API backend.

Exemples :

```text
auth.service.ts
market.service.ts
simulation.service.ts
education.service.ts
```

# 4.5 hooks/

Hooks React personnalisés utilisés dans l’application.

# 4.6 store/

Gestion de l’état global.

Exemples :

- Zustand
- Redux
- Context API

# 4.7 i18n/

Gestion des langues de l’application.

Langues :

```text
fr/
en/
```

# 5. Backend

## backend/

Contient le serveur API.

Le backend gère :

- la logique métier
- la base de données
- l’authentification
- les simulations
- les données de marché

# 5.1 backend/app/

Cœur de l’application backend.

## core/

Configuration globale du système.

```text
config.py
security.py
logging.py
exceptions.py
```

## db/

Gestion de la base de données.

```text
base.py
session.py
migrations/
```

## api/

Endpoints de l’API.

Structure :

```text
api/
└── v1/
```

## modules/

Organisation du backend par domaines métiers.

Chaque module contient :

```text
models.py
schemas.py
repository.py
service.py
rules.py
```

### identity/

Gestion des utilisateurs.

### market_data/

Gestion des données de marché.

### charting/

Calculs liés aux graphiques.

### simulation/

Simulation de trading.

### education/

Gestion des cours.

### progress/

Suivi de progression.

### insights/

Analyse et recommandations.

# 6. Documentation

## docs/

Contient toute la documentation du projet.

Structure :

```text
functional/
project/
diagrams/
decisions/
```

### functional/

Documents fonctionnels :

- conception fonctionnelle
- définition des fonctionnalités
- périmètre du projet

### project/

Documents de gestion du projet.

- rapport d’avancement
- plan de travail
- roadmap

### diagrams/

Diagrammes :

- architecture
- flux
- séquence

### decisions/

Architecture Decision Records (ADR).

Permet de documenter les décisions techniques importantes.

# 7. Infrastructure

## infra/

Contient la configuration de déploiement.

```text
docker/
nginx/
render/
vercel/
scripts/
```

# 8. CI/CD

## .github/

Contient les workflows GitHub.

Fonctions :

- lint
- tests automatiques
- validation des pull requests

# 9. Ajouter une nouvelle fonctionnalité

Exemple : ajout d’un nouveau module.

Backend :

```text
backend/app/modules/new_module/
```

Frontend :

```text
frontend/src/features/new_module/
```

# 10. Objectif de cette architecture

Cette architecture vise à garantir :

- une organisation claire
- une évolutivité du projet
- une collaboration efficace
- une facilité d’onboarding pour les nouveaux développeurs

# 11. Conclusion

La structure du dépôt Quantara a été conçue pour permettre le développement d’une plateforme évolutive d’analyse, simulation et apprentissage des marchés financiers.

Cette architecture garantit une séparation claire entre :

- l’interface utilisateur
- la logique métier
- la gestion des données
- la documentation
- l’infrastructure
