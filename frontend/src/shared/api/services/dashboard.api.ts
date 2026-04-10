import { apiV1Request } from "../httpClient";
import type { DashboardSummaryDto } from "../types/backend";

/** GET /dashboard/summary */
export async function getDashboardSummary(): Promise<DashboardSummaryDto> {
  return apiV1Request<DashboardSummaryDto>("/dashboard/summary", { method: "GET" });
}
