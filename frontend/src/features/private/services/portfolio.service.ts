/**
 * Portfolio — GET /api/v1/portfolio et /api/v1/portfolio/positions (auth Bearer).
 */

import { portfolioApi } from "../../../shared/api";
import type { PortfolioSummaryDto, PositionDto } from "../../../shared/api/types/backend";

export async function getPortfolio(): Promise<PortfolioSummaryDto> {
  return portfolioApi.getPortfolio();
}

export async function getPortfolioPositions(): Promise<PositionDto[]> {
  return portfolioApi.getPositions();
}
