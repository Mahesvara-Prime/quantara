/**
 * Simulation — ordres papier via POST /api/v1/simulation/trades (auth Bearer).
 */

import { simulationApi } from "../../../shared/api";
import type { TradeExecuteRequestDto, TradeExecutedDto } from "../../../shared/api/types/backend";

export async function executeTrade(
  payload: TradeExecuteRequestDto,
): Promise<TradeExecutedDto> {
  return simulationApi.executeTrade(payload);
}
