# Quantara – Règles de développement

## 1. Introduction

Ce document définit les règles de développement du projet **Quantara**.

Son objectif est de garantir :

- une base de code propre
- une structure cohérente
- une collaboration fluide
- une évolution maîtrisée du projet
- une compréhension rapide du dépôt par tout nouveau développeur

Ces règles doivent être respectées pour toute nouvelle contribution au projet.

# 2. Principes fondamentaux

## 2.1 Clarté avant complexité

Tout code ajouté au projet doit être :

- lisible
- compréhensible
- maintenable
- cohérent avec l’architecture existante

Un code simple et clair est préféré à un code trop “intelligent” mais difficile à maintenir.

## 2.2 Une responsabilité par module

Chaque partie du système doit avoir une responsabilité claire.

Exemples :

- le frontend gère l’interface et l’expérience utilisateur
- le backend gère la logique métier et les données
- les repositories accèdent aux données
- les services appliquent les règles métier
- les routes exposent les fonctionnalités via l’API

## 2.3 Respect de l’architecture existante

Avant d’ajouter un fichier ou une logique, le développeur doit vérifier :

- si un module existe déjà
- si un composant similaire existe déjà
- si la fonctionnalité s’intègre dans une structure existante

On évite de créer de nouvelles structures parallèles sans nécessité.

# 3. Règles générales de contribution

## 3.1 Avant de coder

Avant d’écrire une nouvelle fonctionnalité, le développeur doit :

1. identifier le module concerné
2. vérifier si la fonctionnalité existe déjà partiellement
3. comprendre le flux global
4. choisir le bon emplacement pour le code
5. éviter les duplications

## 3.2 Avant de créer un nouveau fichier

Avant de créer un fichier, poser les questions suivantes :

- Est-ce vraiment un nouveau besoin ?
- Est-ce qu’un fichier existant couvre déjà cette responsabilité ?
- Est-ce que ce nouveau fichier respecte la logique de séparation du projet ?

On ne crée pas de fichiers inutiles.

## 3.3 Avant de modifier un fichier existant

Le développeur doit vérifier :

- le rôle exact du fichier
- l’impact de la modification sur les autres modules
- si la logique ajoutée appartient bien à ce fichier

# 4. Conventions de nommage

## 4.1 Dossiers

Les dossiers doivent être nommés :

- en minuscules
- avec des noms explicites
- sans espaces
- avec underscore si nécessaire

Exemples :

```text
market_data
charting
education
simulation
```

## 4.2 Fichiers Python

Les fichiers Python doivent être nommés :

- en minuscules
- avec underscore si nécessaire
- avec un nom fonctionnel explicite

Exemples :

```text
config.py
security.py
repository.py
service.py
rules.py
indicators.py
```

## 4.3 Fichiers React / TypeScript

### Composants React

Les composants React doivent être nommés en **PascalCase**.

Exemples :

```text
LoginForm.tsx
DashboardLayout.tsx
CandlestickChart.tsx
PortfolioCard.tsx
```

### Services, hooks, utils

Les autres fichiers TS peuvent suivre une convention cohérente selon le rôle.

Exemples :

```text
auth.service.ts
market.service.ts
useAuth.ts
formatCurrency.ts
```

## 4.4 Variables

Les variables doivent avoir des noms explicites.

Bon :

```python
current_user
portfolio_value
market_snapshot
```

Mauvais :

```python
x
tmp
data2
```

## 4.5 Fonctions

Les fonctions doivent être nommées avec un verbe clair.

Exemples :

```python
get_user_by_id()
calculate_pnl()
validate_stop_loss()
list_assets()
```

# 5. Règles backend

## 5.1 Organisation de la logique

Dans le backend, chaque type de logique va dans un fichier précis.

### `models.py`

Contient uniquement les modèles de base de données.

### `schemas.py`

Contient uniquement les schémas Pydantic.

### `repository.py`

Contient uniquement les accès à la base de données.

### `service.py`

Contient uniquement la logique métier.

### `rules.py`

Contient uniquement les règles métier isolées.

