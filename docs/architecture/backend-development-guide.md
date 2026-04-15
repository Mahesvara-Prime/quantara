# Quantara — Backend Development Guide

## 1. Objectif du document

Ce document sert de guide principal pour le développement du backend de Quantara.

Il a pour but de fournir un cadre clair à tout développeur ou agent de génération de code afin de :

- comprendre le rôle du backend
- respecter l’architecture définie
- implémenter les modules dans le bon ordre
- éviter les erreurs de structure
- maintenir une base de code propre, modulaire et évolutive

Ce guide ne remplace pas les documents plus spécialisés. Il agit comme document directeur pour l’implémentation.

## 2. Rôle du backend de Quantara

Le backend de Quantara constitue la couche centrale de la plateforme.

Il est responsable de :

- l’authentification et l’identité utilisateur
- la gestion des données de marché
- le moteur de simulation
- la distribution du contenu éducatif
- le suivi de progression
- la production d’insights simples
- l’exposition d’une API claire au frontend

Le backend ne doit pas être considéré comme un simple fournisseur d’API passif. Il héberge la logique métier réelle du produit.

## 3. Ce que le backend gère

Le backend doit couvrir les domaines suivants :

### 3.1 Identity

- utilisateurs
- login
- utilisateur courant
- protection des routes privées

### 3.2 Market Data

- liste des actifs
- détail d’un actif
- candles / données de graphique
- normalisation des données provider

### 3.3 Simulation

- exécution de trades simulés
- gestion du portefeuille
- gestion des positions
- historique des trades
- calculs simples de profit / loss

### 3.4 Education

- catalogue de cours
- détail d’un cours
- contenu d’une leçon

### 3.5 Progress

- complétion des leçons
- progression par cours
- progression globale

### 3.6 Charting

- préparation des données de graphiques
- formatage des candles
- indicateurs simples plus tard

### 3.7 Insights

- détection de patterns simples
- recommandations légères
- enrichissement de la page Progress

## 4. Ce que le backend ne doit pas faire

Pour préserver la qualité de l’architecture, le backend ne doit pas :

- devenir un monolithe confus
- mélanger routes, SQL et logique métier dans les mêmes fichiers
- exposer directement les providers externes au frontend
- implémenter trop tôt des fonctionnalités avancées non nécessaires au MVP
- simuler un broker réel
- stocker massivement des données marché inutiles au MVP

Le backend MVP de Quantara doit rester simple, propre et progressif.

## 5. Stack technique

Le backend repose sur les choix suivants :

- **FastAPI** pour l’API
- **PostgreSQL** pour la base de données
- **SQLAlchemy** pour l’ORM
- **Alembic** pour les migrations
- **Pydantic** pour les schémas de validation

Ces choix sont déjà validés dans les documents d’architecture précédents et doivent être respectés.

## 6. Principes d’architecture

Le backend doit suivre une architecture en couches.

### 6.1 Couche API

Responsable de :

- recevoir les requêtes HTTP
- valider l’entrée
- appeler les services
- renvoyer les réponses

Les routes doivent rester fines.

### 6.2 Couche Service

Responsable de :

- la logique métier
- l’orchestration
- les décisions du domaine
- l’interaction entre repositories, règles et providers

### 6.3 Couche Repository

Responsable de :

- l’accès à la base de données
- les requêtes CRUD
- les lectures / écritures ciblées

### 6.4 Couche Rules

Responsable de :

- calculs métiers
- validations métier
- logique pure et testable

### 6.5 Couche Providers

Responsable de :

- l’intégration avec les services externes
- la récupération brute des données externes

## 7. Structure du backend

Le backend doit respecter cette structure :

```text
backend/
├── pyproject.toml
├── requirements.txt
├── alembic.ini
├── app/
│   ├── main.py
│   ├── core/
│   ├── db/
│   ├── api/
│   ├── modules/
│   ├── shared/
│   └── tests/
└── scripts/
```

## 8. Rôle des dossiers principaux

### 8.1 `app/main.py`

Point d’entrée FastAPI.

Contient :

- création de l’application
- configuration générale
- middlewares
- routes
- endpoint health si nécessaire

Ne doit pas contenir :

- logique métier
- SQL
- logique de simulation
- logique auth détaillée

### 8.2 `app/core/`

Contient :

- configuration
- sécurité
- logging
- exceptions globales

### 8.3 `app/db/`

Contient :

- base SQLAlchemy
- engine
- sessions
- migrations

### 8.4 `app/api/`

Contient :

- dépendances partagées
- routes versionnées

### 8.5 `app/modules/`

Contient les modules métier.

### 8.6 `app/shared/`

Contient uniquement le code transversal réellement partagé.

### 8.7 `app/tests/`

Contient :

- tests unitaires
- tests d’intégration
- fixtures

### 8.8 `scripts/`

Contient des scripts techniques hors runtime.

## 9. Structure standard d’un module

Chaque module métier doit, dans la mesure du possible, suivre cette structure :

```text
module_name/
├── models.py
├── schemas.py
├── repository.py
├── service.py
└── rules.py
```

Certains modules légers peuvent avoir une structure réduite, par exemple `charting` ou `insights` au MVP.

## 10. Rôle des fichiers standard

### `models.py`

- modèles SQLAlchemy
- relations
- colonnes
- contraintes simples

### `schemas.py`

- schémas Pydantic
- requêtes
- réponses

