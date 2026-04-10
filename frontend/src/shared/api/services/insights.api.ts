import { apiV1Request } from "../httpClient";
import type { InsightsResponseDto } from "../types/backend";

/** GET /insights — insights comportementaux (auth). */
export async function getInsights(): Promise<InsightsResponseDto> {
  return apiV1Request<InsightsResponseDto>("/insights", { method: "GET" });
}
