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
import type { CourseDetailDto } from "../../../shared/api/types/backend";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { getCourseDetail, uncompleteLesson } from "../services/education.service";
import { getCourseProgress, getCompletedLessonIds } from "../../progress/services/progress.service";

/**
 * Détail cours — GET /courses/:id, progression et leçons complétées.
 */
export function CourseDetailPage() {
  return <CourseDetail />;
}

function CourseDetail() {
  const { course } = useParams<{ course: string }>();
  const courseId = Number.parseInt(course ?? "", 10);

  const [detail, setDetail] = React.useState<CourseDetailDto | null>(null);
  const [progressPct, setProgressPct] = React.useState(0);
  const [completedIds, setCompletedIds] = React.useState<Set<number>>(new Set());
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryNonce, setRetryNonce] = React.useState(0);
  const [uncompletingId, setUncompletingId] = React.useState<number | null>(null);
  const [listMsg, setListMsg] = React.useState<string | null>(null);

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
  }, [courseId, apiMissing, idValid, retryNonce]);

  async function refreshLessonProgress() {
    if (apiMissing || !idValid) return;
    try {
      const [prog, ids] = await Promise.all([
        getCourseProgress(courseId),
        getCompletedLessonIds(),
      ]);
      setProgressPct(prog.progress_percent);
      setCompletedIds(new Set(ids));
    } catch {
      /* ignore */
    }
  }

  async function handleUncompleteLesson(lessonId: number) {
    if (apiMissing) return;
    setListMsg(null);
    setUncompletingId(lessonId);
    try {
      await uncompleteLesson(lessonId);
      await refreshLessonProgress();
      setListMsg("Statut « terminé » retiré pour cette leçon.");
    } catch (e) {
      if (e instanceof ApiHttpError) {
        setListMsg(e.message);
      } else {
        setListMsg("Impossible de mettre à jour le statut.");
      }
    } finally {
      setUncompletingId(null);
    }
  }

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
        <h1 className="text-xl font-semibold tracking-tight">Cours</h1>
        <Alert variant="error" title="URL invalide">
          Identifiant de cours invalide.
        </Alert>
      </div>
    );
  }

  if (apiMissing) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight">Cours</h1>
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code>.
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight">Cours</h1>
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
          <h1 className="text-xl font-semibold tracking-tight">Cours</h1>
          <p className="mt-1 text-sm text-[#E6EDF3]/70">Cours introuvable ou erreur.</p>
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
          <div className="text-sm text-[#E6EDF3]/70">Vérifie l’URL du cours.</div>
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
          <span className="inline-block max-w-[min(100%,14rem)] truncate align-bottom text-[#E6EDF3]/80 sm:max-w-[24rem]" title={detail.title}>
            {detail.title}
          </span>
        </nav>

        <div className="mb-4">
          <Link to="/learn" className="inline-block">
            <Button variant="ghost" size="md" type="button" className="border border-white/10">
              ← Retour à tous les cours
            </Button>
          </Link>
        </div>

        <h1 className="text-xl font-semibold tracking-tight">{detail.title}</h1>
        <div className="mt-2 text-sm text-[#E6EDF3]/70">
          {detail.level} • {lessonsSorted.length} leçon{lessonsSorted.length !== 1 ? "s" : ""}
        </div>
        <p className="mt-3 text-sm text-[#E6EDF3]/80 whitespace-pre-wrap">{detail.description}</p>
        <div className="mt-2 text-sm text-[#E6EDF3]/70">
          Progression : {progressPct.toFixed(0)} %
        </div>
      </div>

      <Card className="p-6">
        <ProgressBar pct={progressPct} />
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold">Leçons</h2>
        <Divider className="my-4" />

        {listMsg ? (
          <p className="mb-3 text-xs text-[#E6EDF3]/65" role="status">
            {listMsg}
          </p>
        ) : null}

        <div className="divide-y divide-white/10">
          {lessonsSorted.map((lesson, idx) => {
            const done = completedIds.has(lesson.id);
            const busy = uncompletingId === lesson.id;
            return (
              <div key={lesson.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">
                    Leçon {idx + 1} — {lesson.title}
                  </div>
                  {done ? (
                    <div className="mt-1 text-xs text-[#22C55E]">Terminée</div>
                  ) : (
                    <div className="mt-1 text-xs text-[#E6EDF3]/60">Non terminée</div>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {done ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      type="button"
                      disabled={busy}
                      onClick={() => handleUncompleteLesson(lesson.id)}
                      title="Si tu as marqué terminé par erreur"
                    >
                      {busy ? (
                        <span className="inline-flex items-center gap-1">
                          <Spinner /> …
                        </span>
                      ) : (
                        "Retirer « terminé »"
                      )}
                    </Button>
                  ) : null}
                  <Link to={`/learn/${courseId}/${lesson.id}`}>
                    <Button size="sm" variant={done ? "secondary" : "primary"} type="button">
                      Ouvrir
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {nextLesson ? (
          <div className="mt-6">
            <Link to={`/learn/${courseId}/${nextLesson.id}`}>
              <Button size="md" variant="primary" className="w-full">
                Continuer
              </Button>
            </Link>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
