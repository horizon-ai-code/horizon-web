// ── WebSocket Contract Types (from horizon-api-docs) ──────────────────────

export interface RefactorRequest {
  code: string;
  user_instruction: string;
}

export interface StatusMessage {
  type: "status";
  role: "Planner" | "Generator" | "Judge" | "Validator" | "System";
  content: string;
}

export interface ConnectionIdMessage {
  type: "connection_id";
  id: string;
}

export interface PerformanceMetrics {
  avg_gpu_utilization: number;
  avg_gpu_memory: number;
  avg_gpu_memory_used: number;
  inference_time: number;
}

export type ExitStatus =
  | "SUCCESS"
  | "ABORT_STRATEGY"
  | "ABORT_SYNTAX"
  | "ABORT_SEMANTIC"
  | "PROCESSING";

export interface PingMessage {
  type: "ping";
  id: string;
  ts: string;
}

export interface HaltAcknowledgedMessage {
  type: "halt_acknowledged";
  id: string;
}

export interface InsightItem {
  title: string;
  details: string;
}

export interface InsightsMessage {
  type: "insights";
  id: string;
  insights: InsightItem[] | string;
}

export interface ResultMessage {
  type: "result";
  id: string;
  code: string;
  exit_status: ExitStatus;
  original_complexity: number | null;
  refactored_complexity: number | null;
  performance: PerformanceMetrics;
  planner_model: string | null;
  generator_model: string | null;
  judge_model: string | null;
}

export interface HaltRequest {
  type: "halt";
}

export interface PongRequest {
  type: "pong";
}

export interface ReconnectRequest {
  type: "reconnect";
  session_id: string;
}

export interface PydanticError {
  type: string;
  loc: string[];
  msg: string;
  input: unknown;
}

export interface ValidationErrorMessage {
  type: "error";
  message: "Invalid data format";
  details: PydanticError[];
}

export interface MalformedJsonErrorMessage {
  type: "error";
  message: "Malformed JSON payload";
  details: string;
}

export type ErrorMessage = ValidationErrorMessage | MalformedJsonErrorMessage;

export type ServerMessage =
  | ConnectionIdMessage
  | PingMessage
  | StatusMessage
  | ResultMessage
  | InsightsMessage
  | HaltAcknowledgedMessage
  | ErrorMessage;