### `api/v1/*.py`

Contient uniquement les routes HTTP.

## 5.2 Ce qu’il ne faut pas faire dans le backend

### Ne pas mettre dans `models.py`

- logique métier
- calculs
- règles stop-loss
- logique simulation

### Ne pas mettre dans `repository.py`

- décisions métier
- calculs P&L
- validation avancée

### Ne pas mettre dans `service.py`

- routes FastAPI
- définitions SQLAlchemy
- logique de sérialisation API

### Ne pas mettre dans `api/v1/*.py`

- logique métier lourde
- requêtes base de données directes
- appels externes complexes

## 5.3 Règle de passage backend

Pour toute nouvelle fonctionnalité backend, le chemin logique doit être :

```text
Route API
→ Service
→ Repository / Rules
→ Base de données ou provider externe
```

## 5.4 Ajout d’un nouveau module backend

Pour créer un nouveau module backend, il faut créer :

```text
modules/new_module/
  models.py
  schemas.py
  repository.py
  service.py
  rules.py
```

Tous les fichiers ne sont pas obligatoires au départ, mais la structure doit rester cohérente.

## 5.5 Ajout d’un provider externe

Les providers externes doivent être créés dans :

```text
backend/app/modules/market_data/providers/
```

Exemple :

```text
coingecko.py
binance.py
polygon.py
```

Règle :

- le provider récupère les données externes
- il ne contient pas la logique métier globale

# 6. Règles frontend

## 6.1 Séparation interface / logique

Le frontend doit séparer :

- les composants visuels
- les pages fonctionnelles
- les appels API
- l’état global
- les hooks personnalisés

## 6.2 Ce qu’on met dans `components/ui/`

Uniquement les composants visuels réutilisables.

Exemples :

- Button
- Input
- Card
- Modal
- Badge

Ces composants ne doivent pas contenir de logique métier spécifique à un module.

## 6.3 Ce qu’on met dans `features/`

Chaque feature contient la logique d’un module métier côté frontend.

Exemple :

```text
features/simulation/
features/education/
features/markets/
```

Dans une feature, on peut avoir :

```text
components/
pages/
hooks/
types/
utils/
index.ts
```

## 6.4 Ce qu’on met dans `services/`

Les fichiers `*.service.ts` contiennent :

- les appels API
- les requêtes HTTP
- les transformations légères liées à l’API

Exemples :

```text
auth.service.ts
market.service.ts
simulation.service.ts
```

Ils ne doivent pas contenir la logique d’affichage UI.

## 6.5 Ce qu’on met dans `store/`

Le store contient uniquement l’état global réellement partagé.

Exemples :

- utilisateur connecté
- préférences de langue
- watchlist
- paramètres globaux UI

On ne met pas tout dans le store sans raison.

## 6.6 Ce qu’on met dans `hooks/`

Les hooks personnalisés doivent être réutilisables.

Exemples :

```text
useAuth.ts
useLanguage.ts
useDebounce.ts
useMarketFilters.ts
```

## 6.7 Textes de l’application

Tous les textes visibles de l’application doivent être compatibles avec le système de traduction.

Les chaînes d’interface ne doivent pas être codées en dur si elles peuvent être traduites.

Les traductions vont dans :

```text
frontend/src/i18n/fr/
frontend/src/i18n/en/
```

# 7. Règles de création d’une nouvelle fonctionnalité

## 7.1 Étapes recommandées

Quand une nouvelle fonctionnalité est ajoutée, suivre cet ordre :

1. définir le besoin fonctionnel
2. identifier le module concerné
3. identifier les fichiers à créer / modifier
4. créer les schémas nécessaires
5. implémenter la logique backend
6. exposer la route API
7. créer les services frontend
8. créer les pages/composants frontend
9. tester la fonctionnalité
10. documenter si nécessaire

## 7.2 Exemple : ajouter un nouvel indicateur technique

### Backend

- `backend/app/modules/charting/indicators.py`
- `backend/app/modules/charting/service.py`
- éventuellement `backend/app/api/v1/charting.py`

