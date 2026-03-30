import React from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Button } from "../../../components/ui/Button";
import {
  learnCoursesMock,
  learnUserProgressMock,
  type LearnCourse,
} from "../learn/learn.mock";

/**
 * Rôle: page Course Detail (/learn/:course) privée.
 * Objectif UX (guide): voir structure cours + liste leçons + progression.
 *
 * Wireframe: learn-detail.md
 * - header (title, level, nb lessons)
 * - carte liste leçons (avec status Completed)
 * - bouton [ Continue Learning ]
 */
export function CourseDetailPage() {
  const { course } = useParams<{ course: string }>();
  const slug = course ?? "";

  const courseData = learnCoursesMock.find((c) => c.slug === slug);
  const totalLessons = courseData?.lessons.length ?? 0;
  const completed =
    (learnUserProgressMock.completedLessonSlugsByCourse[slug] ?? []).filter(
      (s) => !!s
    );
  const progressPct =
    totalLessons > 0 ? (completed.length / totalLessons) * 100 : 0;

  /**
   * Rôle: barre de progression compacte (UI).
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
   * Rôle: ligne “leçon” avec statut (Completed / not completed).
   */
  function LessonRow({
    index,
    lesson,
    isCompleted,
  }: {
    index: number;
    lesson: LearnCourse["lessons"][number];
    isCompleted: boolean;
  }) {
    return (
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">
            Lesson {index + 1} — {lesson.title}
          </div>
          {isCompleted ? (
            <div className="mt-1 text-xs text-[#22C55E]">Completed</div>
          ) : (
            <div className="mt-1 text-xs text-[#E6EDF3]/60">In progress</div>
          )}
        </div>

        {/* Navigation simple vers la page Lesson */}
        <Link
          to={`/learn/${slug}/${lesson.slug}`}
          className="shrink-0"
          aria-label={`Open lesson ${lesson.title}`}
        >
          <Button size="sm" variant={isCompleted ? "secondary" : "primary"}>
            Open
          </Button>
        </Link>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Course Detail</h1>
          <p className="mt-1 text-sm text-[#E6EDF3]/70">Cours introuvable.</p>
        </div>
        <Card className="p-6">
          <Divider className="my-4" />
          <div className="text-sm text-[#E6EDF3]/70">Vérifie l'URL du cours.</div>
        </Card>
      </div>
    );
  }

  // Next lesson = première leçon non complétée (ou la dernière si tout est terminé).
  const nextLesson =
    courseData.lessons.find((l) => !completed.includes(l.slug)) ??
    courseData.lessons[courseData.lessons.length - 1];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {courseData.title}
        </h1>
        <div className="mt-2 text-sm text-[#E6EDF3]/70">
          {courseData.level} • {totalLessons} lessons
        </div>
        <div className="mt-2 text-sm text-[#E6EDF3]/70">
          Progress: {progressPct.toFixed(0)}%
        </div>
      </div>

      {/* Barre de progression */}
      <Card className="p-6">
        <ProgressBar pct={progressPct} />
      </Card>

      {/* Liste leçons */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Lessons</h2>
        <Divider className="my-4" />

        <div className="divide-y divide-white/10">
          {courseData.lessons.slice(0, 6).map((lesson, idx) => (
            <LessonRow
              key={lesson.slug}
              index={idx}
              lesson={lesson}
              isCompleted={completed.includes(lesson.slug)}
            />
          ))}

          {/* Wireframe: "..." (on indique qu'il y a plus de leçons) */}
          {courseData.lessons.length > 6 ? (
            <div className="py-3 text-sm text-[#E6EDF3]/60">...</div>
          ) : null}
        </div>

        {/* Continue Learning (wireframe) */}
        <div className="mt-6">
          <Link to={`/learn/${slug}/${nextLesson.slug}`}>
            <Button size="md" variant="primary" className="w-full">
              Continue Learning
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

