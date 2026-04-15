import { apiV1Request } from "../httpClient";
import type {
  CourseDetailDto,
  CourseListItemDto,
  LessonCompleteResponseDto,
  LessonDetailDto,
} from "../types/backend";

/** GET /courses */
export async function listCourses(): Promise<CourseListItemDto[]> {
  return apiV1Request<CourseListItemDto[]>("/courses", { method: "GET", token: null });
}

/** GET /courses/{courseId} */
export async function getCourse(courseId: number): Promise<CourseDetailDto> {
  return apiV1Request<CourseDetailDto>(`/courses/${courseId}`, { method: "GET", token: null });
}

/** GET /lessons/{lessonId} */
export async function getLesson(lessonId: number): Promise<LessonDetailDto> {
  return apiV1Request<LessonDetailDto>(`/lessons/${lessonId}`, { method: "GET", token: null });
}

/** POST /lessons/{lessonId}/complete (sans corps JSON requis côté backend) */
export async function completeLesson(lessonId: number): Promise<LessonCompleteResponseDto> {
  return apiV1Request<LessonCompleteResponseDto>(`/lessons/${lessonId}/complete`, {
    method: "POST",
  });
}

/** DELETE /lessons/{lessonId}/complete — annuler une complétion par erreur */
export async function uncompleteLesson(lessonId: number): Promise<LessonCompleteResponseDto> {
  return apiV1Request<LessonCompleteResponseDto>(`/lessons/${lessonId}/complete`, {
    method: "DELETE",
  });
}
