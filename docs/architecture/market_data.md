# Module 2 — Market Data

## 1. Rôle du module

Le module `market_data` est responsable de la récupération, de la normalisation et de la distribution des données de marché utilisées par Quantara.

Il agit comme une couche intermédiaire entre :

- les providers externes (ex: CoinGecko)
- le backend Quantara
- le frontend

> Le frontend ne parle jamais directement au provider.  
> Il passe toujours par le backend via le module `market_data`.

## 2. Responsabilités

Le module `market_data` doit gérer :

### A. Liste des actifs

- fournir les actifs disponibles (BTC, ETH, etc.)

### B. Détail d’un actif

- prix actuel
- variation
- informations principales

### C. Données de bougies (candles)

- données nécessaires aux graphiques

### D. Normalisation

- transformer les données du provider en format interne propre

### E. Abstraction provider

- permettre de changer de provider sans impacter le reste du backend

## 3. Ce que le module ne doit pas faire

Le module ne doit pas :

- gérer la simulation
- gérer le portefeuille
- calculer le P&L
- gérer les utilisateurs
- gérer la progression

Il est uniquement responsable des données marché.

## 4. Structure du module

```text
app/modules/market_data/
├── models.py
├── schemas.py
├── repository.py
├── service.py
├── rules.py
└── providers/
    ├── base.py
    └── coingecko.py
```

## 5. providers/

### Rôle

Isoler les intégrations externes.

### base.py

Définit le contrat général du provider.

### coingecko.py

Implémente les appels vers CoinGecko.

## 6. models.py

### Rôle

Définir les entités persistées si nécessaire.

### MVP

- peut être minimal
- pas besoin de stocker toutes les données marché

### Option future

- Asset
- MarketSnapshot

## 7. schemas.py

### Rôle

Définir les schémas API.

### Schémas MVP

#### AssetListItemResponse

```json
{
  "symbol": "string",
  "name": "string",
  "price": "float",
  "change_percent": "float"
}
```

#### AssetDetailResponse

```json
{
  "symbol": "string",
  "name": "string",
  "price": "float",
  "change_percent": "float",
  "high_24h": "float",
  "low_24h": "float"
}
```

#### CandleResponse

```json
{
  "timestamp": "int",
  "open": "float",
  "high": "float",
  "low": "float",
  "close": "float"
}
```

## 8. repository.py

### Rôle

Accès DB si nécessaire.

### MVP

- peut être minimal
- utilisé si cache ou persistance légère

### Fonctions possibles

- `list_cached_assets()`
- `get_asset_by_symbol()`

## 9. service.py

### Rôle

Cœur du module.

### Fonctions principales

#### list_assets()

- retourne la liste des actifs

#### get_asset_detail(symbol)

- retourne le détail d’un actif

#### get_asset_candles(symbol, timeframe, limit)

- retourne les bougies

### Responsabilités

- appeler le provider
- normaliser les données
- préparer la réponse API

## 10. rules.py

### Rôle

Règles métier pures.

### Exemples

- `normalize_symbol(symbol)`
- `validate_timeframe(timeframe)`
- `map_provider_asset_to_internal_format()`
- `map_provider_candle_to_internal_format()`

## 11. Routes API

Base :

```
/api/v1/assets/
```

### Endpoints MVP

#### GET /assets

Liste des actifs

#### GET /assets/{symbol}

Détail d’un actif

#### GET /assets/{symbol}/candles

Données de bougies

## 12. Flux logique (candles)

```text
Request
   ↓
Route API
   ↓
Service
   ↓
Validation rules
   ↓
Provider (CoinGecko)
   ↓
Mapping / normalisation
   ↓
Response
```

## 13. Périmètre MVP

### Inclus

- crypto uniquement
- un seul provider
- liste actifs
- détail actif
- candles

### Exclu

- multi-provider
- données temps réel (websocket)
- stockage massif
- indicateurs techniques avancés

## 14. Interactions

Le module `market_data` est utilisé par :

- charting
- simulation
- dashboard

## 15. Données attendues par le frontend

### Markets

- symbole
- prix
- variation

### Asset Detail

- détail actif
- candles

### Dashboard

- aperçu marché

## 16. À éviter

- appeler CoinGecko dans les routes
- retourner les données brutes du provider
- mélanger avec simulation
- stocker trop de données au MVP

## 17. Résultat attendu

Le module doit permettre :

- afficher Markets
- afficher un actif
- charger un graphique

## 18. Résumé

> Le module `market_data` fournit une couche propre et abstraite pour accéder aux données de marché, indépendante des providers externes et adaptée aux besoins du frontend Quantara.
