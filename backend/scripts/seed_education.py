"""
Insert demo courses and lessons if they are not already present (idempotent by title / order).

Run from `backend`:

    python -m scripts.seed_education

Requires PostgreSQL and existing `courses` / `lessons` tables (Alembic upgrade).
"""

from __future__ import annotations

import sys
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal

# Register all ORM relationships (same order idea as app.main / Alembic env).
from app.modules.identity import models as _identity_models  # noqa: F401
from app.modules.education import models as _education_models  # noqa: F401
from app.modules.progress import models as _progress_models  # noqa: F401
from app.modules.simulation import models as _simulation_models  # noqa: F401

from app.modules.education.models import Course, Lesson


def _ensure_course(
    session: Session,
    *,
    title: str,
    description: str,
    level: str,
) -> Course:
    existing = session.scalar(select(Course).where(Course.title == title))
    if existing:
        return existing
    c = Course(title=title, description=description, level=level)
    session.add(c)
    session.flush()
    return c


def _ensure_lesson(
    session: Session,
    *,
    course_id: int,
    title: str,
    content: str,
    order_index: int,
) -> None:
    existing = session.scalar(
        select(Lesson).where(Lesson.course_id == course_id, Lesson.order_index == order_index)
    )
    if existing:
        return
    session.add(
        Lesson(
            course_id=course_id,
            title=title,
            content=content,
            order_index=order_index,
        )
    )


def seed_education(session: Session) -> None:
    # --- Course 1 ---
    c1 = _ensure_course(
        session,
        title="Introduction à la finance et aux cryptomonnaies",
        description=(
            "Comprendre les notions essentielles : actifs, risque, volatilité, "
            "et pourquoi les marchés crypto diffèrent des marchés traditionnels."
        ),
        level="beginner",
    )
    lessons_c1 = [
        (
            "Qu’est-ce qu’un actif numérique ?",
            (
                "Un actif numérique représente une valeur sur un registre distribué. "
                "Les cryptomonnaies sont échangées 24h/24 ; la liquidité et la volatilité "
                "sont généralement plus élevées que sur les actions classiques.\n\n"
                "Objectifs : distinguer token, blockchain et plateforme d’échange."
            ),
        ),
        (
            "Risque et rendement",
            (
                "Le rendement attendu est lié au risque assumé. Sur les crypto, "
                "les mouvements de prix peuvent être amplifiés par l’effet de levier "
                "et le sentiment du marché.\n\n"
                "À retenir : ne risquer que ce que vous pouvez vous permettre de perdre."
            ),
        ),
        (
            "Ordres au marché (rappel)",
            (
                "Un ordre au marché s’exécute au meilleur prix disponible immédiatement. "
                "Dans Quantara, la simulation utilise des ordres au marché pour simplifier "
                "l’apprentissage.\n\n"
                "Comparez toujours le prix d’exécution avec le carnet (order book) sur un vrai courtier."
            ),
        ),
        (
            "Construire une routine",
            (
                "Avant d’ouvrir une position : définir un scénario (entrée, taille, sortie). "
                "Tenez un journal de trades, même en simulation, pour identifier vos biais comportementaux."
            ),
        ),
    ]
    for order_index, (title, body) in enumerate(lessons_c1):
        _ensure_lesson(session, course_id=c1.id, title=title, content=body, order_index=order_index)

    # --- Course 2 ---
    c2 = _ensure_course(
        session,
        title="Lecture de graphiques et timeframes",
        description=(
            "Lire une courbe OHLC, choisir un timeframe pertinent et éviter le bruit à court terme."
        ),
        level="intermediate",
    )
    lessons_c2 = [
        (
            "Bougies OHLC",
            (
                "Chaque bougie résume open, high, low, close sur une période. "
                "Les graphiques de Quantara s’appuient sur des données agrégées (ex. CoinGecko)."
            ),
        ),
        (
            "Choisir un timeframe",
            (
                "Un horizon court (1h) montre plus de détail mais plus de bruit ; "
                "un horizon plus long (1d) met en avant la tendance. Adaptez le timeframe à votre plan."
            ),
        ),
        (
            "Pièges fréquents",
            (
                "Sur-réagir aux micro-mouvements, ignorer les frais, ou sur-trader après une série de pertes. "
                "Prenez du recul : la cohérence bat la fréquence."
            ),
        ),
    ]
    for order_index, (title, body) in enumerate(lessons_c2):
        _ensure_lesson(session, course_id=c2.id, title=title, content=body, order_index=order_index)

    # --- Course 3 ---
    c3 = _ensure_course(
        session,
        title="Psychologie et gestion du capital",
        description=(
            "Gestion de la taille de position, discipline, et lien entre apprentissage théorique et pratique simulée."
        ),
        level="advanced",
    )
    lessons_c3 = [
        (
            "Taille de position",
            (
                "La taille relative au capital détermine l’impact d’un mouvement défavorable. "
                "En simulation, testez plusieurs tailles pour voir l’effet sur le drawdown du portefeuille."
            ),
        ),
        (
            "Passer de la théorie à la pratique",
            (
                "Complétez les leçons puis exécutez de petits trades simulés pour ancrer les concepts. "
                "Quantara relie la progression pédagogique à l’activité sur le portefeuille papier."
            ),
        ),
    ]
    for order_index, (title, body) in enumerate(lessons_c3):
        _ensure_lesson(session, course_id=c3.id, title=title, content=body, order_index=order_index)

    session.commit()
    print(
        f"Education seed OK (courses: {c1.id}, {c2.id}, {c3.id}; "
        f"lessons ensured by title/order where missing)."
    )


def main() -> None:
    db = SessionLocal()
    try:
        seed_education(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
