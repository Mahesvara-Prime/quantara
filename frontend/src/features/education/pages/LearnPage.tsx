import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { Divider } from "../../../components/ui/Divider";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Alert } from "../../../components/ui/Alert";
import { Spinner } from "../../../components/ui/Spinner";
import { isApiConfigured } from "../../../shared/api";
import { ApiHttpError } from "../../../shared/api/httpClient";
import type { CourseListItemDto } from "../../../shared/api/types/backend";
import { getCourses } from "../services/education.service";
import { getCourseProgress } from "../../progress/services/progress.service";

/**
 * Catalogue Learn — GET /courses + progression par cours (GET /progress/courses/:id).
 */
export function LearnPage() {
  return <Learn />;
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

function Learn() {
  const [query, setQuery] = React.useState("");
  const [courses, setCourses] = React.useState<CourseListItemDto[]>([]);
  /** course_id -> progress % */
  const [progressByCourse, setProgressByCourse] = React.useState<Record<number, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const apiMissing = !isApiConfigured();

  React.useEffect(() => {
    if (apiMissing) {
      setLoading(false);
      setCourses([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getCourses()
      .then(async (list) => {
        if (cancelled) return;
        setCourses(list);
        const progresses = await Promise.all(
          list.map((c) =>
            getCourseProgress(c.id).then(
              (p) => [c.id, p.progress_percent] as const,
              () => [c.id, 0] as const,
            ),
          ),
        );
        if (cancelled) return;
        const map: Record<number, number> = {};
        for (const [id, pct] of progresses) map[id] = pct;
        setProgressByCourse(map);
      })
      .catch((e) => {
        if (cancelled) return;
        setCourses([]);
        if (e instanceof ApiHttpError) setError(e.message);
        else setError("Impossible de charger les cours.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiMissing]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.level.toLowerCase().includes(q),
    );
  }, [courses, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Learn</h1>
      </div>

      {apiMissing ? (
        <Alert variant="error" title="API non configurée">
          Définis <code className="rounded bg-white/10 px-1">VITE_API_BASE_URL</code> pour charger le
          catalogue.
        </Alert>
      ) : null}

      {error && !apiMissing ? (
        <Alert variant="error" title="Erreur">
          {error}
        </Alert>
      ) : null}

      <div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses..."
          aria-label="Search courses"
          disabled={apiMissing || loading}
        />
      </div>

      {loading && !apiMissing ? (
        <div className="inline-flex items-center gap-2 text-sm text-[#E6EDF3]/70">
          <Spinner /> Chargement des cours…
        </div>
      ) : null}

      {!loading && !error && filtered.length === 0 && !apiMissing ? (
        <p className="text-sm text-[#E6EDF3]/70">Aucun cours ne correspond à ta recherche.</p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((course) => {
          const pct = progressByCourse[course.id] ?? 0;
          return (
            <Link key={course.id} to={`/learn/${course.id}`}>
              <Card className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-[#E6EDF3]/70">{course.level}</div>
                    <div className="mt-1 text-base font-semibold">{course.title}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#E6EDF3]/70">Progress</div>
                    <div className="mt-1 text-base font-semibold">{pct.toFixed(0)}%</div>
                  </div>
                </div>

                <Divider className="my-4" />
                <ProgressBar pct={pct} />

                <div className="mt-4">
                  <Button size="sm" variant="secondary" type="button">
                    Open course
                  </Button>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
