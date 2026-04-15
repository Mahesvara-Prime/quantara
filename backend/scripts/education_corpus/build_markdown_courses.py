"""Regenerate fr_course_02.md … fr_course_08.md from lesson_expansions_fr.compose_lesson."""
from __future__ import annotations

import sys
from pathlib import Path

_BACKEND = Path(__file__).resolve().parents[2]
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

from scripts.education_corpus.lesson_expansions_fr import compose_lesson

MD = Path(__file__).resolve().parent / "markdown"

COURSES: list[tuple[str, list[str]]] = [
    (
        "fr_course_02.md",
        [
            "Bougies OHLC : corps, mèches et lecture des séquences",
            "Hiérarchie des timeframes : du long au court sans s’y perdre",
            "Bruit de marché, sur-trading et coûts cognitifs",
            "Volume agrégé : engagement, limites et confluence",
            "Fausses cassures, pièges à liquidité et patience de confirmation",
            "Patterns classiques : langage utile, promesses dangereuses",
            "Graphiques Quantara : agrégation, latence et objectifs pédagogiques",
            "Synthèse du module : protocole de lecture hebdomadaire structuré",
        ],
    ),
    (
        "fr_course_03.md",
        [
            "Taille de position, P&L unitaire et drawdown du portefeuille",
            "Savoir déclaratif vs savoir procédural : relier cours et simulation",
            "Synthèse discipline : journal minimal et plafonds de risque",
            "Revenge trading : mécanisme, coût et règle d’arrêt de séance",
            "Ego, attribution des résultats et biais de récence",
            "Attentes réalistes : courbe d’apprentissage non linéaire",
            "Sommeil, stress et qualité des décisions sous pression",
            "Synthèse psychologie : contrat de séance avant d’ouvrir l’écran",
            "Cartographie des émotions et de l’exécution : ce que le journal doit capturer",
        ],
    ),
    (
        "fr_course_04.md",
        [
            "Tendance et structure : sommets, creux et phases de range",
            "SMA comme filtre de contexte : retards, usages et limites",
            "EMA plus réactive : avantages, bruit supplémentaire et prudence",
            "RSI : zones conventionnelles, tendance forte et divergences",
            "Supports et résistances en bandes : tests, polarité et invalidation",
            "Bandes de Bollinger : expansion, contraction et lectures de volatilité",
            "Confluence d’indicateurs : éviter la redondance visuelle",
            "Erreurs fréquentes : sur-optimisation graphique et incohérence de plan",
            "Synthèse analyse technique : grille de décision avant tout ordre",
            "Chandeliers japonais : lecture contextuelle et confirmations",
        ],
    ),
    (
        "fr_course_05.md",
        [
            "Macro et crypto : canaux de transmission et sentiment global",
            "Annonces majeures : volatilité, spreads et choix d’abstention",
            "Liquidité profonde vs fine : impact sur la taille et le slippage",
            "Scénarios de trading : hypothèse, invalidation et objectifs partiels",
            "Ratio risque-récompense et confusion avec la probabilité",
            "Exposition agrégée : corrélations cachées dans le portefeuille",
            "Simulation vs réel : écarts psychologiques et garde-fous écrits",
            "Synthèse macro-risque : liste de contrôle avant engagement de capital",
        ],
    ),
    (
        "fr_course_06.md",
        [
            "Sources primaires, secondaires et culture de la vérification",
            "Réseaux sociaux : FOMO, preuve sociale et pauses imposées",
            "Influenceurs, conflits d’intérêts et lecture critique des incitations",
            "Rumeurs, listings et volatilité narrative : patience informationnelle",
            "Annonces de protocole : distinction entre technologie et prix spot",
            "Synthèse information : protocole personnel de suivi de l’actualité",
        ],
    ),
    (
        "fr_course_07.md",
        [
            "Journal structuré : champs utiles, tags et revue hebdomadaire",
            "Métriques de processus : respecter le plan avant d’analyser le taux de réussite",
            "Espérance vs fréquence de gains : ne pas confondre les indicateurs",
            "Taille d’échantillon : prudence statistique et changements contrôlés",
            "Revue mensuelle : une seule amélioration ciblée par cycle",
            "Synthèse amélioration continue : boucle planifier-exécuter-revoir",
        ],
    ),
    (
        "fr_course_08.md",
        [
            "Stablecoins : peg, confiance et risques de dépeg",
            "Bridges et transferts inter-chaînes : lenteur utile et vérifications",
            "Layer 1 et Layer 2 : schéma simple pour comprendre les compromis",
            "Smart contracts et autorisations de wallet : surface d’attaque",
            "DeFi en surface : rendements, incitations et risque de contrepartie",
            "Synthèse écosystème : progression prudente et conseils professionnels",
            "Bitcoin côté trader : règlement, frais réseau et garde d’actifs",
        ],
    ),
]

COURSES_EXTRA: list[tuple[str, list[str]]] = [
    (
        "fr_course_09.md",
        [
            "Agrégation du risque sur portefeuille multi-actifs",
            "Corrélations empiriques et scénarios de stress",
            "Sensibilité aux chocs macro et à la liquidité",
            "Diversification réelle vs apparente",
            "Synthèse : tableau de bord hebdomadaire du risque",
        ],
    ),
    (
        "fr_course_10.md",
        [
            "Qualité des données et délais de publication",
            "Biais de survivance et d’historique raccourci",
            "Révisions de séries et impact sur les tests historiques",
            "Comparer des sources sans se perdre",
            "Synthèse : protocole de vérification des chiffres",
        ],
    ),
    (
        "fr_course_11.md",
        [
            "Pourquoi la fiscalité dépend de ta situation personnelle",
            "KYC, AML et obligations courantes : notions essentielles",
            "Où chercher l’information officielle",
            "Erreurs fréquentes de débutants",
            "Synthèse : consulter un professionnel compétent",
        ],
    ),
    (
        "fr_course_12.md",
        [
            "Carnet d’hypothèses : formuler une thèse testable",
            "Plan d’expérience sur compte simulé",
            "Mesurer sans sur-interpréter",
            "Révision après N trades",
            "Synthèse : cycle d’amélioration itérative",
        ],
    ),
    (
        "fr_course_13.md",
        [
            "Levier : mécanique de marge et liquidations",
            "Pourquoi le levier amplifie les erreurs de processus",
            "Culture du risque sans glorifier l’exposition",
            "Alternatives : taille sans levier",
            "Synthèse : règles de prudence minimales",
        ],
    ),
    (
        "fr_course_14.md",
        [
            "Lecture grossière du carnet et de la profondeur",
            "Impact prix et taille d’ordre",
            "Paires et microstructure : vue d’ensemble",
            "Limites des agrégats publics",
            "Synthèse : relier carnet et graphique",
        ],
    ),
    (
        "fr_course_15.md",
        [
            "Bilan des compétences acquises dans Quantara",
            "Feuille de route sur trois à six mois",
            "Critères de maturité avant capital réel",
            "Ressources pour aller plus loin",
            "Synthèse : engagement de pratique régulière",
        ],
    ),
]

ALL_COURSES = COURSES + COURSES_EXTRA


def main() -> None:
    base = 0
    for filename, titles in ALL_COURSES:
        lessons: list[str] = []
        for j, title in enumerate(titles):
            lessons.append(compose_lesson(title, start=base + j * 3))
        (MD / filename).write_text("\n\n".join(lessons), encoding="utf-8")
        base += len(titles) * 3 + 1
    print("Wrote", len(ALL_COURSES), "markdown course files.")


if __name__ == "__main__":
    main()
