"use client"

import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-[60px] h-8 rounded-full bg-slate-100 dark:bg-[#0a0a0a]" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div 
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`w-[60px] h-8 rounded-full relative cursor-pointer transition-all duration-500 ring-1 overflow-hidden
        ${isDark ? 'bg-[#0a0a0a] ring-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]' : 'bg-slate-100 ring-slate-200/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)]'}`}
    >
      <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none">
        <Sun size={13} className={`transition-all duration-500 ${isDark ? 'opacity-0 scale-50' : 'opacity-100 scale-100 text-slate-500'}`} />
        <Moon size={13} className={`transition-all duration-500 ${isDark ? 'opacity-100 scale-100 text-cyan-400' : 'opacity-0 scale-50'}`} />
      </div>
      <div 
        className={`w-6 h-6 rounded-full absolute top-1/2 -translate-y-1/2 transition-all duration-500 transform shadow-md ring-1
          ${isDark ? 'left-1 bg-gradient-to-br from-gray-200 to-gray-400 ring-white/20 translate-x-0' : 'left-[32px] bg-gradient-to-br from-slate-700 to-slate-900 ring-black/10 translate-x-0'}`}
      />
    </div>
  );
}
