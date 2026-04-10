import { apiV1Request } from "../httpClient";
import type { PortfolioSummaryDto, PositionDto } from "../types/backend";

/** GET /portfolio */
export async function getPortfolio(): Promise<PortfolioSummaryDto> {
  return apiV1Request<PortfolioSummaryDto>("/portfolio", { method: "GET" });
}

/** GET /portfolio/positions */
export async function getPositions(): Promise<PositionDto[]> {
  return apiV1Request<PositionDto[]>("/portfolio/positions", { method: "GET" });
}
