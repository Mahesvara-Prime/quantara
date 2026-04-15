/**
 * Progression learning — GET /progress, /progress/courses/:id, /progress/completed-lessons (auth).
 */

import { progressApi } from "../../../shared/api";
import type { CourseProgressDto, GlobalProgressDto } from "../../../shared/api/types/backend";

export async function getGlobalProgress(): Promise<GlobalProgressDto> {
  return progressApi.getGlobalProgress();
}

export async function getCourseProgress(courseId: number): Promise<CourseProgressDto> {
  return progressApi.getCourseProgress(courseId);
}

export async function getCompletedLessonIds(): Promise<number[]> {
  return progressApi.getCompletedLessonIds();
}
