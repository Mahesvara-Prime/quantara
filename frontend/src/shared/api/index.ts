/**
 * Point d’entrée API partagé (`apiV1Request`, services par domaine).
 */
export { isApiConfigured, getApiBaseUrl, API_V1_PREFIX } from "./config";
export { getAccessToken, setAccessToken, clearAccessToken } from "./authToken";
export { apiV1Request, ApiHttpError, type RequestOptions } from "./httpClient";
export * from "./integration";

export * as authApi from "./services/auth.api";
export * as marketsApi from "./services/markets.api";
export * as simulationApi from "./services/simulation.api";
export * as portfolioApi from "./services/portfolio.api";
export * as tradesApi from "./services/trades.api";
export * as educationApi from "./services/education.api";
export * as progressApi from "./services/progress.api";
export * as profileApi from "./services/profile.api";
export * as settingsApi from "./services/settings.api";
export * as dashboardApi from "./services/dashboard.api";
export * as insightsApi from "./services/insights.api";

export type * from "./types/backend";
