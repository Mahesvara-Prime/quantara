"""Corpus pédagogique : Markdown + validation (≥ 10 000 mots par leçon) + cours issus de PDF (manifeste)."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from .lesson_expansions_fr import ensure_min_words_french
from .parse import load_course_file, word_count_french

MIN_WORDS_PER_LESSON = 10_000


@dataclass(frozen=True)
class CourseSpec:
    title: str
    description: str
    level: str
    markdown_file: str
    allow_padding: bool = True


STATIC_COURSES: list[CourseSpec] = [
    # Beginner
    CourseSpec(
        title="Introduction à la finance et aux cryptomonnaies",
        description=(
            "Parcours complet pour poser les bases : actifs, risque, ordres, sécurité, garde des fonds, "
            "puis intégration avec la simulation Quantara."
        ),
        level="beginner",
        markdown_file="fr_course_01.md",
        allow_padding=True,
    ),
    CourseSpec(
        title="Réglementation, fiscalité et cadre personnel (notions)",
        description=(
            "Repères généraux pour orienter tes recherches vers des professionnels compétents selon ta "
            "juridiction — aucun conseil juridique ou fiscal dans ce module."
        ),
        level="beginner",
        markdown_file="fr_course_11.md",
        allow_padding=True,
    ),
    # Intermediate
    CourseSpec(
        title="Lecture de graphiques et timeframes",
        description=(
            "OHLC, volumes, multi-timeframes, patterns de bruit, fausses cassures et méthode de lecture "
            "structurée alignée sur les graphiques de l’application."
        ),
        level="intermediate",
        markdown_file="fr_course_02.md",
        allow_padding=True,
    ),
    CourseSpec(
        title="Analyse technique : tendance, supports et SMA",
        description=(
            "Structure, SMA, EMA, RSI, supports, Bollinger, confluence et pièges d’indicateurs ; "
            "aligné sur les outils du graphique Quantara."
        ),
        level="intermediate",
        markdown_file="fr_course_04.md",
        allow_padding=True,
    ),
    CourseSpec(
        title="Information, narratifs et réseaux sociaux",
        description=(
            "Lire l’information de marché sans se faire piéger : sources, biais, influenceurs, "
            "rumeurs et méthode de vérification."
        ),
        level="intermediate",
        markdown_file="fr_course_06.md",
        allow_padding=True,
    ),
    CourseSpec(
        title="Données, qualité et biais de mesure sur les marchés",
        description=(
            "Sources de données, délais, révisions, survivorship et prudence lorsque l’on interprète "
            "des séries historiques."
        ),
        level="intermediate",
        markdown_file="fr_course_10.md",
        allow_padding=True,
    ),
    CourseSpec(
        title="Cartographie des actifs et lecture des carnets (notions)",
        description=(
            "Profondeur, impact prix, paires et sensibilité aux chocs — pour compléter la lecture graphique."
        ),
        level="intermediate",
        markdown_file="fr_course_14.md",
        allow_padding=True,
    ),
    # Advanced
    CourseSpec(
        title="Psychologie et gestion du capital",
        description=(
            "Taille de position, drawdown, routines, revenge trading, ego, attentes — pour trader "
            "avec un capital et un moral préservés."
        ),
        level="advanced",
        markdown_file="fr_course_03.md",
        allow_padding=True,
    ),
    CourseSpec(
        title="Macro, événements et gestion du risque opérationnel",
        description=(
            "Calendrier macro, liquidité, scénarios, R/R, exposition, passage sim → réel et check-lists "
            "d’exécution."
        ),
        level="advanced",
        markdown_file="fr_course_05.md",
        allow_padding=True,
    ),
    CourseSpec(
        title="Journal, métriques et amélioration continue",
        description=(
            "Construire un journal exploitable, choisir quelques métriques simples, revues hebdo/mensuelles "
            "et cycles d’apprentissage."
        ),
        level="advanced",
        markdown_file="fr_course_07.md",
        allow_padding=True,
    ),
    CourseSpec(
        title="Stablecoins, chaînes et risques d’écosystème",
        description=(
            "Stablecoins et peg, bridges, Layer 1 et 2 en résumé pédagogique, risques de smart contract "
            "et garde — sans remplacer un conseil juridique."
        ),
        level="advanced",
        markdown_file="fr_course_08.md",
        allow_padding=True,
    ),
    CourseSpec(
        title="Portefeuille, corrélation et scénarios de stress",
        description=(
            "Agrégation des risques, scénarios de choc, corrélation BTC–alts et lecture de portefeuille "
            "dans un cadre pédagogique."
        ),
        level="advanced",
        markdown_file="fr_course_09.md",
        allow_padding=True,
    ),
    CourseSpec(
        title="Recherche opérationnelle : carnet d’hypothèses et tests",
        description=(
            "Formuler des hypothèses testables, planifier des expériences de trading simulé et éviter "
            "le biais de confirmation."
        ),
        level="advanced",
        markdown_file="fr_course_12.md",
        allow_padding=True,
    ),
    CourseSpec(
        title="Liquidations, levier et mécanique du risque (culture)",
        description=(
            "Comprendre mécaniquement ce que le levier change, sans encourager son usage en début de parcours."
        ),
        level="advanced",
        markdown_file="fr_course_13.md",
        allow_padding=True,
    ),
    CourseSpec(
        title="Synthèse parcours Quantara et feuille de route personnelle",
        description=(
            "Intégrer les modules précédents, définir une feuille de route d’apprentissage sur plusieurs mois "
            "et critères de maturité avant capital réel."
        ),
        level="advanced",
        markdown_file="fr_course_15.md",
        allow_padding=True,
    ),
]


def _load_pdf_manifest() -> list[CourseSpec]:
    p = Path(__file__).resolve().parent / "markdown" / "imported_manifest.json"
    if not p.exists():
        return []
    data = json.loads(p.read_text(encoding="utf-8"))
    out: list[CourseSpec] = []
    for row in data.get("courses", []):
        out.append(
            CourseSpec(
                title=str(row["title"]),
                description=str(row["description"]),
                level=str(row.get("level", "intermediate")),
                markdown_file=str(row["markdown_file"]),
                allow_padding=bool(row.get("allow_padding", False)),
            )
        )
    return out


def course_order() -> list[CourseSpec]:
    return list(STATIC_COURSES) + _load_pdf_manifest()


def load_all_lessons_validated() -> list[tuple[CourseSpec, list[tuple[str, str]]]]:
    """Retourne (spec, [(title, content), …]) avec contrôle du nombre de mots."""
    out: list[tuple[CourseSpec, list[tuple[str, str]]]] = []
    for spec in course_order():
        lessons = load_course_file(spec.markdown_file)
        fixed: list[tuple[str, str]] = []
        for title, content in lessons:
            body = content
            if spec.allow_padding:
                body = ensure_min_words_french(body, MIN_WORDS_PER_LESSON)
            n = word_count_french(body)
            if n < MIN_WORDS_PER_LESSON:
                raise ValueError(
                    f"Leçon «{title}» ({spec.markdown_file}) : {n} mots — minimum {MIN_WORDS_PER_LESSON}. "
                    f"Pour les PDF, relance l’import ou fusionne des parties ; padding désactivé (allow_padding=False)."
                )
            fixed.append((title, body))
        out.append((spec, fixed))
    return out
