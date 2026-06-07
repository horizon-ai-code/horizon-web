"use client"

import { useTheme } from "next-themes";
import { Copy, Layers, X, FileCode2, Cpu, CheckCircle2, Loader2, Clock } from "lucide-react";

import CodeEditorPanel from "@/components/features/editor/CodeEditorPanel";
import type { AppState, OrchestrationResult } from "@/types/session";
import type { GlassboxState } from "@/types/glassbox";
import React, { useState, useEffect } from "react";
import RefactoringReplay from "@/components/features/output/RefactoringReplay";
import InsightsPanel from "@/components/features/output/InsightsPanel";

interface RefactoredOutputProps {
  refactoredOutput: string;
  setRefactoredOutput: (val: string) => void;
  showFlowchartModal: boolean;
  setShowFlowchartModal: (val: boolean) => void;
  activeStep: number;
  isTerminalCollapsed: boolean;
  appState: AppState;
  orchestrationResult: OrchestrationResult;
  glassboxState?: GlassboxState;
}

type PhaseNodeStatus = "waiting" | "active" | "done";

interface PhaseNodeProps {
  phaseNum: number;
  name: string;
  agent: string;
  icon: React.ElementType;
  status: PhaseNodeStatus;
  colorCode: string;
  duration?: string;
  detail?: string;
  progress?: { completed: number; total: number };
}

function PhaseNode({ phaseNum, name, agent, icon: Icon, status, colorCode, duration, detail, progress }: PhaseNodeProps) {
  const isActive = status === "active";
  const isDone = status === "done";
  const dimmed = status === "waiting";

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-2.5 w-[108px] h-[108px] rounded-xl transition-all duration-500
        ${isActive
          ? "bg-jb-bg ring-2 scale-105 z-10"
          : isDone
          ? "bg-jb-panel/80 ring-1"
          : "bg-jb-panel/30 ring-1 opacity-50"
        }`}
      style={{
        borderColor: isActive ? `${colorCode}88` : (isDone ? `${colorCode}44` : "transparent"),
        boxShadow: isActive ? `0 0 24px ${colorCode}22, inset 0 0 20px ${colorCode}08` : "none",
      }}
    >
      {/* Phase dot */}
      <div
        className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full transition-all duration-500
          ${isActive ? "animate-pulse" : ""}`}
        style={{
          backgroundColor: isDone ? "#27c93f" : colorCode,
          boxShadow: isActive ? `0 0 8px ${colorCode}` : "none",
          opacity: dimmed ? 0.4 : 1,
        }}
      />

      {/* Agent icon */}
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-lg mb-1 transition-all duration-500
          ${isActive ? "scale-110" : ""}`}
        style={{
          backgroundColor: `${colorCode}18`,
          color: isActive || isDone ? colorCode : "#888",
        }}
      >
        <Icon size={18} strokeWidth={1.5} />
      </div>

      {/* Agent name */}
      <span className={`text-[10px] font-bold tracking-wide leading-tight
        ${dimmed ? "text-jb-text-muted" : (isActive ? "text-jb-text" : "text-jb-text/80")}`}>
        {agent}
      </span>

      {/* Phase name */}
      <span className={`text-[8px] font-medium leading-tight ${dimmed ? "text-jb-text-muted/60" : "text-jb-text-muted"}`}>
        {name}
      </span>

      {/* Duration */}
      {duration && (
        <span className={`text-[8px] font-mono mt-0.5 ${isActive ? "text-jb-accent/80" : "text-jb-text-muted/60"}`}>
          {duration}
        </span>
      )}

      {/* Detail line (intent, verdict, etc.) */}
      {detail && (
        <span className="text-[8px] font-bold leading-tight mt-0.5 text-center px-1 truncate max-w-full"
          style={{ color: isActive ? colorCode : (isDone ? "#27c93f" : "#888") }}>
          {detail}
        </span>
      )}

      {/* Generator progress bar */}
      {progress && (
        <div className="w-full px-2 mt-0.5">
          <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: `${colorCode}22` }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((progress.completed / progress.total) * 100)}%`,
                backgroundColor: colorCode,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseConnector({ status }: { status: "waiting" | "active" | "done" }) {
  const isDone = status === "done" || status === "active";
  return (
    <div className="w-3 md:w-4 h-[2px] shrink-0 relative overflow-hidden rounded-full mx-0.5">
      <div className="absolute inset-0 bg-jb-border/30" />
      <div
        className={`absolute h-full left-0 transition-all duration-700 ${isDone ? "w-full" : "w-0"}`}
        style={{ backgroundColor: status === "active" ? "#548af7" : "#27c93f" }}
      />
    </div>
  );
}

