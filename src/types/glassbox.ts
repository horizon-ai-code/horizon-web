export type AgentRole = "Planner" | "Generator" | "Validator" | "Judge" | "System";

export interface PhaseInfo {
  number: number;
  name: string;
  agent: AgentRole;
}

export interface RetryInfo {
  current: number;
  max: number;
  type: "strategy" | "syntax_heal" | "sequential_mutation";
}

export interface GlassboxState {
  currentPhase: number;
  currentAgent: AgentRole;
  strategyIteration: number;
  maxStrategyIterations: number;
  syntaxHealAttempt: number;
  maxSyntaxHealAttempts: number;
  sequentialMutationRetry: number;
  maxSequentialMutationRetries: number;
  validationFaultCount: number | null;
  judgeDecision: "ACCEPT" | "REVISE" | null;
}
