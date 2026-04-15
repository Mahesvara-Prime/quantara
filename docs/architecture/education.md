# Module 4 — Education

## 1. Rôle du module

Le module `education` est responsable de la gestion du contenu pédagogique de Quantara.

Il permet de structurer l’apprentissage à travers :

- des cours
- des leçons
- une organisation logique du contenu

> Ce module apporte la dimension éducative de la plateforme.

## 2. Responsabilités

Le module `education` doit gérer :

### A. Catalogue de cours

- liste des cours disponibles
- informations générales (titre, niveau)

### B. Détail d’un cours

- description
- niveau
- liste des leçons

### C. Leçons

- contenu individuel
- ordre pédagogique

### D. Organisation

- structure logique du parcours

## 3. Ce que le module ne doit pas faire

Le module ne doit pas :

- gérer la progression (→ module `progress`)
- gérer les utilisateurs
- gérer la simulation
- gérer les données marché
- gérer les analytics avancées

> `education` fournit le contenu  
> `progress` suit l’utilisateur

## 4. Structure du module

```text
app/modules/education/
├── models.py
├── schemas.py
├── repository.py
├── service.py
└── rules.py
```

## 5. models.py

### Entités principales

#### Course

- id
- title
- description
- level (beginner, intermediate, advanced)
- created_at

#### Lesson

- id
- course_id
- title
- content
- order_index
- created_at

### Relation

- 1 Course → N Lessons

## 6. schemas.py

### CourseListItemResponse

```json
{
  "id": "int",
  "title": "string",
  "level": "string"
}
```

### CourseDetailResponse

```json
{
  "id": "int",
  "title": "string",
  "description": "string",
  "level": "string",
  "lessons": []
}
```

### LessonResponse

```json
{
  "id": "int",
  "course_id": "int",
  "title": "string",
  "content": "string",
  "order_index": "int"
}
```

## 7. repository.py

### Fonctions principales

- list_courses()
- get_course_by_id(course_id)
- list_lessons_by_course(course_id)
- get_lesson_by_id(lesson_id)

### Important

Le repository :

- ne contient pas de logique métier
- gère uniquement l’accès aux données

## 8. service.py

### Rôle

Orchestration du contenu pédagogique

### Fonctions principales

#### list_courses()

Retourne la liste des cours

#### get_course_detail(course_id)

- récupère le cours
- récupère les leçons
- assemble la réponse

#### get_lesson(lesson_id)

Retourne le contenu d’une leçon

## 9. rules.py

### Rôle

Règles pédagogiques simples

### Exemples

- validate_course_exists()
- validate_lesson_order()

## 10. Routes API

### Base

```
/api/v1/courses/
```

#### GET /courses

Liste des cours

#### GET /courses/{course_id}

Détail d’un cours

### Lessons

```
/api/v1/lessons/
```

#### GET /lessons/{lesson_id}

Détail d’une leçon

## 11. Flux logique

### Exemple : course detail

```text
GET /courses/{id}
   ↓
Route API
   ↓
Service get_course_detail
   ↓
Repository get_course
   ↓
Repository get_lessons
   ↓
Response
```

## 12. Périmètre MVP

### Inclus

- liste des cours
- détail d’un cours
- liste des leçons
- contenu des leçons

### Pédagogie cible (contenu seed)

Le script `backend/scripts/seed_education.py` enrichit le catalogue de façon **idempotente** (titres + `order_index` uniques par cours) :

- **Quinze parcours** statiques (`fr_course_01.md` … `fr_course_15.md`) + **cours additionnels issus de PDF** listés dans `markdown/imported_manifest.json` après import.
- **Seuil de longueur** : chaque leçon doit compter **au moins 10 000 mots** au moment du seed. Les fichiers Markdown courts sont **complétés automatiquement** (banque de paragraphes pédagogiques) sauf les cours PDF (`allow_padding: false` dans le manifeste) où le texte doit déjà atteindre le seuil.
- **PDF** : déposer les `.pdf` dans `backend/scripts/education_corpus/source_pdfs/`, puis `python -m scripts.education_corpus.import_pdfs` (voir `source_pdfs/README.md`). Relancer ensuite `python -m scripts.seed_education`.
- **Regénérer** les cours `fr_course_02` … `fr_course_15` à partir des titres modulaires : `python scripts/education_corpus/build_markdown_courses.py`.
- Le corps des leçons est au format **Markdown** ; le frontend le rend sans afficher la syntaxe brute.
- **`_upsert_lesson`** : ré-exécuter le seed **met à jour** titre + contenu. Les leçons dont l’`order_index` dépasse le nouveau catalogue sont supprimées avec leur `lesson_progress` associé.

Relancer après déploiement ou changement éditorial :

```bash
cd backend && python -m scripts.seed_education
```

### Exclu

- quiz notés automatiquement
- certification
- parcours adaptatif
- CMS admin
- contenu dynamique avancé

## 13. Interactions

Le module interagit avec :

- progress (suivi utilisateur)
- identity (utilisateur courant)

## 14. Données attendues par le frontend

### Learn page

- liste des cours

### Course page

- détail + leçons

### Lesson page

- contenu Markdown rendu (titres, paragraphes, listes)
- complétion `POST …/complete` et annulation `DELETE …/complete`

## 15. À éviter

- logique de progression ici
- mélange avec simulation
- complexité inutile
- gestion utilisateur directe

## 16. Résultat attendu

Le module doit permettre :

- afficher les cours
- naviguer dans les leçons
- lire du contenu pédagogique structuré

## 17. Résumé

> Le module `education` fournit le contenu pédagogique structuré permettant à l’utilisateur d’apprendre dans Quantara.
