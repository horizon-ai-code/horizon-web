"use client"

import { useRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface CodeEditorPanelProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  diffType?: "none" | "removed" | "added";
  showDiff?: boolean;
  bottomPadding?: string;
}

const renderHighlightedLine = (line: string, lineIdx: number, isDarkTheme: boolean, type = 'none') => {
  const keywords = ['public', 'private', 'class', 'int', 'return', 'static', 'void', 'new', 'if', 'else', 'for', 'while', 'double'];
  
  const bgClass = type === 'removed' 
    ? (isDarkTheme ? "bg-red-500/10 border-red-500/20" : "bg-red-50 border-red-200") 
    : type === 'added' 
    ? (isDarkTheme ? "bg-cyan-500/10 border-cyan-500/20" : "bg-cyan-50 border-cyan-200") 
    : "border-transparent";

  const content = (() => {
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*') || line.trim().startsWith('/**')) {
      return <span className={isDarkTheme ? "text-gray-500/70 italic h-6 leading-6 font-light" : "text-slate-400 italic h-6 leading-6 font-light"}>{line || ' '}</span>;
    }

    const words = line.split(/(\s+|\b)/);
    return words.map((word, i) => {
      if (keywords.includes(word)) return <span key={i} className={isDarkTheme ? "text-rose-400 font-medium" : "text-rose-600 font-medium"}>{word}</span>;
      if (['add', 'subtract', 'multiply', 'performAddition', 'performSubtraction', 'computeSum', 'computeDifference'].includes(word)) return <span key={i} className={isDarkTheme ? "text-sky-400" : "text-sky-600"}>{word}</span>;
      if (['Calculator'].includes(word)) return <span key={i} className={isDarkTheme ? "text-amber-300" : "text-amber-600"}>{word}</span>;
      if (!isNaN(Number(word)) && word.trim() !== '') return <span key={i} className={isDarkTheme ? "text-orange-300" : "text-orange-700"}>{word}</span>;
      return <span key={i} className={isDarkTheme ? "text-gray-300" : "text-slate-700"}>{word}</span>;
    });
  })();

  return (
    <div key={lineIdx} className={`whitespace-pre h-[24px] leading-[24px] px-4 -mx-4 transition-colors duration-300 border-l-[3px] ${bgClass}`}>
      {content}
    </div>
  );
};

export default function CodeEditorPanel({ value, onChange, placeholder, diffType = "none", showDiff = false, bottomPadding = '48px' }: CodeEditorPanelProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  };

  const lines = value.split('\n');

  const getLineDiffType = (line: string) => {
    if (!showDiff) return 'none';
    if (diffType === 'removed') {
      const removedTriggers = ['int add', 'int subtract', 'int multiply', 'return a + b', 'return a - b', 'return a * b'];
      if (removedTriggers.some(trigger => line.includes(trigger))) return 'removed';
    } else if (diffType === 'added') {
      const addedTriggers = ['/**', 'perform', 'compute'];
      if (addedTriggers.some(trigger => line.includes(trigger))) return 'added';
    }
    return 'none';
  };

  if (!mounted) return null;

  return (
    <div className="relative flex-1 flex min-h-0 font-mono text-[13.5px] overflow-hidden">
      <div 
        ref={gutterRef}
        className={`w-14 select-none flex flex-col border-r transition-colors duration-700 overflow-hidden shrink-0 z-10
          ${isDark ? 'bg-[#0a0a0c]/80 backdrop-blur-xl border-white/5 text-gray-600/70' : 'bg-slate-50/80 backdrop-blur-xl border-slate-100 text-slate-400'}`}
        style={{ paddingTop: '24px', paddingBottom: bottomPadding }}
      >
        {lines.map((line, i) => {
          const type = getLineDiffType(lines[i]);
          const isRemoved = type === 'removed';
          const isAdded = type === 'added';
          
          return (
            <div 
              key={i} 
              className={`h-[24px] leading-[24px] flex items-center justify-center transition-all duration-300
                ${isRemoved ? 'bg-red-500/10 text-red-400 font-medium' : 
                  isAdded ? 'bg-cyan-500/10 text-cyan-400 font-medium' : ''}`}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      <div className="relative flex-1 overflow-hidden h-full">
        <div 
          ref={preRef}
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
          style={{ lineHeight: '24px', padding: `24px 24px ${bottomPadding} 24px` }}
        >
          {lines.map((line, idx) => {
            const type = getLineDiffType(line);
            return renderHighlightedLine(line, idx, isDark, type);
          })}
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          spellCheck="false"
          placeholder={placeholder}
          className="absolute inset-0 w-full h-full bg-transparent resize-none outline-none border-none caret-cyan-400 overflow-auto text-transparent selection:bg-cyan-500/20 font-mono"
          style={{ 
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            whiteSpace: 'pre',
            lineHeight: '24px',
            letterSpacing: 'normal',
            display: 'block',
            padding: `24px 24px ${bottomPadding} 24px`
          }}
        />
      </div>
    </div>
  );
}