### `repository.py`

- accès DB
- CRUD
- requêtes ciblées

### `service.py`

- logique métier
- orchestration

### `rules.py`

- calculs métiers
- validations
- logique pure

## 11. Modules backend

### 11.1 Identity

Responsable de :

- utilisateur
- login
- auth
- utilisateur courant

### 11.2 Market Data

Responsable de :

- actifs
- détail actif
- candles
- provider externe

### 11.3 Simulation

Responsable de :

- trades simulés
- portefeuille
- positions
- historique
- P&L

### 11.4 Education

Responsable de :

- cours
- leçons
- structure pédagogique

### 11.5 Progress

Responsable de :

- complétion des leçons
- progression des cours
- statistiques globales simples

### 11.6 Charting

Responsable de :

- transformation des données marché en format graphique
- indicateurs simples plus tard

### 11.7 Insights

Responsable de :

- insights simples
- recommandations légères
- enrichissement comportemental

## 12. Versionnement API

Toutes les routes doivent être regroupées sous :

```text
/api/v1/
```

Le backend doit être versionné dès le départ afin de :

- permettre l’évolution future
- préserver la compatibilité
- garder une structure professionnelle

## 13. Règles de développement

### 13.1 Règles générales

- respecter l’architecture définie
- ne pas créer d’architecture parallèle
- bien ranger chaque fichier dans le bon dossier
- garder les routes fines
- déplacer la logique métier dans les services
- déplacer les calculs métiers dans `rules.py`
- utiliser les repositories pour la DB

### 13.2 Ce qu’il faut éviter

- SQL direct dans les routes
- logique métier lourde dans `main.py`
- duplication de code
- `utils.py` géant
- providers appelés directement depuis le frontend
- mélange de responsabilités entre modules

### 13.3 Style de code

- code clair
- fonctions courtes
- noms explicites
- modularité
- commentaires utiles uniquement

## 14. Règles spécifiques pour Cursor

Quand Cursor implémente le backend, il doit toujours :

1. relire ce document avant de coder
2. relire le guide des endpoints
3. relire le guide de base de données
4. respecter l’architecture existante
5. créer les fichiers dans les bons dossiers
6. commenter proprement le code
7. ne pas réorganiser arbitrairement la structure
8. travailler bloc par bloc
9. ne pas essayer de coder tout le backend d’un coup

Cursor ne doit jamais créer une seconde architecture “plus simple” à côté de celle définie.

## 15. Ordre d’implémentation obligatoire

Le backend doit être implémenté dans cet ordre :

### Bloc 1 — Socle backend

- `main.py`
- config
- db
- router
- `/health`

### Bloc 2 — Base de données

- modèles initiaux
- Alembic
- première migration

### Bloc 3 — Identity

- user
- register (`POST /auth/register`)
- login
- auth/me
- auth dependencies

### Bloc 4 — Market Data

- provider
- routes assets
- candles

### Bloc 5 — Simulation

- trade execution
- portfolio
- positions
- trades

### Bloc 6 — Education

- courses
- lessons

### Bloc 7 — Progress

- lesson completion
- progression globale

### Bloc 8 — Charting

- formatage chart
- indicateurs simples éventuels

### Bloc 9 — Insights

- recommandations simples
- signaux comportementaux de base

## 16. Validation attendue à la fin de chaque bloc

Chaque bloc doit produire quelque chose de testable.

### Après bloc 1

- `/health` fonctionne
- FastAPI démarre
- Swagger accessible

### Après bloc 2

- migrations OK
- tables créées

### Après bloc 3

- inscription (`POST /auth/register`) crée un utilisateur et retourne un JWT
- login fonctionne
- `/auth/me` fonctionne

### Après bloc 4

- `/assets` fonctionne
- `/assets/{symbol}/candles` fonctionne

### Après bloc 5

- trade simulé fonctionne
- portefeuille se met à jour
- historique disponible

### Après bloc 6

- cours listés
- leçons consultables

### Après bloc 7

- progression consultable
- leçon marquée comme complétée

### Après bloc 8

- données chart prêtes pour le frontend

### Après bloc 9

- quelques insights simples disponibles

## 17. MVP backend à respecter

Le MVP doit couvrir :

- auth de base
- market data crypto
- simulation simple
- portfolio
- trades
- courses
- lessons
- progression simple
- insights simples ou très légers

Le MVP ne doit pas couvrir immédiatement :

- auth sociale réelle
- MFA
- multi-provider avancé
- websockets avancés
- indicateurs complexes
- insights IA avancés
- moteur de simulation de niveau broker
- analytics avancées

## 18. Attentes de qualité

Le backend généré doit être :

- cohérent
- modulaire
- testable
- lisible
- aligné avec le frontend
- prêt à évoluer après le MVP

Le but n’est pas seulement d’avoir des endpoints qui répondent, mais une base solide sur laquelle toute la suite du produit pourra être construite.

## 19. Résultat attendu

À la fin de l’implémentation guidée par ce document, Quantara doit disposer d’un backend MVP :

- bien structuré
- aligné avec les modules métier
- prêt à servir le frontend existant
- suffisamment propre pour évoluer sans refonte majeure

## 20. Résumé

> Le backend de Quantara doit être développé comme un système modulaire, versionné et orienté métier, implémenté progressivement par blocs, en respectant strictement la structure définie pour garantir un MVP propre et évolutif.
