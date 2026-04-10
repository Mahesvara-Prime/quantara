/**
 * Catalogue et leçons — GET /courses, /courses/:id, /lessons/:id, POST /lessons/:id/complete.
 */

import { educationApi } from "../../../shared/api";
import type {
  CourseDetailDto,
  CourseListItemDto,
  LessonCompleteResponseDto,
  LessonDetailDto,
} from "../../../shared/api/types/backend";

export async function getCourses(): Promise<CourseListItemDto[]> {
  return educationApi.listCourses();
}

export async function getCourseDetail(courseId: number): Promise<CourseDetailDto> {
  return educationApi.getCourse(courseId);
}

export async function getLesson(lessonId: number): Promise<LessonDetailDto> {
  return educationApi.getLesson(lessonId);
}

export async function completeLesson(
  lessonId: number,
): Promise<LessonCompleteResponseDto> {
  return educationApi.completeLesson(lessonId);
}
