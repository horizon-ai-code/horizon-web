"use client"

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function HorizonLogo({ glowing = false }: { glowing?: boolean }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true; // Default to dark until mounted

  return (
    <div className={`relative flex items-center justify-center w-10 h-10 rounded-[14px] shadow-lg border overflow-hidden transition-all duration-700
      ${glowing ? 'border-cyan-400/50 shadow-[0_0_20px_rgba(0,229,255,0.3)]' : 'border-black/5 dark:border-white/10 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-[#111]'}`}>
      
      {mounted && (
        <Image 
          src={isDark ? "/logo-dark.png" : "/logo-light.png"} 
          alt="Horizon Logo" 
          width={40} 
          height={40} 
          className="z-10 object-contain p-1"
        />
      )}

      {/* Glow Effects */}
      <div className={`absolute w-16 h-[3px] bg-cyan-400 top-1/2 -translate-y-1/2 rounded-full transform -rotate-[15deg] z-20 transition-all duration-700 pointer-events-none
        ${glowing ? 'shadow-[0_0_15px_4px_rgba(0,229,255,0.6)] opacity-100 scale-110' : 'shadow-[0_0_8px_1px_rgba(0,229,255,0.3)] opacity-50'}`}></div>
      {glowing && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-cyan-400 rounded-full blur-[14px] opacity-40 z-0 animate-pulse pointer-events-none"></div>}
    </div>
  );
}
