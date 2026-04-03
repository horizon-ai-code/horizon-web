import { create } from 'zustand';

// ── Import types from dedicated modules ───────────────────────────────────────
import type { AppState, SessionData, TerminalEntry, OrchestrationResult } from '@/types/session';
import type { ReplayStep, InsightMetric } from '@/types/insights';
import type {
  RefactorRequest,
  StatusMessage,
  ResultMessage,
  ComplexityResult,
  PydanticError,
  ValidationErrorMessage,
  MalformedJsonErrorMessage,
  ErrorMessage,
  ServerMessage,
} from '@/types/websocket';

// ── Import constants ──────────────────────────────────────────────────────────
import { INITIAL_SOURCE, INITIAL_REFACTORED, EMPTY_ORCHESTRATION_RESULT } from '@/lib/constants';

// ── Re-export everything for backward compatibility ───────────────────────────
// Consumers that already import from '@/store/useChatStore' will continue to work.
export type {
  AppState,
  SessionData,
  TerminalEntry,
  OrchestrationResult,
  ReplayStep,
  InsightMetric,
  RefactorRequest,
  StatusMessage,
  ResultMessage,
  ComplexityResult,
  PydanticError,
  ValidationErrorMessage,
  MalformedJsonErrorMessage,
  ErrorMessage,
  ServerMessage,
};

export { INITIAL_SOURCE, INITIAL_REFACTORED, EMPTY_ORCHESTRATION_RESULT };

// ── Internal Helpers ──────────────────────────────────────────────────────────

const DEFAULT_SESSION: Omit<SessionData, "id"> = {
  title: "New Session",
  createdAt: 0,
  updatedAt: 0,
  sourceCode: INITIAL_SOURCE,
  refactoredOutput: "",
  activeStep: 0,
  inputInstruction: "",
  terminalEntries: [],
  isTerminalCollapsed: false,
  appState: "idle",
  showFlowchartModal: false,
  orchestrationResult: EMPTY_ORCHESTRATION_RESULT,
};

const generateSessionId = () => Math.random().toString(36).slice(2, 10);

const getSessionTitleFromPrompt = (prompt: string) => {
  const trimmed = prompt.trim();
  if (!trimmed) return "New Session";
  return trimmed.length > 48 ? `${trimmed.slice(0, 48)}...` : trimmed;
};

// ── Store Interface ───────────────────────────────────────────────────────────

interface ChatStore {
  hasInitialLoaded: boolean;
  setHasInitialLoaded: (loaded: boolean) => void;
  sessions: Record<string, SessionData>;
  draftSession: Omit<SessionData, "id">;
  updateDraftSession: (
    data:
      | Partial<Omit<SessionData, "id">>
      | ((prev: Omit<SessionData, "id">) => Partial<Omit<SessionData, "id">>)
  ) => void;
  resetDraftSession: () => void;
  updateSession: (id: string, data: Partial<SessionData> | ((prev: SessionData) => Partial<SessionData>)) => void;
  createSession: (id: string, initialData?: Partial<SessionData>) => void;
  createSessionWithInitialPrompt: (prompt: string, initialData?: Partial<SessionData>) => string;
  renameSession: (id: string, title: string) => void;
  deleteSession: (id: string) => void;
}

// ── Zustand Store ─────────────────────────────────────────────────────────────

export const useChatStore = create<ChatStore>((set) => ({
  hasInitialLoaded: false,
  setHasInitialLoaded: (loaded) => set({ hasInitialLoaded: loaded }),
  sessions: {},
  draftSession: DEFAULT_SESSION,

  updateDraftSession: (arg) =>
    set((state) => {
      const data = typeof arg === "function" ? arg(state.draftSession) : arg;
      return {
        ...state,
        draftSession: { ...state.draftSession, ...data },
      };
    }),

  resetDraftSession: () => set((state) => ({ ...state, draftSession: DEFAULT_SESSION })),

  updateSession: (id, arg) =>
    set((state) => {
      const now = Date.now();
      const existing = state.sessions[id] || { ...DEFAULT_SESSION, id, createdAt: now, updatedAt: now };
      const data = typeof arg === "function" ? arg(existing) : arg;

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [id]: {
            ...existing,
            ...data,
            updatedAt: now,
          },
        },
      };
    }),

  createSession: (id, initialData) =>
    set((state) => {
      if (state.sessions[id]) return state;

      const now = Date.now();
      return {
        ...state,
        sessions: {
          ...state.sessions,
          [id]: { ...DEFAULT_SESSION, id, createdAt: now, updatedAt: now, ...initialData },
        },
      };
    }),

  createSessionWithInitialPrompt: (prompt, initialData) => {
    const id = generateSessionId();
    const now = Date.now();
    const title = getSessionTitleFromPrompt(prompt);

    set((state) => ({
      ...state,
      sessions: {
        ...state.sessions,
        [id]: {
          ...DEFAULT_SESSION,
          id,
          title,
          createdAt: now,
          updatedAt: now,
          ...initialData,
        },
      },
    }));

    return id;
  },

  renameSession: (id, title) =>
    set((state) => {
      const session = state.sessions[id];
      if (!session) return state;

      const trimmed = title.trim();
      if (!trimmed) return state;

      return {
        ...state,
        sessions: {
          ...state.sessions,
          [id]: {
            ...session,
            title: trimmed,
            updatedAt: Date.now(),
          },
        },
      };
    }),

  deleteSession: (id) =>
    set((state) => {
      if (!state.sessions[id]) return state;

      const { [id]: _deleted, ...remaining } = state.sessions;
      return {
        ...state,
        sessions: remaining,
      };
    }),
}));
