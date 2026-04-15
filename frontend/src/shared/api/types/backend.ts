/**
 * Formes JSON alignées sur les `response_model` FastAPI (snake_case).
 * À étendre au fil du branchement des pages.
 */

export type UserProfileDto = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

export type ProfileDto = UserProfileDto & {
  is_active: boolean;
};

/** PATCH /profile — champs optionnels ; le backend exige au moins un champ. */
export type ProfilePatchRequestDto = {
  first_name?: string;
  last_name?: string;
  email?: string;
};

export type LoginResponseDto = {
  access_token: string;
  token_type: string;
  user: UserProfileDto;
};

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type RegisterRequestDto = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

export type PasswordChangeRequestDto = {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
};

export type PasswordChangeConfirmDto = {
  token: string;
  new_password: string;
  new_password_confirm: string;
};

/** POST /auth/password-reset/request */
export type ForgotPasswordRequestDto = {
  email: string;
};

/** POST /auth/password-reset/confirm — même forme que password-change/confirm. */
export type PasswordResetConfirmDto = PasswordChangeConfirmDto;

export type StatusMessageDto = {
  message: string;
};

export type AssetListItemDto = {
  symbol: string;
  name: string;
  price: number;
  change_percent: number;
};

export type AssetDetailDto = AssetListItemDto & {
  high_24h: number;
  low_24h: number;
};

export type CandleDto = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

export type TradeExecuteRequestDto = {
  symbol: string;
  side: "buy" | "sell";
  amount: number;
  /** Achat uniquement : prix stop (sous l’entrée). */
  stop_loss?: number | null;
  /** Achat uniquement : prix take-profit (au-dessus de l’entrée). */
  take_profit?: number | null;
};

export type TradeExecutedDto = {
  id: number;
  symbol: string;
  side: string;
  amount: number;
  quantity: number;
  price: number;
  stop_loss?: number | null;
  take_profit?: number | null;
  created_at: string;
};

export type PortfolioSummaryDto = {
  cash_balance: number;
  total_value: number;
  total_pnl: number;
};

export type PositionDto = {
  symbol: string;
  quantity: number;
  average_entry_price: number;
  current_price: number;
  pnl: number;
  stop_loss?: number | null;
  take_profit?: number | null;
};

export type TradeHistoryItemDto = {
  symbol: string;
  side: string;
  amount: number;
  price: number;
  created_at: string;
};

export type CourseListItemDto = {
  id: number;
  title: string;
  level: string;
};

export type CourseLessonSummaryDto = {
  id: number;
  title: string;
  order_index: number;
};

export type CourseDetailDto = {
  id: number;
  title: string;
  description: string;
  level: string;
  lessons: CourseLessonSummaryDto[];
};

export type LessonDetailDto = {
  id: number;
  title: string;
  content: string;
};

export type LessonCompleteResponseDto = {
  status: "completed" | "incomplete";
};

export type GlobalProgressDto = {
  total_lessons_completed: number;
  total_courses_completed: number;
  overall_progress: number;
};

export type CourseProgressDto = {
  course_id: number;
  progress_percent: number;
  completed: boolean;
};

export type UserSettingsDto = {
  language: string;
  notifications_enabled: boolean;
};

export type UserSettingsPatchDto = {
  language?: string;
  notifications_enabled?: boolean;
};

export type DashboardRecentTradeDto = {
  symbol: string;
  side: string;
  created_at: string;
};

export type DashboardMarketItemDto = {
  symbol: string;
  name: string;
  price: number;
  change_percent: number;
};

export type DashboardSummaryDto = {
  portfolio: PortfolioSummaryDto;
  progress: GlobalProgressDto;
  recent_activity: DashboardRecentTradeDto[];
  market_preview: DashboardMarketItemDto[];
};

export type InsightItemDto = {
  type: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high";
};

export type InsightsResponseDto = {
  items: InsightItemDto[];
};
