/**
 * Données mock pour la partie Learn (interface privée).
 *
 * Objectifs:
 * - permettre de modifier facilement les cours (titres, leçons, key points)
 * - permettre de modifier facilement la progression utilisateur (leçons complétées)
 *
 * Remplacement futur:
 * - le frontend pourra mapper ces structures depuis le backend.
 */

export type LearnLesson = {
  slug: string;
  title: string;
  explanation: string;
  keyPoints: string[];
};

export type LearnCourse = {
  slug: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  title: string;
  lessons: LearnLesson[];
};

export type LearnUserProgress = {
  completedLessonSlugsByCourse: Record<string, string[]>;
};

export const learnCoursesMock: LearnCourse[] = [
  {
    slug: "trading-basics",
    level: "Beginner",
    title: "Trading Basics",
    lessons: [
      {
        slug: "introduction",
        title: "Introduction",
        explanation:
          "Comprendre les bases du trading : marchés, ordres, notion de risque et cadre mental.",
        keyPoints: ["Pourquoi trader", "Risque vs récompense", "Objectifs réalistes"],
      },
      {
        slug: "market-structure",
        title: "Market Structure",
        explanation:
          "Lire la structure du marché : tendance, swings et niveaux clés pour orienter l'analyse.",
        keyPoints: ["Tendance & régimes", "Higher highs / lower lows", "Swing points"],
      },
      {
        slug: "support-resistance",
        title: "Support & Resistance",
        explanation:
          "Identifier zones de support/résistance et comprendre comment elles influencent le prix.",
        keyPoints: ["Zones vs niveaux", "Re-tests", "Confluence simple"],
      },
      {
        slug: "indicators",
        title: "Indicators",
        explanation:
          "Utiliser quelques indicateurs avec discipline : RSI, moyennes mobiles, et lecture du momentum.",
        keyPoints: ["RSI (momentum)", "MA (tendance)", "Éviter la sur-interprétation"],
      },
      {
        slug: "strategy-basics",
        title: "Strategy Basics",
        explanation:
          "Concevoir une stratégie simple : règles d'entrée/sortie et plan de gestion du risque.",
        keyPoints: ["Règles d'entrée", "Règles de sortie", "Gestion du risque"],
      },
      {
        slug: "risk-management",
        title: "Risk Management",
        explanation:
          "Définir le risque par trade et calibrer le size : survivabilité avant performance.",
        keyPoints: ["Risque fixe", "Stop loss logique", "Respect du plan"],
      },
      {
        slug: "journaling",
        title: "Trading Journaling",
        explanation:
          "Documenter vos trades pour apprendre : ce qui marche, ce qui échoue, et pourquoi.",
        keyPoints: ["Journal objectif", "Analyse post-trade", "Amélioration continue"],
      },
      {
        slug: "scenarios",
        title: "Common Scenarios",
        explanation:
          "Passer en revue des scénarios fréquents : range, breakout, pullback, et faux signaux.",
        keyPoints: ["Range trading", "Breakout & pullback", "Gestion des faux signaux"],
      },
      {
        slug: "execution",
        title: "Execution",
        explanation:
          "Améliorer l'exécution : timing, gestion des ordres et cohérence avec le plan.",
        keyPoints: ["Timing", "Ordres & limites", "Cohérence"],
      },
      {
        slug: "review",
        title: "Review",
        explanation:
          "Synthèse du parcours : check-list finale et plan de progression pour la suite.",
        keyPoints: ["Checklist", "Plan de progrès", "Prochaine étape"],
      },
    ],
  },
  {
    slug: "strategies",
    level: "Intermediate",
    title: "Strategies",
    lessons: Array.from({ length: 8 }).map((_, i) => {
      const n = i + 1;
      return {
        slug: `lesson-${n}`,
        title: `Lesson ${n}`,
        explanation:
          "Contenu intermédiaire (mock) : approche structurée et application à des cas pratiques.",
        keyPoints: ["Règles claires", "Contexte marché", "Exemples"],
      };
    }),
  },
  {
    slug: "risk-management-advanced",
    level: "Advanced",
    title: "Risk Mgmt",
    lessons: Array.from({ length: 12 }).map((_, i) => {
      const n = i + 1;
      return {
        slug: `lesson-${n}`,
        title: `Lesson ${n}`,
        explanation:
          "Contenu avancé (mock) : gestion du risque sous contraintes et adaptation au régime de marché.",
        keyPoints: ["Règles de risque", "Stress tests", "Adaptation"],
      };
    }),
  },
];

export const learnUserProgressMock: LearnUserProgress = {
  // Exemple: débutant à 20% done (2 leçons complétées sur 10).
  completedLessonSlugsByCourse: {
    "trading-basics": ["introduction", "market-structure"],
    strategies: [],
    "risk-management-advanced": [],
  },
};

