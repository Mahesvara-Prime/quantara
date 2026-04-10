import { apiV1Request } from "../httpClient";
import type { CourseProgressDto, GlobalProgressDto } from "../types/backend";

/** GET /progress/completed-lessons — ids de leçons complétées (utilisateur courant). */
export async function getCompletedLessonIds(): Promise<number[]> {
  return apiV1Request<number[]>("/progress/completed-lessons", { method: "GET" });
}

/** GET /progress */
export async function getGlobalProgress(): Promise<GlobalProgressDto> {
  return apiV1Request<GlobalProgressDto>("/progress", { method: "GET" });
}

/** GET /progress/courses/{courseId} */
export async function getCourseProgress(courseId: number): Promise<CourseProgressDto> {
  return apiV1Request<CourseProgressDto>(`/progress/courses/${courseId}`, { method: "GET" });
}
