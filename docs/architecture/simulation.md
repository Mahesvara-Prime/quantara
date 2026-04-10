# Module 3 — Simulation

## 1. Rôle du module

Le module `simulation` est le cœur fonctionnel de Quantara.

Il est responsable de la logique de trading simulé et permet à l’utilisateur de tester ses décisions dans un environnement virtuel.

> Ce module transforme l’analyse en action.

## 2. Responsabilités

Le module `simulation` doit gérer :

### A. Exécution des trades

- buy
- sell
- uniquement des market orders au MVP

### B. Gestion du portefeuille

- cash balance
- mise à jour après chaque trade

### C. Gestion des positions

- création
- mise à jour
- fermeture plus tard

### D. Historique des trades

- enregistrement des opérations
- traçabilité

### E. Calcul du P&L

- profit/loss simple
- calcul basé sur prix et quantité

## 3. Ce que le module ne doit pas faire

Le module ne doit pas :

- appeler directement les providers marché
- gérer les utilisateurs
- gérer les cours ou la progression
- simuler un marché réel complexe
- exécuter de vrais ordres

## 4. Structure du module

```text
app/modules/simulation/
├── models.py
├── schemas.py
├── repository.py
├── service.py
└── rules.py
```

## 5. models.py

### Entités principales

#### Portfolio

- id
- user_id
- cash_balance
- created_at
- updated_at

#### Position

- id
- portfolio_id
- symbol
- quantity
- average_entry_price
- status
- created_at
- updated_at

#### Trade

- id
- portfolio_id
- symbol
- side
- amount
- quantity
- price
- created_at

## 6. schemas.py

### CreateTradeRequest

```json
{
  "symbol": "string",
  "side": "buy | sell",
  "amount": "float"
}
```

### TradeResponse

```json
{
  "id": "int",
  "symbol": "string",
  "side": "string",
  "amount": "float",
  "quantity": "float",
  "price": "float",
  "created_at": "datetime"
}
```

### PortfolioResponse

```json
{
  "cash_balance": "float",
  "total_value": "float",
  "total_pnl": "float"
}
```

### PositionResponse

```json
{
  "symbol": "string",
  "quantity": "float",
  "average_entry_price": "float",
  "current_price": "float",
  "pnl": "float"
}
```

## 7. repository.py

### Fonctions principales

#### Portfolio

- get_portfolio_by_user_id()
- create_portfolio_for_user()
- update_portfolio_balance()

#### Positions

- get_open_position_by_symbol()
- list_open_positions()
- create_position()
- update_position()

#### Trades

- create_trade()
- list_trades_by_portfolio()

### Important

Le repository :

- ne contient pas de logique métier
- ne fait que lire/écrire en base

## 8. service.py

### Rôle

Cœur métier du module.

### Fonctions principales

#### execute_trade()

- récupère le portefeuille
- récupère le prix via market_data
- valide le trade
- calcule la quantité
- met à jour le portefeuille
- met à jour la position
- enregistre le trade

#### get_portfolio_summary()

- retourne balance + pnl

#### get_open_positions()

- retourne les positions

#### get_trade_history()

- retourne l’historique

## 9. rules.py

### Fonctions principales

- calculate_units(amount, price)
- validate_trade_amount(amount)
- validate_cash_balance(balance, amount)
- compute_position_average_entry()
- compute_pnl()
- validate_trade_side(side)

## 10. Routes API

### Base

```
/api/v1/simulation/
```

### Endpoint principal

#### POST /simulation/trades

Exécute un trade simulé

## 11. Routes associées

### Portfolio

```
/api/v1/portfolio/
```

- GET /portfolio
- GET /portfolio/positions
- GET /portfolio/performance

### Trades

```
/api/v1/trades/
```

- GET /trades

## 12. Flux logique d’un trade

```text
Request
   ↓
Route API
   ↓
Service execute_trade
   ↓
Repository portfolio
   ↓
Market data (prix)
   ↓
Validation rules
   ↓
Update portfolio
   ↓
Update position
   ↓
Create trade
   ↓
Response
```

## 13. Périmètre MVP

### Inclus

- buy/sell simple
- market orders
- portefeuille
- positions
- historique
- P&L simple

### Exclu

- limit orders
- stop loss avancé
- moteur réaliste
- backtesting
- gestion de risque avancée

## 14. Interactions

Le module interagit avec :

- identity
- market_data
- progress (plus tard)

## 15. Données attendues par le frontend

### Simulation page

- exécution trade
- confirmation

### Portfolio page

- balance
- positions
- P&L

### Trade History

- liste des trades

## 16. À éviter

- logique métier dans les routes
- accès DB direct hors repository
- calculs dispersés
- complexité inutile

## 17. Résultat attendu

Le module doit permettre :

- exécuter un trade
- mettre à jour le portefeuille
- afficher les positions
- afficher l’historique

## 18. Résumé

> Le module `simulation` est le moteur métier central de Quantara, transformant les décisions utilisateur en opérations simulées cohérentes et persistées.
