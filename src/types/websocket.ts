// ── WebSocket Contract Types (from horizon-api-docs.pdf pp. 7-8) ──────────

export interface RefactorRequest {
  code: string;
  user_instruction: string;
}

export interface StatusMessage {
  type: "status";
  role: "Planner" | "Generator" | "Judge" | "Validator";
  content: string;
}

export interface ComplexityResult {
  complexity_score: number | null;
  structure_tier: string;
  is_fallback: boolean | null;
}

export interface ResultMessage {
  type: "result";
  code: string;
  complexity: ComplexityResult;
  insights: string;
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
export type ServerMessage = StatusMessage | ResultMessage | ErrorMessage;
