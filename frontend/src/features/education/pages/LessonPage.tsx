import React from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { ErrorRetryBanner } from "../../../components/ui/ErrorRetryBanner";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { CourseDetailDto, LessonDetailDto } from "../../../shared/api/types/backend";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { LessonMarkdown } from "../components/LessonMarkdown";
import { completeLesson, getCourseDetail, getLesson, uncompleteLesson } from "../services/education.service";
import { getCompletedLessonIds, getCourseProgress } from "../../progress/services/progress.service";

/**
 * Leçon — contenu GET /lessons/:id, complétion POST /lessons/:id/complete.
 */
export function LessonPage() {
  return <LessonView />;
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
  const [retryNonce, setRetryNonce] = React.useState(0);

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
  }, [courseId, lessonId, apiMissing, idsValid, refreshProgress, retryNonce]);

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

  const lessonStepNav = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Link to={`/learn/${courseId}`} className="block">
        <Button variant="ghost" size="md" type="button" className="w-full border border-white/10">
          ← Retour au cours
        </Button>
      </Link>
      <div>
        {prevLesson ? (
          <Link to={`/learn/${courseId}/${prevLesson.id}`} className="block">
            <Button size="md" variant="secondary" className="w-full" type="button">
              Précédente
            </Button>
          </Link>
        ) : (
          <Button size="md" variant="secondary" className="w-full" type="button" disabled>
            Précédente
          </Button>
        )}
      </div>
      <div>
        {nextLesson ? (
          <Link to={`/learn/${courseId}/${nextLesson.id}`} className="block">
            <Button size="md" variant="primary" className="w-full" type="button">
              Leçon suivante
            </Button>
          </Link>
        ) : (
          <Link to={`/learn/${courseId}`} className="block">
            <Button size="md" variant="primary" className="w-full" type="button">
              Retour au cours
            </Button>
          </Link>
        )}
      </div>
    </div>
  );

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

  async function handleUncomplete() {
    if (!lessonData || apiMissing) return;
    setCompleteMsg(null);
    setCompleting(true);
    try {
      await uncompleteLesson(lessonData.id);
      await refreshProgress();
      setCompleteMsg("Complétion annulée — tu peux marquer la leçon à nouveau plus tard.");
    } catch (e) {
      if (e instanceof ApiHttpError) {
        setCompleteMsg(e.message);
      } else {
        setCompleteMsg("Impossible d’annuler pour le moment.");
      }
    } finally {
      setCompleting(false);
    }
  }

  if (!idsValid && !apiMissing) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight">Leçon</h1>
        <Alert variant="error" title="URL invalide">
          Identifiants cours ou leçon invalides.
        </Alert>
      </div>
    );
  }

  if (apiMissing) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight">Leçon</h1>
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code>.
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight">Leçon</h1>
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
          <h1 className="text-xl font-semibold tracking-tight">Leçon</h1>
          <p className="mt-1 text-sm text-[#E6EDF3]/70">Contenu introuvable.</p>
        </div>
        {error ? (
          <ErrorRetryBanner
            message={error}
            disabled={loading}
            onRetry={() => setRetryNonce((n) => n + 1)}
          />
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
        <nav aria-label="Fil d’Ariane" className="mb-3 text-xs text-[#E6EDF3]/55">
          <Link to="/learn" className="transition-colors hover:text-[#E6EDF3]">
            Apprendre
          </Link>
          <span className="mx-1.5 text-[#E6EDF3]/35">/</span>
          <Link
            to={`/learn/${courseId}`}
            className="max-w-[min(100%,14rem)] truncate align-bottom transition-colors hover:text-[#E6EDF3] sm:max-w-[20rem] inline-block"
            title={courseData.title}
          >
            {courseData.title}
          </Link>
          <span className="mx-1.5 text-[#E6EDF3]/35">/</span>
          <span className="text-[#E6EDF3]/80">Leçon {currentIndex + 1}</span>
        </nav>

        <h1 className="text-xl font-semibold tracking-tight">
          Leçon {currentIndex + 1} — {lessonData.title}
        </h1>
        <div className="mt-2 text-sm text-[#E6EDF3]/70">
          {courseData.title} · Progression : {progressPct.toFixed(0)} %
          {isLessonCompleted ? " · Terminée" : null}
        </div>

        <div className="mt-4">{lessonStepNav}</div>
      </div>

      <Card className="p-6">
        <ProgressBar pct={progressPct} />
      </Card>

      <Card className="p-6">
        <LessonMarkdown content={lessonData.content} />

        <Divider className="my-6" />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {!isLessonCompleted ? (
            <Button
              size="md"
              variant="primary"
              type="button"
              disabled={completing}
              onClick={handleComplete}
            >
              {completing ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner /> Enregistrement…
                </span>
              ) : (
                "Marquer comme terminée"
              )}
            </Button>
          ) : (
            <Button
              size="md"
              variant="secondary"
              type="button"
              disabled={completing}
              onClick={handleUncomplete}
            >
              {completing ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner /> Mise à jour…
                </span>
              ) : (
                "Annuler la complétion"
              )}
            </Button>
          )}
          {completeMsg ? (
            <span className="text-sm text-[#E6EDF3]/70">{completeMsg}</span>
          ) : null}
        </div>
      </Card>

      <div className="rounded-xl border border-white/[0.08] bg-[#111827]/40 p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#E6EDF3]/45">
          Navigation
        </p>
        {lessonStepNav}
      </div>
    </div>
  );
}
