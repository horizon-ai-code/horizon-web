import { create } from 'zustand';

export type AppState = "idle" | "analyzing" | "done";

export const INITIAL_SOURCE = `public boolean containsDuplicate(int[] nums) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] == nums[j]) {
                return true;
            }
        }
    }
    return false;
}`;

export const INITIAL_REFACTORED = `public boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int num : nums) {
        if (!seen.add(num)) {
            return true;
        }
    }
    return false;
}`;

export interface TerminalEntry {
  id: string;
  type: 'command' | 'log' | 'system';
  text: string;
  colorClass?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
}

export interface SessionData {
  id: string;
  sourceCode: string;
  refactoredOutput: string;
  activeStep: number;
  inputInstruction: string;
  terminalEntries: TerminalEntry[];
  isTerminalCollapsed: boolean;
  appState: AppState;
  showFlowchartModal: boolean;
  error?: string;
}

const DEFAULT_SESSION: Omit<SessionData, "id"> = {
  sourceCode: INITIAL_SOURCE,
  refactoredOutput: "",
  activeStep: 0,
  inputInstruction: "",
  terminalEntries: [],
  isTerminalCollapsed: false,
  appState: "idle",
  showFlowchartModal: false,
};

interface ChatStore {
  hasInitialLoaded: boolean;
  setHasInitialLoaded: (loaded: boolean) => void;
  sessions: Record<string, SessionData>;
  draftSession: Omit<SessionData, "id">;
  updateDraftSession: (data: Partial<Omit<SessionData, "id">> | ((prev: Omit<SessionData, "id">) => Partial<Omit<SessionData, "id">>)) => void;
  resetDraftSession: () => void;
  updateSession: (id: string, data: Partial<SessionData> | ((prev: SessionData) => Partial<SessionData>)) => void;
  createSession: (id: string, initialData?: Partial<SessionData>) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  hasInitialLoaded: false,
  setHasInitialLoaded: (loaded) => set({ hasInitialLoaded: loaded }),
  sessions: {},
  draftSession: DEFAULT_SESSION,
  
  updateDraftSession: (arg) => set((state) => {
    const data = typeof arg === "function" ? arg(state.draftSession) : arg;
    return {
      ...state,
      draftSession: { ...state.draftSession, ...data }
    };
  }),

  resetDraftSession: () => set((state) => ({ ...state, draftSession: DEFAULT_SESSION })),
  
  updateSession: (id, arg) => set((state) => {
    const existing = state.sessions[id] || { ...DEFAULT_SESSION, id };
    const data = typeof arg === "function" ? arg(existing) : arg;
    return {
      ...state,
      sessions: {
        ...state.sessions,
        [id]: {
          ...existing,
          ...data
        }
      }
    };
  }),

  createSession: (id, initialData) => set((state) => {
    if (state.sessions[id]) return state;
    return {
      ...state,
      sessions: {
        ...state.sessions,
        [id]: { ...DEFAULT_SESSION, id, ...initialData }
      }
    };
  }),
}));
