"use client"

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, FolderTree, Search, GitBranch, Play, LayoutGrid, Settings2, Plus, MessageSquare, MoreVertical, Pencil, Trash } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock sessions for demonstration
const MOCK_SESSIONS = [
  { id: '1a2b3c4d', title: 'Refactor Input.tsx' },
  { id: '5e6f7g8h', title: 'Parse JSON Logic' }
];

export default function Sidebar() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const handleNewSession = () => {
    router.push(`/`);
  };

  const springConfig = { type: "spring" as const, stiffness: 450, damping: 40, mass: 0.8 };

  return (
    <motion.div 
      initial={false}
      animate={{ width: isOpen ? 240 : 48 }}
      transition={springConfig}
      className={`shrink-0 border-r flex flex-col z-20 overflow-hidden
      ${isDark ? 'border-jb-border/40 bg-jb-panel' : 'border-[#ebecf0] bg-[#f7f8fa]'}`}
    >
      
      {/* Top Menu Icon Corner - Aligns with Navbar Height */}
      <div className={`h-[44px] w-full flex items-center justify-start px-2 shrink-0 transition-colors duration-300 cursor-pointer`}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-md transition-colors cursor-pointer shrink-0
          ${isDark ? 'text-jb-text opacity-80 hover:bg-[#3e4045] hover:opacity-100' : 'text-[#080808] opacity-70 hover:bg-[#ebecf0] hover:opacity-100'}`}>
          <Menu size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Main Sidebar Area */}
      <div className={`flex flex-col w-full px-2 py-4 gap-2 flex-grow overflow-y-auto overflow-x-hidden border-b
        ${isDark ? 'border-jb-border/20' : 'border-[#ebecf0]/60'}`}>
        
        {/* New Session Button */}
        <button 
          onClick={handleNewSession}
          className={`w-full flex items-center gap-3 p-2 rounded-md transition-all duration-200 active:scale-[0.98]
            ${isOpen ? 'justify-start' : 'justify-center'}
            ${isDark 
              ? 'bg-[#3574f0]/10 text-[#3574f0] hover:bg-[#3574f0]/20 hover:ring-1 hover:ring-white/[0.05]' 
              : 'bg-[#3574f0]/10 text-[#3574f0] hover:bg-[#3574f0]/20 hover:ring-1 hover:ring-black/[0.05]'
            }`}
        >
           <Plus size={18} strokeWidth={2} className="shrink-0" />
           <AnimatePresence>
             {isOpen && (
               <motion.span
                 initial={{ opacity: 0, filter: "blur(4px)" }}
                 animate={{ opacity: 1, filter: "blur(0px)" }}
                 exit={{ opacity: 0, filter: "blur(4px)" }}
                 transition={springConfig}
                 className="text-[13px] font-medium whitespace-nowrap"
               >
                 New Session
               </motion.span>
             )}
           </AnimatePresence>
        </button>

        {/* Sessions List - Only visible when open */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={springConfig}
              className="flex flex-col gap-1 mt-2 overflow-hidden"
            >
               <div className={`px-2 py-1 text-[11px] font-medium uppercase tracking-wider ${isDark ? 'text-jb-text/50' : 'text-[#818594]'}`}>
                 Recent
               </div>

               {MOCK_SESSIONS.map((session) => (
                 <div 
                    key={session.id}
                    className={`group w-full flex items-center gap-3 p-2 rounded-md transition-all duration-200 cursor-pointer active:scale-[0.98] relative
                      justify-start
                      ${params.id === session.id ? (isDark ? 'bg-[#3e4045] text-jb-text ring-1 ring-white/[0.05]' : 'bg-[#ebecf0] text-[#080808] ring-1 ring-black/[0.05]') : ''}
                      ${isDark 
                        ? 'text-jb-text/70 hover:bg-[#3e4045] hover:text-jb-text hover:ring-1 hover:ring-white/[0.05]' 
                        : 'text-[#080808]/70 hover:bg-[#ebecf0] hover:text-[#080808] hover:ring-1 hover:ring-black/[0.05]'
                      }`}
                    onClick={() => router.push(`/${session.id}`)}
                  >
                   <MessageSquare size={18} strokeWidth={1.5} className="shrink-0" />
                   <div className="flex flex-col items-start whitespace-nowrap overflow-hidden pr-6">
                     <span className="text-[13px] text-ellipsis overflow-hidden w-full text-left">{session.title}</span>
                   </div>

                   {/* Dropdown Menu */}
                   <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                     <DropdownMenu>
                       <DropdownMenuTrigger className={`p-1 rounded-md outline-none transition-colors ${isDark ? 'hover:bg-black/20 text-jb-text/70 hover:text-jb-text' : 'hover:bg-black/5 text-[#080808]/70 hover:text-[#080808]'}`}>
                         <MoreVertical size={14} />
                       </DropdownMenuTrigger>
                       <DropdownMenuContent 
                         align="end" 
                         className={`w-40 border-0 shadow-xl ${isDark ? 'bg-[#2b2d30] text-jb-text' : 'bg-white text-[#080808] shadow-slate-200/50'}`}
                       >
                         <DropdownMenuItem className={`gap-2 cursor-pointer ${isDark ? 'focus:bg-[#3e4045]' : ''}`}>
                           <Pencil size={14} />
                           <span>Rename</span>
                         </DropdownMenuItem>
                         <DropdownMenuItem className="gap-2 text-red-500 focus:text-red-500 cursor-pointer focus:bg-red-500/10">
                           <Trash size={14} />
                           <span>Delete</span>
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </div>
                </div>
               ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1" />
    </motion.div>
  );
}
