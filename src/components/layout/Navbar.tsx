"use client"

import Image from "next/image";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useChatStore } from "@/store/useChatStore";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const orchestratorStatus = useChatStore((s) => s.orchestratorStatus);

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <nav className={`relative z-40 border-b flex justify-between items-center shrink-0 h-[44px] select-none transition-all duration-300
      ${isDark ? 'bg-jb-bg border-jb-border/50' : 'bg-[#f7f8fa] border-[#ebecf0]'} font-sans`}>
      
      {/* Left Section: Logo, Menu & Project Info */}
      <div className="flex items-center h-full">
        {/* Corner Logo */}
        <div className={`h-full px-4 flex items-center justify-center shrink-0 border-r transition-colors duration-300
          ${isDark ? 'border-jb-border/30' : 'border-[#ebecf0]'}`}>
           <Image 
             src={isDark ? "/logo-dark.png" : "/logo-light.png"} 
             alt="Logo" 
             width={20}
             height={20}
             className="h-[20px] w-auto transition-opacity duration-300 opacity-90 hover:opacity-100"
           />
        </div>

        <button aria-label="Horizon AI" className={`h-full px-3 flex items-center gap-1.5 text-[13px] font-semibold tracking-wide transition-colors cursor-default
          ${isDark ? 'text-jb-text hover:bg-jb-panel' : 'text-[#080808] hover:bg-[#ebecf0]'}`}>
          Horizon AI
        </button>
        <button aria-label="Refactoring Studio" className={`h-full px-3 flex items-center gap-1.5 text-[13px] font-medium transition-colors cursor-default
          ${isDark ? 'text-jb-text opacity-80 hover:bg-jb-panel hover:opacity-100' : 'text-[#080808] opacity-60 hover:bg-[#ebecf0] hover:opacity-100'}`}>
          Refactoring Studio
        </button>
      </div>

      {/* Center Section: Placeholder if needed, currently removed for minimal look */}
      <div className="flex-1" />

      {/* Right Section: Tools & Window Controls */}
      <div className="flex items-center h-full">
        <div className="flex items-center px-4 h-full gap-3">
          {/* Orchestrator Connection Status */}
          <div className="group relative flex items-center">
            <div className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
              orchestratorStatus === "connected" ? "bg-emerald-500" :
              orchestratorStatus === "connecting" ? "bg-amber-500 animate-pulse" :
              "bg-red-500"
            }`} />
            <div className={`
              absolute right-0 top-full mt-2 px-2.5 py-1.5 text-[11px] font-medium
              whitespace-nowrap rounded border opacity-0 group-hover:opacity-100
              transition-opacity pointer-events-none z-50
              ${isDark ? 'bg-jb-panel border-jb-border/50 text-jb-text' : 'bg-white border-[#ebecf0] text-[#080808]'}
            `}>
              Orchestrator: {
                orchestratorStatus === "connected" ? "Connected" :
                orchestratorStatus === "connecting" ? "Reconnecting..." :
                "Disconnected"
              }
            </div>
          </div>
          <ThemeToggle />
        </div>
        
      </div>

    </nav>
  );
}
