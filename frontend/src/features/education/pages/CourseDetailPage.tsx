import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { CourseDetailDto } from "../../../shared/api/types/backend";
import { getCourseDetail } from "../services/education.service";
import { getCourseProgress, getCompletedLessonIds } from "../../progress/services/progress.service";

/**
 * Détail cours — GET /courses/:id, progression et leçons complétées.
 */
export function CourseDetailPage() {
  return <CourseDetail />;
}

function ProgressBar({ pct }: { pct: number }) {
  const safePct = Math.max(0, Math.min(100, pct));
  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-[#3B82F6]" style={{ width: `${safePct}%` }} />
      </div>
    </div>
  );
}

function CourseDetail() {
  const { course } = useParams<{ course: string }>();
  const courseId = Number.parseInt(course ?? "", 10);

  const [detail, setDetail] = React.useState<CourseDetailDto | null>(null);
  const [progressPct, setProgressPct] = React.useState(0);
  const [completedIds, setCompletedIds] = React.useState<Set<number>>(new Set());
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const apiMissing = !isApiConfigured();
  const idValid = Number.isFinite(courseId) && courseId > 0;

  React.useEffect(() => {
    if (apiMissing || !idValid) {
      setLoading(false);
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getCourseDetail(courseId),
      getCourseProgress(courseId),
      getCompletedLessonIds(),
    ])
      .then(([d, prog, ids]) => {
        if (cancelled) return;
        setDetail(d);
        setProgressPct(prog.progress_percent);
        setCompletedIds(new Set(ids));
      })
      .catch((e) => {
        if (cancelled) return;
        setDetail(null);
        if (e instanceof ApiHttpError) setError(e.message);
        else setError("Impossible de charger le cours.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, apiMissing, idValid]);

  const lessonsSorted = React.useMemo(() => {
    if (!detail) return [];
    return [...detail.lessons].sort((a, b) => a.order_index - b.order_index);
  }, [detail]);

  const nextLesson = React.useMemo(() => {
    for (const l of lessonsSorted) {
      if (!completedIds.has(l.id)) return l;
    }
    return lessonsSorted[lessonsSorted.length - 1] ?? null;
  }, [lessonsSorted, completedIds]);

  if (!idValid && !apiMissing) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight">Course Detail</h1>
        <Alert variant="error" title="URL invalide">
          Identifiant de cours invalide.
        </Alert>
      </div>
    );
  }

  if (apiMissing) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight">Course Detail</h1>
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code>.
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight">Course Detail</h1>
        <div className="inline-flex items-center gap-2 text-sm text-[#E6EDF3]/70">
          <Spinner /> Chargement…
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Course Detail</h1>
          <p className="mt-1 text-sm text-[#E6EDF3]/70">Cours introuvable ou erreur.</p>
        </div>
        {error ? (
          <Alert variant="error" title="Erreur">
            {error}
          </Alert>
        ) : null}
        <Card className="p-6">
          <Divider className="my-4" />
          <div className="text-sm text-[#E6EDF3]/70">Vérifie l’URL du cours.</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{detail.title}</h1>
        <div className="mt-2 text-sm text-[#E6EDF3]/70">
          {detail.level} • {lessonsSorted.length} lessons
        </div>
        <p className="mt-3 text-sm text-[#E6EDF3]/80 whitespace-pre-wrap">{detail.description}</p>
        <div className="mt-2 text-sm text-[#E6EDF3]/70">Progress: {progressPct.toFixed(0)}%</div>
      </div>

      <Card className="p-6">
        <ProgressBar pct={progressPct} />
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold">Lessons</h2>
        <Divider className="my-4" />

        <div className="divide-y divide-white/10">
          {lessonsSorted.map((lesson, idx) => {
            const done = completedIds.has(lesson.id);
            return (
              <div key={lesson.id} className="flex items-center justify-between gap-4 py-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    Lesson {idx + 1} — {lesson.title}
                  </div>
                  {done ? (
                    <div className="mt-1 text-xs text-[#22C55E]">Completed</div>
                  ) : (
                    <div className="mt-1 text-xs text-[#E6EDF3]/60">Not completed</div>
                  )}
                </div>
                <Link to={`/learn/${courseId}/${lesson.id}`} className="shrink-0">
                  <Button size="sm" variant={done ? "secondary" : "primary"}>
                    Open
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        {nextLesson ? (
          <div className="mt-6">
            <Link to={`/learn/${courseId}/${nextLesson.id}`}>
              <Button size="md" variant="primary" className="w-full">
                Continue Learning
              </Button>
            </Link>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
