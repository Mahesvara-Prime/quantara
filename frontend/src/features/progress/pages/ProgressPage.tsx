import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { ErrorRetryBanner } from "../../../components/ui/ErrorRetryBanner";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { CourseListItemDto } from "../../../shared/api/types/backend";
import { getCourses } from "../../education/services/education.service";
import { getCourseProgress, getGlobalProgress } from "../services/progress.service";

/**
 * Progress — synthèse learning (GET /progress) + détail par cours.
 * La carte « Trading » reste indicative (hors périmètre API learning).
 */
export function ProgressPage() {
  return <ProgressView />;
}

function ProgressView() {
  const [global, setGlobal] = React.useState<{
    total_lessons_completed: number;
    total_courses_completed: number;
    overall_progress: number;
  } | null>(null);
  const [courses, setCourses] = React.useState<CourseListItemDto[]>([]);
  const [courseProgress, setCourseProgress] = React.useState<
    Record<number, { pct: number; done: boolean }>
  >({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryNonce, setRetryNonce] = React.useState(0);

  const apiMissing = !isApiConfigured();

  React.useEffect(() => {
    if (apiMissing) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getGlobalProgress()
      .then(async (g) => {
        if (cancelled) return;
        setGlobal(g);
        const list = await getCourses();
        if (cancelled) return;
        setCourses(list);
        const entries = await Promise.all(
          list.map((c) =>
            getCourseProgress(c.id).then(
              (p) =>
                [c.id, { pct: p.progress_percent, done: p.completed }] as const,
              () => [c.id, { pct: 0, done: false }] as const,
            ),
          ),
        );
        if (cancelled) return;
        const map: Record<number, { pct: number; done: boolean }> = {};
        for (const [id, v] of entries) map[id] = v;
        setCourseProgress(map);
      })
      .catch((e) => {
        if (cancelled) return;
        setGlobal(null);
        if (e instanceof ApiHttpError) setError(e.message);
        else setError("Impossible de charger la progression.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiMissing, retryNonce]);

  const overall = global?.overall_progress ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Progress</h1>
        {global && !loading ? (
          <p className="mt-1 text-sm text-[#E6EDF3]/70">
            Overall learning progress: {overall.toFixed(1)}%
          </p>
        ) : null}
      </div>

      {apiMissing ? (
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code> et connecte-toi.
        </Alert>
      ) : null}

      {error && !apiMissing ? (
        <ErrorRetryBanner
          message={error}
          disabled={loading}
          onRetry={() => setRetryNonce((n) => n + 1)}
        />
      ) : null}

      {loading && !apiMissing ? (
        <div className="inline-flex items-center gap-2 text-sm text-[#E6EDF3]/70">
          <Spinner /> Chargement…
        </div>
      ) : null}

      {/* Learning — données API */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold">Apprentissage</h2>
          <Divider className="my-4" />

          {global ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#E6EDF3]/70">Leçons terminées</span>
                <span className="font-semibold">{global.total_lessons_completed}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#E6EDF3]/70">Courses completed</span>
                <span className="font-semibold">{global.total_courses_completed}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#E6EDF3]/70">Global</span>
                <span className="font-semibold text-[#3B82F6]">
                  {global.overall_progress.toFixed(1)}%
                </span>
              </div>
            </div>
          ) : !loading && !error ? (
            <p className="text-sm text-[#E6EDF3]/70">Aucune donnée.</p>
          ) : null}

          <div className="mt-4">
            <ProgressBar pct={overall} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Trading</h2>
          <Divider className="my-4" />
          <p className="text-sm text-[#E6EDF3]/60">
            Statistiques de trading simulé : utilise les pages Portfolio et Trade History pour les
            données réelles.
          </p>
        </Card>
      </div>

      {/* Par cours */}
      <Card className="p-6">
        <h2 className="text-base font-semibold">Par cours</h2>
        <Divider className="my-4" />

        {!loading && courses.length === 0 && !error ? (
          <p className="text-sm text-[#E6EDF3]/70">Aucun cours dans le catalogue.</p>
        ) : null}

        <ul className="space-y-3">
          {courses.map((c) => {
            const p = courseProgress[c.id];
            const pct = p?.pct ?? 0;
            return (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#111827]/30 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium">{c.title}</div>
                  <div className="text-xs text-[#E6EDF3]/55">{c.level}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#3B82F6]">{pct.toFixed(0)}%</span>
                  <Link
                    to={`/learn/${c.id}`}
                    className="text-xs font-medium text-[#E6EDF3]/80 underline underline-offset-2"
                  >
                    Ouvrir
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold">Trading et analyses</h2>
        <Divider className="my-4" />
        <p className="text-sm text-[#E6EDF3]/70">
          L’historique de performance simulée et les insights personnalisés arriveront dans une
          prochaine itération. En attendant, utilise{" "}
          <Link to="/portfolio" className="font-medium text-[#3B82F6] underline underline-offset-2">
            Portefeuille
          </Link>{" "}
          et{" "}
          <Link to="/trade-history" className="font-medium text-[#3B82F6] underline underline-offset-2">
            Historique des trades
          </Link>{" "}
          pour suivre tes positions et tes exécutions.
        </p>
      </Card>
    </div>
  );
}
