import React from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Button } from "../../../components/ui/Button";
import {
  learnCoursesMock,
  learnUserProgressMock,
} from "../learn/learn.mock";

/**
 * Rôle: page Lesson (/learn/:course/:lesson) privée.
 * Objectif UX (guide): apprendre avec contenu pédagogique + navigation simple.
 *
 * Wireframe: learn-content-visuel.md
 * - header lesson title
 * - texte + exemple (placeholder visuel)
 * - key points
 * - navigation Previous / Next Lesson
 */
export function LessonPage() {
  const { course, lesson } = useParams<{ course: string; lesson: string }>();
  const courseSlug = course ?? "";
  const lessonSlug = lesson ?? "";

  const courseData = learnCoursesMock.find((c) => c.slug === courseSlug);
  const lessonData = courseData?.lessons.find((l) => l.slug === lessonSlug);

  const completed =
    learnUserProgressMock.completedLessonSlugsByCourse[courseSlug] ?? [];

  const totalLessons = courseData?.lessons.length ?? 0;
  const completedCount = completed.length;
  const courseProgressPct =
    totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  // Compute index for navigation/label.
  const currentIndex = courseData
    ? courseData.lessons.findIndex((l) => l.slug === lessonSlug)
    : -1;

  const prevLesson =
    courseData && currentIndex > 0 ? courseData.lessons[currentIndex - 1] : null;
  const nextLesson =
    courseData && currentIndex >= 0 && currentIndex < courseData.lessons.length - 1
      ? courseData.lessons[currentIndex + 1]
      : null;

  /**
   * Rôle: barre de progression (UI uniquement) pour la progression du cours.
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

  /**
   * Rôle: rendu “key points” (liste pédagogique).
   */
  function KeyPoints({ points }: { points: string[] }) {
    return (
      <ul className="mt-3 space-y-2">
        {points.map((p, idx) => (
          <li key={`${idx}-${p}`} className="text-sm text-[#E6EDF3]/80">
            - {p}
          </li>
        ))}
      </ul>
    );
  }

  if (!courseData || !lessonData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Lesson</h1>
          <p className="mt-1 text-sm text-[#E6EDF3]/70">
            Contenu introuvable pour cette leçon.
          </p>
        </div>
        <Card className="p-6">
          <Divider className="my-4" />
          <div className="text-sm text-[#E6EDF3]/70">Vérifie l'URL.</div>
        </Card>
      </div>
    );
  }

  const isLessonCompleted = completed.includes(lessonData.slug);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Lesson {currentIndex + 1} — {lessonData.title}
        </h1>

        <div className="mt-2 text-sm text-[#E6EDF3]/70">
          Progress: {courseProgressPct.toFixed(0)}%{" "}
          {isLessonCompleted ? "(Completed)" : null}
        </div>
      </div>

      {/* Progress visible (calme) */}
      <Card className="p-6">
        <ProgressBar pct={courseProgressPct} />
      </Card>

      {/* Contenu pédagogique */}
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="text-sm text-[#E6EDF3]/70">
            {lessonData.explanation}
          </div>

          {/* Exemple / image placeholder */}
          <div className="rounded-xl border border-white/10 bg-[#111827]/20 p-4">
            <div className="text-xs text-[#E6EDF3]/70">Example chart / image</div>
            <div className="mt-3 h-28 rounded-lg bg-white/5" />
          </div>

          <Divider className="my-2" />

          <div>
            <div className="text-sm font-semibold">Key points</div>
            <KeyPoints points={lessonData.keyPoints} />
          </div>
        </div>
      </Card>

      {/* Navigation prev / next */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          {prevLesson ? (
            <Link to={`/learn/${courseSlug}/${prevLesson.slug}`}>
              <Button size="md" variant="secondary" className="w-full">
                Previous
              </Button>
            </Link>
          ) : (
            <Button size="md" variant="secondary" className="w-full" disabled>
              Previous
            </Button>
          )}
        </div>
        <div>
          {nextLesson ? (
            <Link to={`/learn/${courseSlug}/${nextLesson.slug}`}>
              <Button size="md" variant="primary" className="w-full">
                Next Lesson
              </Button>
            </Link>
          ) : (
            <Button size="md" variant="primary" className="w-full" disabled>
              Next Lesson
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

