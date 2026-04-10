# Module 5 — Progress

## 1. Rôle du module

Le module `progress` est responsable du suivi de l’évolution de l’utilisateur dans Quantara.

Il permet de mesurer l’apprentissage et de relier l’utilisateur au contenu pédagogique.

> `education` fournit le contenu  
> `progress` mesure l’apprentissage

## 2. Responsabilités

Le module `progress` doit gérer :

### A. Complétion des leçons

- marquer une leçon comme complétée
- enregistrer la date

### B. Progression des cours

- calculer le pourcentage de progression
- déterminer si un cours est terminé

### C. Statistiques simples

- nombre de leçons complétées
- nombre de cours complétés
- progression globale

### D. Agrégation

- fournir des données pour le dashboard

## 3. Ce que le module ne doit pas faire

Le module ne doit pas :

- gérer le contenu des cours (→ education)
- gérer les utilisateurs (→ identity)
- gérer la simulation
- gérer les données marché

## 4. Structure du module

```text
app/modules/progress/
├── models.py
├── schemas.py
├── repository.py
├── service.py
└── rules.py
```

## 5. models.py

### LessonProgress

- id
- user_id
- lesson_id
- completed
- completed_at

### CourseProgress (optionnel)

#### Recommandation MVP

Ne pas stocker CourseProgress
→ le calculer dynamiquement

## 6. schemas.py

### LessonProgressResponse

```json id="cuy9lc"
{
  "lesson_id": "int",
  "completed": "boolean",
  "completed_at": "datetime"
}
```

### CourseProgressResponse

```json id="d7cy9f"
{
  "course_id": "int",
  "progress_percent": "float",
  "completed": "boolean"
}
```

### GlobalProgressResponse

```json id="iv7dcz"
{
  "total_lessons_completed": "int",
  "total_courses_completed": "int",
  "overall_progress": "float"
}
```

## 7. repository.py

### Fonctions principales

- get_lesson_progress(user_id, lesson_id)
- mark_lesson_completed(user_id, lesson_id)
- list_completed_lessons(user_id)
- count_completed_lessons(user_id)

### Important

Le repository :

- ne contient pas de logique métier
- gère uniquement l’accès aux données

## 8. service.py

### Rôle

Logique métier du module

### Fonctions principales

#### mark_lesson_completed(user_id, lesson_id)

- vérifier si déjà complété
- créer ou mettre à jour
- enregistrer la date

#### get_course_progress(user_id, course_id)

- récupérer les leçons (education)
- récupérer les complétions
- calculer le pourcentage

#### get_global_progress(user_id)

- total lessons
- total courses
- progression globale

## 9. rules.py

### Fonctions principales

- calculate_progress_percentage(completed, total)
- is_course_completed(progress_percent)
- calculate_overall_progress()

## 10. Routes API

### Base

```id="8pjf0z"
/api/v1/progress/
```

### Endpoints

#### GET /progress

Progression globale

#### GET /progress/courses/{course_id}

Progression d’un cours

#### POST /lessons/{lesson_id}/complete

Marquer une leçon comme complétée

## 11. Flux logique

### Complétion leçon

```text id="v0ik3z"
Request
   ↓
Route API
   ↓
Service mark_lesson_completed
   ↓
Repository
   ↓
Response
```

## 12. Périmètre MVP

### Inclus

- complétion leçon
- progression cours
- stats simples

### Exclu

- IA
- recommandations
- gamification
- badges

## 13. Interactions

Le module interagit avec :

- education
- identity
- dashboard

## 14. Données attendues frontend

### Progress page

- progression globale
- progression par cours

### Dashboard

- résumé progression

## 15. À éviter

- logique de contenu ici
- calcul dans les routes
- duplication des données

## 16. Résultat attendu

Le module doit permettre :

- suivre progression utilisateur
- afficher statistiques
- relier apprentissage et utilisateur

## 17. Résumé

> Le module `progress` mesure et suit l’évolution de l’utilisateur dans son apprentissage au sein de Quantara.