const PHASES = [
  { num: 1, name: "Baseline", agent: "Validator", icon: Cpu, colorCode: "#56a8f5" },
  { num: 2, name: "Strategy", agent: "Planner", icon: Cpu, colorCode: "#5a8cf8" },
  { num: 3, name: "Execution", agent: "Generator", icon: Layers, colorCode: "#3dd6c8" },
  { num: 4, name: "Validation", agent: "Validator", icon: FileCode2, colorCode: "#e09c3b" },
  { num: 5, name: "Audit", agent: "Judge", icon: CheckCircle2, colorCode: "#4ec97e" },
  { num: 6, name: "Finalize", agent: "System", icon: Clock, colorCode: "#a78bfa" },
];

const OrchestrationFlowchart = ({ activeStep, glassboxState }: { activeStep: number; glassboxState?: GlassboxState }) => {
  const gs = glassboxState;
  const currentPhase = gs?.currentPhase ?? 0;
  const currentAgent = gs?.currentAgent;
  const strategyIter = gs?.strategyIteration ?? 1;
  const hasRetry = strategyIter > 1;
  const phaseDurations = gs?.phaseDurations ?? [];

  const getDuration = (phaseNum: number): string | undefined => {
    const entry = phaseDurations.find((d) => d.phase === phaseNum);
    return entry ? `${(entry.durationMs / 1000).toFixed(1)}s` : undefined;
  };

  const getDetail = (phaseNum: number): string | undefined => {
    if (!gs?.currentDetail) return undefined;
    const cd = gs.currentDetail;
    switch (phaseNum) {
      case 2: return cd.intent?.intent;
      case 3: return cd.generatorProgress
        ? `${cd.generatorProgress.completed}/${cd.generatorProgress.total}`
        : undefined;
      case 4: return gs.validationFaultCount !== null && gs.validationFaultCount > 0
        ? `⚠ ${gs.validationFaultCount}`
        : undefined;
      case 5: return gs.judgeDecision ?? undefined;
      default: return undefined;
    }
  };

  const getStatus = (phaseNum: number): PhaseNodeStatus => {
    if (phaseNum < currentPhase) return "done";
    if (phaseNum === currentPhase) return "active";
    return "waiting";
  };

  const getProgress = (phaseNum: number): { completed: number; total: number } | undefined => {
    if (phaseNum === 3 && gs?.currentDetail?.generatorProgress) {
      return gs.currentDetail.generatorProgress;
    }
    return undefined;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-row items-center justify-center w-full max-w-5xl relative">
        {/* Retry loop arrow */}
        {hasRetry && (
          <svg
            className="absolute -top-5 left-[22%] w-[56%] h-8 z-20 pointer-events-none"
            viewBox="0 0 100 20"
            fill="none"
          >
            <path
              d="M 10 15 Q 50 -5 90 15"
              stroke="#f4bf4f"
              strokeWidth="1.5"
              strokeDasharray="3 2"
              fill="none"
            />
            <defs>
              <marker id="retryArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#f4bf4f" />
              </marker>
            </defs>
            <path
              d="M 10 15 Q 50 -5 90 15"
              stroke="#f4bf4f"
              strokeWidth="1.5"
              fill="none"
              markerEnd="url(#retryArrow)"
            />
            <text x="50" y="6" textAnchor="middle" className="text-[5px] font-bold" fill="#f4bf4f">
              Retry {strategyIter}/{gs?.maxStrategyIterations ?? 3}
            </text>
          </svg>
        )}

        {PHASES.map((p, i) => (
          <React.Fragment key={p.num}>
            <PhaseNode
              phaseNum={p.num}
              name={p.name}
              agent={p.agent}
              icon={p.icon}
              status={getStatus(p.num)}
              colorCode={p.colorCode}
              duration={getDuration(p.num)}
              detail={getDetail(p.num)}
              progress={getProgress(p.num)}
            />
            {i < PHASES.length - 1 && (
              <PhaseConnector status={getStatus(p.num + 1)} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default function RefactoredOutput({
  refactoredOutput,
  setRefactoredOutput,
  showFlowchartModal,
  setShowFlowchartModal,
  activeStep,
  isTerminalCollapsed,
  appState,
  orchestrationResult,
  glassboxState,
}: RefactoredOutputProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // 1. ADD 'output' state and make it the default
  const [rightPanelMode, setRightPanelMode] = useState<'output' | 'replay' | 'insights'>('output');

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const handleCopy = async () => {
    const textToCopy = refactoredOutput || "// Awaiting code generation...";
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  if (!mounted) return null;

  return (
    <div className={`flex flex-col min-h-0 overflow-hidden bg-jb-panel transition-all duration-300 h-full
      ${isTerminalCollapsed ? 'flex-none h-[48px]' : (appState === 'done' ? 'flex-1' : 'flex-[1.5]')}`}>
      
      <div className={`flex items-center justify-between border-b h-[40px] shrink-0 relative z-20 transition-colors duration-300 pr-2
        ${isDark ? 'bg-jb-bg border-jb-border' : 'bg-[#f7f8fa] border-[#ebecf0]'}`}>
        
        <div className="flex items-center h-full pt-1.5 pb-1 px-2 gap-1 overflow-x-auto custom-chat-scrollbar">


          
          <button 
            onClick={() => setRightPanelMode('insights')}
            role="tab"
            aria-selected={rightPanelMode === 'insights'}
            className={`h-full px-3 flex items-center gap-2 text-[12px] font-medium transition-all cursor-pointer rounded-md 
              ${rightPanelMode === 'insights' 
                ? (isDark ? 'bg-jb-panel text-jb-text border-[#393b40]/50 shadow-sm' : 'bg-white text-[#080808] border-[#dfdfdf] shadow-sm') 
                : (isDark ? 'text-jb-text opacity-70 hover:opacity-100 hover:bg-jb-panel/40 border-transparent' : 'text-[#818594] hover:bg-[#ebecf0] hover:text-[#080808]')}`}
          >
            Insights.md
          </button>
          
          <button 
            onClick={() => setRightPanelMode('output')}
            role="tab"
            aria-selected={rightPanelMode === 'output'}
            className={`h-full px-3 flex items-center gap-2 text-[12px] font-medium transition-all cursor-pointer rounded-md 
              ${rightPanelMode === 'output' 
                ? (isDark ? 'bg-jb-panel text-jb-text border-[#393b40]/50 shadow-sm' : 'bg-white text-[#080808] border-[#dfdfdf] shadow-sm') 
                : (isDark ? 'text-jb-text opacity-70 hover:opacity-100 hover:bg-jb-panel/40 border-transparent' : 'text-[#818594] hover:bg-[#ebecf0] hover:text-[#080808]')}`}
          >
            RefactoredOutput.java
          </button>
        </div>
        
        <div className="flex items-center gap-2 pr-4">
          {appState === 'done' && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-sm transition-transform flex items-center gap-1.5 duration-300
              ${isDark ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-green-500' : 'bg-emerald-600'}`}></div> Ready
            </span>
          )}
          <button 
            onClick={handleCopy}
            className={`p-1.5 rounded-md transition-all ring-1 cursor-pointer hover:scale-110 active:scale-90 ring-transparent
              ${isDark ? 'text-jb-text-muted hover:text-jb-text hover:bg-jb-border/40 hover:ring-jb-border' : 'text-[#818594] hover:text-[#080808] hover:bg-[#ebecf0] hover:ring-[#dbdbdb]'}`}
            title="Copy Code"
            aria-label="Copy Code"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>

      <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden z-10">
        {appState === 'idle' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 opacity-100 pointer-events-none z-10 transition-colors duration-300">
            <div className={`flex items-center justify-center w-[88px] h-[88px] rounded-[24px] mb-6 shadow-2xl ring-1 transition-all duration-300
              ${isDark ? 'bg-jb-bg ring-jb-border' : 'bg-[#f7f8fa] ring-[#ebecf0]'}`}>
              <Layers size={36} className={isDark ? "text-jb-accent/60" : "text-[#3574f0]/60"} strokeWidth={1.5} />
            </div>
            <p className={`text-[15px] font-semibold transition-colors ${isDark ? 'text-jb-text' : 'text-[#080808]'}`}>
              Awaiting source code analysis
            </p>
            <p className={`text-[13px] mt-2 font-medium transition-colors ${isDark ? 'text-jb-text-muted' : 'text-[#818594]'}`}>
              Output will be generated by the Swarm
            </p>
          </div>
        ) : appState === 'waiting' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none z-10 transition-colors duration-300">
             <div className={`flex items-center justify-center w-[88px] h-[88px] rounded-[32px] mb-6 shadow-2xl ring-1 transition-all duration-300 relative
                ${isDark ? 'bg-jb-bg ring-jb-border' : 'bg-[#f7f8fa] ring-[#ebecf0]'}`}>
                <Clock size={36} className="text-yellow-400 animate-pulse" strokeWidth={1.5} />
                <div className="absolute inset-0 bg-yellow-400/10 blur-2xl rounded-full scale-150 animate-pulse"></div>
             </div>
             <p className={`text-[15px] font-semibold transition-colors ${isDark ? 'text-jb-text' : 'text-[#080808]'}`}>
                Server Busy
             </p>
             <p className={`text-[13px] mt-2 font-medium transition-colors ${isDark ? 'text-jb-text-muted' : 'text-[#818594]'}`}>
                Waiting for other requests to complete...
             </p>
          </div>
        ) : appState === 'analyzing' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none z-10 transition-colors duration-300">
             <div className={`flex items-center justify-center w-[88px] h-[88px] rounded-[32px] mb-6 shadow-2xl ring-1 transition-all duration-300 relative
                ${isDark ? 'bg-jb-bg ring-jb-border' : 'bg-[#f7f8fa] ring-[#ebecf0]'}`}>
                <Loader2 size={36} className="text-jb-accent animate-spin" strokeWidth={1.5} />
                <div className="absolute inset-0 bg-jb-accent/10 blur-2xl rounded-full scale-150 animate-pulse"></div>
             </div>
             <p className={`text-[15px] font-semibold transition-colors ${isDark ? 'text-jb-text' : 'text-[#080808]'}`}>
                Synthesis Engine Active
             </p>
             <p className={`text-[13px] mt-2 font-medium transition-colors ${isDark ? 'text-jb-text-muted' : 'text-[#818594]'}`}>
                Generating consensus from Swarm nodes...
             </p>
          </div>
        ) : (
          // 3. RENDER LOGIC UPDATE
          rightPanelMode === 'output' ? (
             <CodeEditorPanel 
               value={refactoredOutput} 
               onChange={setRefactoredOutput} 
               highlightLines={{
                 added: orchestrationResult.diffHighlights.added,
                 removed: orchestrationResult.diffHighlights.removed,
               }}
               showDiff={appState === 'done'}
               placeholder="" 
               bottomPadding="48px"
             />
          ) : rightPanelMode === 'replay' ? (
             <RefactoringReplay replaySteps={orchestrationResult.replaySteps} />
          ) : (
             <InsightsPanel 
               metrics={orchestrationResult.metrics} 
               summary={orchestrationResult.summary} 
               planner_model={orchestrationResult.planner_model}
               generator_model={orchestrationResult.generator_model}
               judge_model={orchestrationResult.judge_model}
             />
          )
        )}

        {showFlowchartModal && (appState === 'analyzing' || appState === 'done') && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-jb-panel/95 backdrop-blur-2xl">
             <div className="flex justify-end p-5 absolute top-0 right-0 w-full z-40">
                {appState === 'done' && <button onClick={() => setShowFlowchartModal(false)} className="p-2 rounded-full ring-1 transition-transform cursor-pointer bg-secondary hover:bg-secondary/80 ring-border text-foreground"><X size={18} /></button>}
             </div>
             
             <OrchestrationFlowchart activeStep={activeStep} glassboxState={glassboxState} />
          </div>
        )}
      </div>
    </div>
  );
}