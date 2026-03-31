"use client"

import React, { useState, useRef, useEffect } from "react";
import { useChatStore, INITIAL_SOURCE, INITIAL_REFACTORED } from "@/store/useChatStore";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

import Input from "@/components/chat/Input";
import RefactoredOutput from "@/components/chat/RefactoredOutput";
import Terminal from "@/components/chat/Terminal";

export const mockHighlights = {
  inputRemoved: [1, 2, 3, 4, 5, 6, 7], 
  outputAdded: [1, 2, 3, 4, 5]         
};

export default function ChatWorkspace({ sessionId }: { sessionId: string | null }) {
  const store = useChatStore();
  const id = sessionId;
  const router = useRouter();

  const { resolvedTheme } = useTheme();
  
  const [mounted, setMounted] = useState(false);
  const [localSourceError, setLocalSourceError] = useState(false);
  const [localInputError, setLocalInputError] = useState(false);
  
  const terminalPanelRef = useRef<any>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // CRITICAL: Cleanup timeouts when the ID changes to prevent state bleeding
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
    };
  }, [id]);

  useEffect(() => {
    if (id && !store.sessions[id]) {
      store.createSession(id);
    }
  }, [id, store.sessions, store.createSession]); // eslint-disable-line

  const activeSession = id ? (store.sessions[id] || {
    id: id,
    sourceCode: INITIAL_SOURCE,
    refactoredOutput: "",
    activeStep: 0,
    inputInstruction: "",
    terminalEntries: [],
    isTerminalCollapsed: false,
    appState: "idle",
    showFlowchartModal: false,
  }) : { ...store.draftSession, id: "draft" };

  const {
    sourceCode, refactoredOutput, activeStep, inputInstruction,
    terminalEntries, isTerminalCollapsed, appState, showFlowchartModal
  } = activeSession;

  // Local helper to update the correct slice
  const updateLocal = (data: any) => {
    if (id) {
      store.updateSession(id, data);
    } else {
      store.updateDraftSession(data);
    }
  };

  useEffect(() => {
    if (terminalPanelRef.current) {
      if (isTerminalCollapsed) {
        terminalPanelRef.current.collapse();
      } else {
        terminalPanelRef.current.expand();
      }
    }
  }, [isTerminalCollapsed]);
  
  const isDark = mounted ? resolvedTheme === "dark" : true;

  useEffect(() => {
    if (!isTerminalCollapsed) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalEntries, activeStep, isTerminalCollapsed, appState]);

  const startAnalysis = () => {
    let hasError = false;
    if (!sourceCode.trim()) { setLocalSourceError(true); hasError = true; } else { setLocalSourceError(false); }
    if (!inputInstruction.trim()) { setLocalInputError(true); hasError = true; } else { setLocalInputError(false); }
    if (hasError) return;

    if (appState === 'analyzing') return;

    const commandId = Date.now().toString();
    const newEntry = { id: commandId, type: 'command' as const, text: inputInstruction };

    // Set shared initial animation state
    const targetId = id || Math.random().toString(36).substring(2, 10);
    const updatedState = {
      inputInstruction: "",
      terminalEntries: [...terminalEntries, newEntry],
      appState: "analyzing" as const,
      isTerminalCollapsed: false,
      showFlowchartModal: true,
      activeStep: 1,
      refactoredOutput: ""
    };

    if (!id) {
      // Lazy Create Session
      store.createSession(targetId, {
        ...store.draftSession,
        ...updatedState,
      });
      store.resetDraftSession();
      router.push(`/${targetId}`);
      // Return early; the new route will pick up the analyzing state and trigger its own timeouts
      return; 
    }

    // Standard local update
    updateLocal(updatedState);
    setLocalInputError(false);
    setLocalSourceError(false);
    
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];

    timeoutRefs.current.push(setTimeout(() => {
        store.updateSession(targetId, (prev) => ({
          activeStep: 2,
          terminalEntries: [...prev.terminalEntries, { id: 'l1'+Date.now(), type: 'log', icon: 'Cpu', colorClass: 'text-[#56a8f5]', text: "[Logical Prover]: Analyzing abstract syntax tree... High cyclomatic risk detected in arithmetic sequences. Recommending methodical abstraction." }]
        }));
    }, 2000));

    timeoutRefs.current.push(setTimeout(() => {
        store.updateSession(targetId, (prev) => ({
          activeStep: 3,
          terminalEntries: [...prev.terminalEntries, { id: 'l2'+Date.now(), type: 'log', icon: 'AlertCircle', colorClass: 'text-[#2aacb8]', text: "[Adversarial Critic]: Warning — over-abstraction may induce slight overhead. Proceeding with micro-benchmark validations. Consensus required." }]
        }));
    }, 4500));

    timeoutRefs.current.push(setTimeout(() => {
        store.updateSession(targetId, (prev) => ({
          activeStep: 4,
          terminalEntries: [...prev.terminalEntries, { id: 'l3'+Date.now(), type: 'log', icon: 'Layers', colorClass: 'text-[#cf8e6d]', text: "[Consensus Judge]: Validating trade-offs. Abstraction paradigm approved for enhanced maintainability. Synthesizing refactored Java outputs." }]
        }));
    }, 7000));

    timeoutRefs.current.push(setTimeout(() => {
      store.updateSession(targetId, (prev) => ({
        activeStep: 5,
        terminalEntries: [...prev.terminalEntries, { id: 'l4'+Date.now(), type: 'log', icon: 'CheckCircle2', colorClass: 'text-[#27c93f]', text: "[System]: Refactoring cycle complete. New AST generated and serialized successfully." }],
        refactoredOutput: INITIAL_REFACTORED
      }));

      timeoutRefs.current.push(setTimeout(() => {
        store.updateSession(targetId, {
          appState: 'done',
          showFlowchartModal: false
        });
      }, 1500));
    }, 9500));
  };

  // If a session was already loaded in analyzing state (due to lazy creation redirect),
  // fire the timeouts. This ensures a seamless transition across URL change!
  useEffect(() => {
    if (appState === "analyzing" && activeStep === 1 && id && terminalEntries.length > 0) {
      // Prevent double firing if already doing it
      if (timeoutRefs.current.length > 0) return;

      const targetId = id;

      timeoutRefs.current.push(setTimeout(() => {
          store.updateSession(targetId, (prev) => ({
            activeStep: 2,
            terminalEntries: [...prev.terminalEntries, { id: 'l1'+Date.now(), type: 'log', icon: 'Cpu', colorClass: 'text-[#56a8f5]', text: "[Logical Prover]: Analyzing abstract syntax tree... High cyclomatic risk detected in arithmetic sequences. Recommending methodical abstraction." }]
          }));
      }, 2000));
  
      timeoutRefs.current.push(setTimeout(() => {
          store.updateSession(targetId, (prev) => ({
            activeStep: 3,
            terminalEntries: [...prev.terminalEntries, { id: 'l2'+Date.now(), type: 'log', icon: 'AlertCircle', colorClass: 'text-[#2aacb8]', text: "[Adversarial Critic]: Warning — over-abstraction may induce slight overhead. Proceeding with micro-benchmark validations. Consensus required." }]
          }));
      }, 4500));
  
      timeoutRefs.current.push(setTimeout(() => {
          store.updateSession(targetId, (prev) => ({
            activeStep: 4,
            terminalEntries: [...prev.terminalEntries, { id: 'l3'+Date.now(), type: 'log', icon: 'Layers', colorClass: 'text-[#cf8e6d]', text: "[Consensus Judge]: Validating trade-offs. Abstraction paradigm approved for enhanced maintainability. Synthesizing refactored Java outputs." }]
          }));
      }, 7000));
  
      timeoutRefs.current.push(setTimeout(() => {
        store.updateSession(targetId, (prev) => ({
          activeStep: 5,
          terminalEntries: [...prev.terminalEntries, { id: 'l4'+Date.now(), type: 'log', icon: 'CheckCircle2', colorClass: 'text-[#27c93f]', text: "[System]: Refactoring cycle complete. New AST generated and serialized successfully." }],
          refactoredOutput: INITIAL_REFACTORED
        }));
  
        timeoutRefs.current.push(setTimeout(() => {
          store.updateSession(targetId, {
            appState: 'done',
            showFlowchartModal: false
          });
        }, 1500));
      }, 9500));
    }
  }, [appState, activeStep, id, terminalEntries, store]); // eslint-disable-line

  const stopAnalysis = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
    updateLocal({
      appState: 'idle',
      activeStep: 0,
      showFlowchartModal: false
    });
  };

  if (!mounted) return null;

  return (
    <PanelGroup orientation="vertical" className="flex-1 gap-2">
      <Panel defaultSize={68} minSize={20} className="flex flex-col min-h-0">
        <PanelGroup orientation="horizontal" className="gap-2">
          <Panel defaultSize={50} minSize={20} className={`rounded-xl border overflow-hidden shadow-xl transition-colors duration-300
            ${isDark ? 'bg-jb-panel border-[#393b40]' : 'bg-white border-[#dfdfdf]'}`}>
            <Input 
              sourceCode={sourceCode} 
              setSourceCode={(val) => updateLocal({ sourceCode: val })} 
              sourceError={localSourceError} 
              setSourceError={setLocalSourceError}
              inputInstruction={inputInstruction}
              setInputInstruction={(val) => updateLocal({ inputInstruction: val })}
              inputError={localInputError}
              setInputError={setLocalInputError}
              startAnalysis={startAnalysis}
              stopAnalysis={stopAnalysis}
              appState={appState}
            />
          </Panel>
          
          <PanelResizeHandle className="w-[1px] bg-transparent hover:bg-jb-accent transition-all duration-200 cursor-col-resize z-20" />

          <Panel defaultSize={50} minSize={20} className={`rounded-xl border overflow-hidden shadow-xl transition-colors duration-300
            ${isDark ? 'bg-jb-panel border-[#393b40]' : 'bg-white border-[#dfdfdf]'}`}>
            <RefactoredOutput 
              refactoredOutput={refactoredOutput} 
              setRefactoredOutput={(val) => updateLocal({ refactoredOutput: val })}
              showFlowchartModal={showFlowchartModal} 
              setShowFlowchartModal={(val) => updateLocal({ showFlowchartModal: val })}
              activeStep={activeStep} 
              isTerminalCollapsed={isTerminalCollapsed}
              appState={appState}
            />
          </Panel>
        </PanelGroup>
      </Panel>

      <PanelResizeHandle className="h-[2px] shrink-0 bg-transparent hover:bg-jb-accent transition-all duration-200 cursor-row-resize z-20" />

      <Panel 
        panelRef={terminalPanelRef}
        defaultSize={32} 
        minSize={5} 
        collapsible={true}
        collapsedSize={40}
        onResize={(panelSize) => {
          const isNowCollapsed = panelSize.inPixels <= 42; 
          if (isNowCollapsed !== isTerminalCollapsed) {
            updateLocal({ isTerminalCollapsed: isNowCollapsed });
          }
        }}
        className={`rounded-xl border overflow-hidden shadow-xl transition-all duration-300 flex flex-col
          ${isDark ? 'bg-jb-panel border-[#393b40]' : 'bg-white border-[#dfdfdf] shadow-slate-200/50'}`}
        id="terminal-panel"
      >
        <Terminal 
          activeStep={activeStep} 
          isTerminalCollapsed={isTerminalCollapsed} 
          setIsTerminalCollapsed={(val) => updateLocal({ isTerminalCollapsed: val })}
          terminalEndRef={terminalEndRef} 
          terminalEntries={terminalEntries}
          appState={appState}
        />
      </Panel>
    </PanelGroup>
  );
}
