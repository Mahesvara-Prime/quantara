# Module 7 — Insights

## 1. Rôle du module

Le module `insights` est responsable de l’analyse du comportement utilisateur et de la génération de recommandations simples.

Il permet d’interpréter les actions de l’utilisateur et de produire des observations utiles.

> `simulation` enregistre les actions  
> `progress` mesure l’évolution  
> `insights` interprète ces données

## 2. Responsabilités

Le module `insights` doit gérer :

### A. Détection de patterns

- pertes répétées
- absence de stop loss
- concentration sur un seul actif

### B. Recommandations simples

- conseils pratiques
- suggestions d’amélioration

### C. Synthèse comportementale

- observations globales utilisateur
- résumé pour dashboard ou progress

### D. Base pour intelligence future

- préparation à des systèmes plus avancés

## 3. Ce que le module ne doit pas faire

Le module ne doit pas :

- exécuter des trades
- gérer les cours
- gérer l’authentification
- devenir un moteur IA complexe
- dupliquer `progress` ou `simulation`

## 4. Structure du module

```text
app/modules/insights/
├── schemas.py
├── service.py
└── rules.py
```

## 5. schemas.py

### InsightItemResponse

```json
{
  "type": "string",
  "title": "string",
  "message": "string",
  "severity": "low | medium | high"
}
```

### InsightsResponse

```json
{
  "user_id": "int",
  "items": []
}
```

## 6. service.py

### Rôle

Orchestration des insights

### Fonction principale

#### generate_user_insights(user_id)

- récupérer données simulation
- récupérer données progress
- appliquer les règles
- construire la réponse

## 7. rules.py

### Rôle

Logique analytique pure

### Fonctions possibles

- detect_repeated_losses(trades)
- detect_missing_stop_loss(trades)
- detect_overconcentration(positions)
- detect_learning_without_application(progress, trades)

## 8. Sources de données

Le module utilise :

- simulation (trades, positions)
- progress (apprentissage)
- education (optionnel plus tard)

## 9. Routes API

### Base

```
/api/v1/insights/
```

### Endpoints

#### GET /insights

Retourne les insights utilisateur

## 10. Flux logique

```text
Request
   ↓
Route API
   ↓
Service generate_user_insights
   ↓
Récupération données
   ↓
Rules (analyse)
   ↓
Construction réponse
   ↓
Response
```

## 11. Périmètre MVP

### Inclus

- règles simples
- recommandations textuelles
- analyse basique

### Exclu

- IA avancée
- scoring complexe
- prédictions
- moteur expert

## 12. Interaction frontend

### Progress page

- affichage des recommandations

### Dashboard (plus tard)

- résumé rapide

## 13. À éviter

- complexité excessive
- logique opaque
- dépendance à des modèles IA
- duplication de logique

## 14. Résultat attendu

Le module doit permettre :

- détecter des patterns simples
- générer des recommandations
- enrichir l’expérience utilisateur

## 15. Résumé

> Le module `insights` analyse le comportement utilisateur pour produire des recommandations simples et utiles dans Quantara.