### Frontend

- `frontend/src/components/charts/`
- `frontend/src/features/charting/`

## 7.3 Exemple : ajouter un nouveau type d’actif (ex. forex)

### Backend

- provider dans `market_data/providers/`
- logique dans `market_data/service.py`
- schémas dans `market_data/schemas.py`

### Frontend

- affichage dans `features/markets/`
- adaptation des graphiques dans `features/charting/`
- appels API dans `market.service.ts`

# 8. Règles de tests

## 8.1 Tout code métier important doit être testable

Les règles métier critiques doivent être isolées dans des fonctions ou services facilement testables.

Exemples :

- calcul du P&L
- validation stop-loss
- calcul de progression
- détection d’erreurs utilisateur

## 8.2 Tests unitaires

Les tests unitaires doivent aller dans :

```text
backend/app/tests/unit/
```

Ils doivent couvrir :

- règles métier
- services
- calculs
- utilitaires critiques

## 8.3 Tests d’intégration

Les tests d’intégration doivent aller dans :

```text
backend/app/tests/integration/
```

Ils doivent couvrir :

- routes API
- workflow complet
- accès base de données

## 8.4 Frontend

Pour le frontend, tester prioritairement :

- les composants critiques
- les formulaires
- les workflows de navigation majeurs

# 9. Règles Git et Pull Requests

## 9.1 Commits

Les commits doivent être :

- petits
- clairs
- ciblés
- compréhensibles

Bon exemple :

```text
feat(simulation): add portfolio P&L calculation
fix(auth): correct token refresh handling
docs(architecture): add file responsibilities guide
```

Mauvais exemple :

```text
update
fix stuff
modifs
```

## 9.2 Branches

Créer une branche par tâche ou fonctionnalité.

Exemples :

```text
feature/auth-login
feature/market-candles
feature/simulation-orders
fix/progress-calculation
docs/repo-architecture
```

## 9.3 Pull Requests

Chaque Pull Request doit :

- avoir un titre clair
- avoir une description concise
- expliquer ce qui a été fait
- indiquer les impacts éventuels
- rester raisonnablement petite si possible

# 10. Règles de documentation

## 10.1 Documenter les décisions importantes

Toute décision structurante doit être documentée dans :

```text
docs/decisions/
```

Exemple :

- choix du monorepo
- choix de FastAPI
- choix de PostgreSQL
- choix de l’architecture modulaire

## 10.2 Mettre à jour la documentation si nécessaire

Si une nouvelle structure ou une nouvelle règle est introduite, la documentation d’architecture doit être mise à jour.

# 11. Règles de qualité

## 11.1 Pas de duplication inutile

Avant de créer une fonction ou un composant, vérifier si quelque chose de similaire existe déjà.

## 11.2 Pas de logique cachée dans l’UI

Un composant React ne doit pas devenir un service backend déguisé.

## 11.3 Pas de logique SQL dans les routes

Les routes doivent rester fines.

## 11.4 Pas de “fichiers fourre-tout”

Éviter les fichiers où tout est mélangé.

Exemples à éviter :

- `helpers.py` géant avec toute la logique du projet
- `utils.ts` utilisé pour des règles métier critiques
- composant React de 1000 lignes avec tout dedans

# 12. Checklist avant contribution

Avant de pousser du code, le développeur doit vérifier :

- [ ] Le bon dossier a été utilisé
- [ ] Le bon type de fichier a été utilisé
- [ ] La logique métier n’est pas dans la route
- [ ] Les accès DB ne sont pas dans le service frontend
- [ ] Les noms sont clairs
- [ ] Le code est lisible
- [ ] Les tests nécessaires existent
- [ ] La documentation a été mise à jour si besoin

# 13. Conclusion

Ces règles de développement ont pour but de préserver la cohérence, la lisibilité et l’évolutivité du projet Quantara.

Elles doivent être suivies par tous les contributeurs afin de garantir :

- une architecture propre
- une collaboration efficace
- une base de code stable
- une montée en complexité maîtrisée
