# Quantara — Database Guide

## 1. Objectif du document

Ce document définit la structure de la base de données du backend Quantara.

Il sert de référence pour :

- la modélisation SQLAlchemy
- la création des migrations (Alembic)
- la compréhension des relations entre entités
- guider Cursor lors de l’implémentation

Ce document décrit **ce qui est stocké**, pas comment le code est écrit.

## 2. Philosophie de la base de données

La base de données Quantara doit être :

- simple (MVP)
- cohérente avec les modules backend
- normalisée
- extensible

### 2.1 Ce que l’on stocke

- utilisateurs
- portefeuille
- positions
- trades
- cours
- leçons
- progression utilisateur

### 2.2 Ce que l’on ne stocke pas au MVP

- données marché complètes
- candles historiques volumineuses
- indicateurs techniques
- insights persistés

Ces données sont calculées ou récupérées à la volée.

## 3. Tables du MVP

La base MVP contient les tables suivantes :

```text
users
portfolios
positions
trades
courses
lessons
lesson_progress
```

## 4. Table `users`

### Rôle

Stocker les utilisateurs

### Champs

- id (PK)
- first_name
- last_name
- email (unique)
- hashed_password
- is_active
- created_at
- updated_at

### Contraintes

- email unique
- mot de passe hashé obligatoire

## 5. Table `portfolios`

### Rôle

Représenter le portefeuille d’un utilisateur

### Champs

- id (PK)
- user_id (FK → users.id)
- cash_balance
- created_at
- updated_at

### Relation

- 1 user → 1 portfolio (MVP)

## 6. Table `positions`

### Rôle

Représenter les positions ouvertes ou fermées

### Champs

- id (PK)
- portfolio_id (FK → portfolios.id)
- symbol
- quantity
- average_entry_price
- status (open | closed)
- created_at
- updated_at

### Index

- portfolio_id
- symbol

## 7. Table `trades`

### Rôle

Historique des trades simulés

### Champs

- id (PK)
- portfolio_id (FK → portfolios.id)
- symbol
- side (buy | sell)
- amount
- quantity
- price
- stop_loss (nullable)
- take_profit (nullable)
- created_at

### Index

- portfolio_id
- created_at

## 8. Table `courses`

### Rôle

Stocker les cours

### Champs

- id (PK)
- title
- description
- level
- created_at

## 9. Table `lessons`

### Rôle

Stocker les leçons

### Champs

- id (PK)
- course_id (FK → courses.id)
- title
- content
- order_index
- created_at

### Index

- course_id
- order_index

## 10. Table `lesson_progress`

### Rôle

Suivi des leçons complétées

### Champs

- id (PK)
- user_id (FK → users.id)
- lesson_id (FK → lessons.id)
- completed (boolean)
- completed_at

### Contraintes

- unique(user_id, lesson_id)

### Index

- user_id
- lesson_id

## 11. Relations globales

```text
users
 ├── portfolios
 │     ├── positions
 │     └── trades
 │
 └── lesson_progress

courses
 └── lessons
        └── lesson_progress
```

## 12. Règles de conception

### 12.1 Simplicité MVP

- un seul portefeuille par utilisateur
- pas de duplication de données
- pas de tables inutiles

### 12.2 Calcul dynamique

Certaines données sont calculées :

- progression des cours
- P&L
- insights

### 12.3 Pas de stockage marché lourd

Les données marché sont récupérées via provider.

## 13. Tables non nécessaires au MVP

Ne pas créer immédiatement :

- course_progress
- market_snapshots
- insights_table
- settings_table

## 14. Timestamps

Tables avec timestamps :

- users → created_at, updated_at
- portfolios → created_at, updated_at
- positions → created_at, updated_at
- trades → created_at
- courses → created_at
- lessons → created_at
- lesson_progress → completed_at

## 15. Contraintes importantes

### users

- email unique

### lesson_progress

- (user_id, lesson_id) unique

### positions

- status contrôlé (open / closed)

## 16. Résultat attendu

La base doit permettre :

- authentification utilisateur
- simulation trading complète
- gestion du portefeuille
- contenu éducatif structuré
- suivi de progression

## 17. Résumé

> La base de données Quantara MVP est une structure relationnelle simple et cohérente, centrée sur l’utilisateur, la simulation et l’apprentissage, sans stockage inutile de données externes.
