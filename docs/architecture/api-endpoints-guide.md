# Quantara — API Endpoints Guide

## 1. Objectif du document

Ce document définit l’ensemble des endpoints du backend Quantara.

Il sert de référence pour :

- le développement backend
- l’intégration frontend
- la validation des routes
- l’implémentation avec Cursor

Il décrit **ce que fait chaque endpoint**, sans entrer dans les détails d’implémentation interne.

## 2. Structure globale de l’API

Toutes les routes sont versionnées :

```text
/api/v1/
```

Les routes sont organisées par domaine métier :

- auth
- assets
- simulation
- portfolio
- trades
- courses
- lessons
- progress
- insights

## 3. Auth — `/api/v1/auth`

### POST `/auth/login`

**Rôle :**
Connecter un utilisateur

**Auth :**
Non

**Body :**

```json
{
  "email": "string",
  "password": "string"
}
```

**Réponse :**

```json
{
  "access_token": "string",
  "token_type": "bearer",
  "user": {}
}
```

**Module :**
identity

### GET `/auth/me`

**Rôle :**
Récupérer l’utilisateur courant

**Auth :**
Oui

**Réponse :**

```json
{
  "id": "int",
  "first_name": "string",
  "last_name": "string",
  "email": "string"
}
```

**Module :**
identity

## 4. Market Data — `/api/v1/assets`

### GET `/assets`

**Rôle :**
Lister les actifs disponibles

**Auth :**
Optionnel (selon produit)

**Réponse :**

```json
[
  {
    "symbol": "string",
    "name": "string",
    "price": "float",
    "change_percent": "float"
  }
]
```

**Module :**
market_data

### GET `/assets/{symbol}`

**Rôle :**
Détail d’un actif

**Auth :**
Optionnel

**Paramètres :**

- symbol (path)

**Réponse :**

```json
{
  "symbol": "string",
  "name": "string",
  "price": "float",
  "change_percent": "float"
}
```

**Module :**
market_data

### GET `/assets/{symbol}/candles`

**Rôle :**
Récupérer les données de graphique

**Auth :**
Optionnel

**Query params :**

- timeframe (ex: 1h, 1d)
- limit (int)

**Réponse :**

```json
[
  {
    "timestamp": "int",
    "open": "float",
    "high": "float",
    "low": "float",
    "close": "float"
  }
]
```

**Module :**
market_data / charting

## 5. Simulation — `/api/v1/simulation`

### POST `/simulation/trades`

**Rôle :**
Exécuter un trade simulé

**Auth :**
Oui

**Body :**

```json
{
  "symbol": "string",
  "side": "buy | sell",
  "amount": "float"
}
```

**Réponse :**

```json
{
  "id": "int",
  "symbol": "string",
  "side": "string",
  "amount": "float",
  "quantity": "float",
  "price": "float"
}
```

**Module :**
simulation

## 6. Portfolio — `/api/v1/portfolio`

### GET `/portfolio`

**Rôle :**
Résumé du portefeuille

**Auth :**
Oui

**Réponse :**

```json
{
  "cash_balance": "float",
  "total_value": "float",
  "total_pnl": "float"
}
```

**Module :**
simulation

### GET `/portfolio/positions`

**Rôle :**
Lister les positions ouvertes

**Auth :**
Oui

**Réponse :**

```json
[
  {
    "symbol": "string",
    "quantity": "float",
    "average_entry_price": "float",
    "current_price": "float",
    "pnl": "float"
  }
]
```

**Module :**
simulation

### GET `/portfolio/performance`

**Rôle :**
Données de performance (simple)

**Auth :**
Oui

**Réponse :**

```json
[]
```

**Module :**
simulation

## 7. Trades — `/api/v1/trades`

### GET `/trades`

**Rôle :**
Historique des trades

**Auth :**
Oui

**Réponse :**

```json
[
  {
    "symbol": "string",
    "side": "string",
    "amount": "float",
    "price": "float",
    "created_at": "datetime"
  }
]
```

**Module :**
simulation

## 8. Education — `/api/v1/courses`

### GET `/courses`

**Rôle :**
Lister les cours

**Auth :**
Optionnel

**Réponse :**

```json
[
  {
    "id": "int",
    "title": "string",
    "level": "string"
  }
]
```

**Module :**
education

### GET `/courses/{course_id}`

**Rôle :**
Détail d’un cours

**Auth :**
Optionnel

**Réponse :**

```json
{
  "id": "int",
  "title": "string",
  "description": "string",
  "lessons": []
}
```

**Module :**
education

## 9. Lessons — `/api/v1/lessons`

### GET `/lessons/{lesson_id}`

**Rôle :**
Détail d’une leçon

**Auth :**
Optionnel

**Réponse :**

```json
{
  "id": "int",
  "title": "string",
  "content": "string"
}
```

**Module :**
education

### POST `/lessons/{lesson_id}/complete`

**Rôle :**
Marquer une leçon comme complétée

**Auth :**
Oui

**Réponse :**

```json
{
  "status": "completed"
}
```

**Module :**
progress

## 10. Progress — `/api/v1/progress`

### GET `/progress`

**Rôle :**
Progression globale

**Auth :**
Oui

**Réponse :**

```json
{
  "total_lessons_completed": "int",
  "total_courses_completed": "int",
  "overall_progress": "float"
}
```

**Module :**
progress

### GET `/progress/courses/{course_id}`

**Rôle :**
Progression d’un cours

**Auth :**
Oui

**Réponse :**

```json
{
  "course_id": "int",
  "progress_percent": "float",
  "completed": "boolean"
}
```

**Module :**
progress

## 11. Insights — `/api/v1/insights`

### GET `/insights`

**Rôle :**
Retourner des insights utilisateur

**Auth :**
Oui

**Réponse :**

```json
{
  "items": [
    {
      "type": "string",
      "title": "string",
      "message": "string",
      "severity": "low | medium | high"
    }
  ]
}
```

**Module :**
insights

## 12. Endpoint technique

### GET `/health`

**Rôle :**
Vérifier que le backend fonctionne

**Auth :**
Non

**Réponse :**

```json
{
  "status": "ok"
}
```

## 13. Règles globales

### Auth

- toutes les routes privées nécessitent un token
- `/auth/login` est public

### Format JSON

- toutes les réponses sont en JSON
- les champs doivent être cohérents et stables

### Cohérence

- ne pas changer les formats sans mise à jour frontend
- respecter les schémas définis

## 14. Résumé

> Ce document définit le contrat API du backend Quantara et sert de référence unique pour l’implémentation et l’intégration frontend.
