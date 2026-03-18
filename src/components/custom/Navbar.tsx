"use client"

import { Settings, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import HorizonLogo from "./HorizonLogo";
import { useAppContext } from "@/context/AppContext";

export default function Navbar() {
  const { appState } = useAppContext();

  return (
    <nav className="relative z-40 border-b transition-colors duration-700 px-8 py-3.5 flex justify-between items-center shrink-0 h-[70px] bg-white/60 border-slate-200/60 dark:bg-[#000000]/40 dark:border-white/[0.08] backdrop-blur-2xl shadow-sm dark:shadow-none">
      <div className="flex items-center gap-5">
        <HorizonLogo glowing={appState === "analyzing"} />
        <div className="flex flex-col">
          <h1 className="text-xl font-poppins font-bold tracking-tight flex items-center gap-2.5 transition-colors duration-700 text-slate-900 dark:text-white">
            Horizon AI 
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ring-1 transition-colors duration-700 bg-cyan-50 text-cyan-600 ring-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:ring-cyan-400/30">Java</span>
          </h1>
          <p className="text-[10px] font-medium tracking-widest uppercase opacity-60 transition-colors duration-700 text-slate-500 dark:text-gray-400">Multi-Agent Refactoring Studio</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="w-px h-6 transition-colors duration-700 bg-slate-200 dark:bg-white/10"></div>
        <button className="p-2.5 rounded-full transition-all duration-300 ring-1 hover:bg-slate-50 ring-slate-200 text-slate-500 hover:text-slate-900 dark:hover:bg-white/5 dark:ring-white/5 dark:text-gray-400 dark:hover:text-white">
          <Settings size={16} />
        </button>
        <div className="w-10 h-10 ml-2 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 p-[2px] cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-shadow">
          <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden transition-colors duration-700 bg-white dark:bg-[#0a0a0a]">
            <User size={16} className="text-cyan-600 dark:text-gray-300" />
          </div>
        </div>
      </div>
    </nav>
  );
}
