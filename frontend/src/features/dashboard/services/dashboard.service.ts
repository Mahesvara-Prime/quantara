/**
 * Dashboard agrégé — GET /api/v1/dashboard/summary (auth Bearer).
 */

import { dashboardApi } from "../../../shared/api";
import type { DashboardSummaryDto } from "../../../shared/api/types/backend";

export async function getDashboardSummary(): Promise<DashboardSummaryDto> {
  return dashboardApi.getDashboardSummary();
}
