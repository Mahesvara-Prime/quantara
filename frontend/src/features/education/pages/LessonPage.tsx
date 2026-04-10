import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { CourseDetailDto, LessonDetailDto } from "../../../shared/api/types/backend";
import { completeLesson, getCourseDetail, getLesson } from "../services/education.service";
import { getCompletedLessonIds, getCourseProgress } from "../../progress/services/progress.service";

/**
 * Leçon — contenu GET /lessons/:id, complétion POST /lessons/:id/complete.
 */
export function LessonPage() {
  return <LessonView />;
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

function LessonView() {
  const { course, lesson } = useParams<{ course: string; lesson: string }>();
  const courseId = Number.parseInt(course ?? "", 10);
  const lessonId = Number.parseInt(lesson ?? "", 10);

  const [courseData, setCourseData] = React.useState<CourseDetailDto | null>(null);
  const [lessonData, setLessonData] = React.useState<LessonDetailDto | null>(null);
  const [progressPct, setProgressPct] = React.useState(0);
  const [completedIds, setCompletedIds] = React.useState<Set<number>>(new Set());
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [completing, setCompleting] = React.useState(false);
  const [completeMsg, setCompleteMsg] = React.useState<string | null>(null);

  const apiMissing = !isApiConfigured();
  const idsValid =
    Number.isFinite(courseId) &&
    courseId > 0 &&
    Number.isFinite(lessonId) &&
    lessonId > 0;

  const refreshProgress = React.useCallback(async () => {
    const [prog, ids] = await Promise.all([
      getCourseProgress(courseId),
      getCompletedLessonIds(),
    ]);
    setProgressPct(prog.progress_percent);
    setCompletedIds(new Set(ids));
  }, [courseId]);

  React.useEffect(() => {
    if (apiMissing || !idsValid) {
      setLoading(false);
      setCourseData(null);
      setLessonData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getCourseDetail(courseId), getLesson(lessonId)])
      .then(([c, l]) => {
        if (cancelled) return;
        const inCourse = c.lessons.some((x) => x.id === l.id);
        if (!inCourse) {
          setError("Cette leçon n’appartient pas à ce cours.");
          setCourseData(null);
          setLessonData(null);
          return;
        }
        setCourseData(c);
        setLessonData(l);
        return refreshProgress();
      })
      .catch((e) => {
        if (cancelled) return;
        setCourseData(null);
        setLessonData(null);
        if (e instanceof ApiHttpError) setError(e.message);
        else setError("Impossible de charger la leçon.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId, apiMissing, idsValid, refreshProgress]);

  const lessonsSorted = React.useMemo(() => {
    if (!courseData) return [];
    return [...courseData.lessons].sort((a, b) => a.order_index - b.order_index);
  }, [courseData]);

  const currentIndex = lessonsSorted.findIndex((x) => x.id === lessonId);
  const prevLesson = currentIndex > 0 ? lessonsSorted[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < lessonsSorted.length - 1
      ? lessonsSorted[currentIndex + 1]
      : null;

  const isLessonCompleted = completedIds.has(lessonId);

  async function handleComplete() {
    if (!lessonData || apiMissing) return;
    setCompleteMsg(null);
    setCompleting(true);
    try {
      await completeLesson(lessonData.id);
      await refreshProgress();
      setCompleteMsg("Leçon marquée comme complétée.");
    } catch (e) {
      if (e instanceof ApiHttpError) {
        setCompleteMsg(e.message);
      } else {
        setCompleteMsg("Échec de l’enregistrement.");
      }
    } finally {
      setCompleting(false);
    }
  }

  if (!idsValid && !apiMissing) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight">Lesson</h1>
        <Alert variant="error" title="URL invalide">
          Identifiants cours ou leçon invalides.
        </Alert>
      </div>
    );
  }

  if (apiMissing) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight">Lesson</h1>
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code>.
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight">Lesson</h1>
        <div className="inline-flex items-center gap-2 text-sm text-[#E6EDF3]/70">
          <Spinner /> Chargement…
        </div>
      </div>
    );
  }

  if (error || !courseData || !lessonData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Lesson</h1>
          <p className="mt-1 text-sm text-[#E6EDF3]/70">Contenu introuvable.</p>
        </div>
        {error ? (
          <Alert variant="error" title="Erreur">
            {error}
          </Alert>
        ) : null}
        <Card className="p-6">
          <Divider className="my-4" />
          <div className="text-sm text-[#E6EDF3]/70">Vérifie l’URL.</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Lesson {currentIndex + 1} — {lessonData.title}
        </h1>
        <div className="mt-2 text-sm text-[#E6EDF3]/70">
          {courseData.title} · Progress: {progressPct.toFixed(0)}%
          {isLessonCompleted ? " · Completed" : null}
        </div>
      </div>

      <Card className="p-6">
        <ProgressBar pct={progressPct} />
      </Card>

      <Card className="p-6">
        <div className="prose prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-sm text-[#E6EDF3]/90 leading-relaxed">
            {lessonData.content}
          </div>
        </div>

        <Divider className="my-6" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            size="md"
            variant="primary"
            type="button"
            disabled={completing || isLessonCompleted}
            onClick={handleComplete}
          >
            {completing ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Enregistrement…
              </span>
            ) : isLessonCompleted ? (
              "Completed"
            ) : (
              "Mark as complete"
            )}
          </Button>
          {completeMsg ? (
            <span className="text-sm text-[#E6EDF3]/70">{completeMsg}</span>
          ) : null}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <div>
          {prevLesson ? (
            <Link to={`/learn/${courseId}/${prevLesson.id}`}>
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
            <Link to={`/learn/${courseId}/${nextLesson.id}`}>
              <Button size="md" variant="primary" className="w-full">
                Next Lesson
              </Button>
            </Link>
          ) : (
            <Link to={`/learn/${courseId}`}>
              <Button size="md" variant="primary" className="w-full">
                Back to course
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
