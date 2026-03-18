"use client"

import { createContext, useContext, useState, ReactNode } from "react";

type AppState = "idle" | "analyzing" | "done";

interface AppContextType {
  appState: AppState;
  setAppState: (state: AppState) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState>("idle");

  return (
    <AppContext.Provider value={{ appState, setAppState }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
