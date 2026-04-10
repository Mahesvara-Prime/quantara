# Module 6 — Charting

## 1. Rôle du module

Le module `charting` est responsable de la préparation et de l’enrichissement des données destinées aux graphiques.

Il transforme les données marché en format exploitable visuellement par le frontend.

> `market_data` fournit les données  
> `charting` les rend exploitables pour l’analyse

## 2. Responsabilités

Le module `charting` doit gérer :

### A. Préparation des candles

- structurer les données de bougies
- gérer les timeframes

### B. Normalisation

- adapter les données pour les librairies de graphiques

### C. Indicateurs techniques (optionnel)

- SMA
- EMA
- RSI (plus tard)

### D. Transformation

- simplification des données
- formatage

## 3. Ce que le module ne doit pas faire

Le module ne doit pas :

- appeler directement les providers externes
- gérer la simulation
- gérer le portefeuille
- gérer les utilisateurs
- dupliquer la logique de `market_data`

## 4. Structure du module

```text
app/modules/charting/
├── schemas.py
├── service.py
├── indicators.py
└── rules.py
```

## 5. schemas.py

### ChartCandleResponse

```json id="a8d2k1"
{
  "time": "int",
  "open": "float",
  "high": "float",
  "low": "float",
  "close": "float"
}
```

### ChartResponse

```json id="b3l9x7"
{
  "symbol": "string",
  "timeframe": "string",
  "candles": []
}
```

### IndicatorResponse (optionnel)

```json id="c5m4q2"
{
  "name": "string",
  "values": []
}
```

## 6. service.py

### Rôle

Orchestration des données du graphique

### Fonctions principales

#### get_chart_data(symbol, timeframe, limit)

- récupère les données via `market_data`
- applique les transformations
- retourne un format adapté au frontend

#### get_chart_with_indicators(symbol, timeframe)

(optionnel)

- récupère les candles
- calcule les indicateurs
- retourne un résultat enrichi

## 7. indicators.py

### Rôle

Calcul des indicateurs techniques

### Fonctions possibles

- calculate_sma(data, period)
- calculate_ema(data, period)
- calculate_rsi(data, period)

### MVP

- peut être vide ou minimal

## 8. rules.py

### Rôle

Transformation des données

### Fonctions principales

- map_candle_to_chart_format()
- validate_timeframe()
- format_timestamp()

## 9. Routes API

### Option 1 (simple MVP)

```text
/api/v1/assets/{symbol}/candles
```

### Option 2 (structure dédiée)

```text
/api/v1/charting/{symbol}
```

### Recommandation

MVP → utiliser `/assets/{symbol}/candles`
garder `charting` en interne

## 10. Flux logique

```text id="flow-charting"
Request
   ↓
Route API
   ↓
Charting service
   ↓
Market data service
   ↓
Transformation (rules)
   ↓
Indicators (optionnel)
   ↓
Response
```

## 11. Périmètre MVP

### Inclus

- affichage des candles
- gestion des timeframes simples
- format compatible graphique

### Exclu

- indicateurs avancés
- dessin utilisateur
- annotations
- temps réel (websocket)

## 12. Interactions

Le module interagit avec :

- market_data (source des données)
- simulation (utilisation indirecte des prix)

## 13. Données attendues frontend

### Chart page

- candles propres
- timestamps corrects
- données exploitables directement

## 14. À éviter

- appeler les providers ici
- dupliquer `market_data`
- complexité inutile
- logique dans les routes

## 15. Résultat attendu

Le module doit permettre :

- afficher un graphique fluide
- structurer les données correctement
- évoluer vers des indicateurs

## 16. Résumé

> Le module `charting` transforme les données marché en données exploitables pour l’analyse visuelle dans Quantara.
