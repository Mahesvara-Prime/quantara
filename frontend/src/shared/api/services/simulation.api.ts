import { apiV1Request } from "../httpClient";
import type { TradeExecuteRequestDto, TradeExecutedDto } from "../types/backend";

/** POST /simulation/trades */
export async function executeTrade(body: TradeExecuteRequestDto): Promise<TradeExecutedDto> {
  return apiV1Request<TradeExecutedDto>("/simulation/trades", {
    method: "POST",
    jsonBody: body,
  });
}
