import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import {
  learnCoursesMock,
  learnUserProgressMock,
  type LearnCourse,
} from "../learn/learn.mock";

/**
 * Rôle: page Learn (/learn) privée.
 * Objectif UX (guide): catalogue cours + progression + niveau, interface plus calme que trading.
 *
 * Wireframe: learn-visuel.md
 * - Search courses...
 * - Cartes cours (niveau, nb leçons, % done)
 */

export function LearnPage() {
  return <Learn />;
}

/**
 * Composant interne pour isoler la logique UI de la page Learn.
 */
function Learn() {
  const [query, setQuery] = React.useState("");

  /**
   * Rôle: calculer la progression utilisateur (en %).
   * - basé sur `learnUserProgressMock`
   * - retourne 0 si le cours n'existe pas ou si pas de leçons complétées
   */
  function getCourseProgressPct(course: LearnCourse) {
    const completed =
      learnUserProgressMock.completedLessonSlugsByCourse[course.slug] ?? [];
    const total = course.lessons.length || 1;
    return (completed.length / total) * 100;
  }

  /**
   * Rôle: barre de progression visuelle (UI seulement).
   * - montre l'état “% done” sans surcharge
   */
  function ProgressBar({ pct }: { pct: number }) {
    const safePct = Math.max(0, Math.min(100, pct));
    return (
      <div className="w-full">
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#3B82F6]"
            style={{ width: `${safePct}%` }}
          />
        </div>
      </div>
    );
  }

  const filteredCourses = learnCoursesMock.filter((course) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const inTitle = course.title.toLowerCase().includes(q);
    const inLevel = course.level.toLowerCase().includes(q);
    return inTitle || inLevel;
  });

  return (
    <div className="space-y-6">
      {/* En-tête de page */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Learn</h1>
      </div>

      {/* Search (wireframe) */}
      <div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses..."
          aria-label="Search courses"
        />
      </div>

      {/* Liste cartes cours */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredCourses.map((course) => {
          const pct = getCourseProgressPct(course);
          return (
            <Link key={course.slug} to={`/learn/${course.slug}`}>
              <Card className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-[#E6EDF3]/70">{course.level}</div>
                    <div className="mt-1 text-base font-semibold">{course.title}</div>
                    <div className="mt-2 text-sm text-[#E6EDF3]/70">
                      {course.lessons.length} lessons
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#E6EDF3]/70">% done</div>
                    <div className="mt-1 text-base font-semibold">{pct.toFixed(0)}%</div>
                  </div>
                </div>

                <Divider className="my-4" />
                <ProgressBar pct={pct} />

                <div className="mt-4">
                  <Button size="sm" variant="secondary" type="button">
                    Continue
                  </Button>
                </div>

                {/* TODO: rendre le bouton réellement “active” (focus/ARIA) si nécessaire */}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

