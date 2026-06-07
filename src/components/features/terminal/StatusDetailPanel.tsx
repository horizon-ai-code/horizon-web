"use client";

import { AlertCircle } from "lucide-react";
import type { CurrentStatusDetail } from "@/types/glassbox";

interface StatusDetailPanelProps {
  detail: CurrentStatusDetail;
  isDark: boolean;
}

const TIER_LABELS: Record<string, string> = {
  TIER_1_SYNTAX: "Syntax Error",
  TIER_2_A_COMPLEXITY: "Complexity",
  TIER_2_B_BOUNDARY: "Boundary",
  TIER_2_C_INTENT_MATH: "Intent Mismatch",
  TIER_3_JUDGE: "Judge Rejected",
};

const MUTATION_LABELS: Record<string, string> = {
  ADD_METHOD: "Add Method",
  MODIFY_METHOD: "Modify Method",
  DELETE_METHOD: "Delete Method",
  EXTRACT_METHOD: "Extract Method",
  INLINE_METHOD: "Inline Method",
};

export default function StatusDetailPanel({ detail, isDark }: StatusDetailPanelProps) {
  const { intent, mutations, findings, judgeVerdict, judgeIssues, totalFaults, phaseAction } = detail;
  const muted = isDark ? "text-[#8d95a5]" : "text-[#888]";
  const border = isDark ? "border-[#393b40]" : "border-[#ddd]";
  const bg = isDark ? "bg-[#1e1f22]" : "bg-[#f2f2f2]";

  return (
    <div className={`px-4 py-2 text-[11px] leading-relaxed ${bg} border-t ${border}`}>
      {/* Intent detail */}
      {intent && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-1">
          {intent.category && <Tag label="Category" value={intent.category} color="#5a8cf8" isDark={isDark} />}
          {intent.intent && <Tag label="Intent" value={intent.intent} color="#3dd6c8" isDark={isDark} />}
          {intent.targetClass && <Tag label="Class" value={intent.targetClass} color="#e09c3b" isDark={isDark} />}
          {intent.targetMember && <Tag label="Member" value={intent.targetMember} color="#e09c3b" isDark={isDark} />}
          {intent.targetUnit && <Tag label="Unit" value={intent.targetUnit} color="#a78bfa" isDark={isDark} />}
        </div>
      )}

      {/* Mutation plan */}
      {mutations && mutations.length > 0 && (
        <div className="mb-1">
          <span className={`text-[10px] font-bold tracking-wide ${muted}`}>Mutations:</span>
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {mutations.map((m, i) => (
              <span key={i}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border"
                style={{
                  backgroundColor: isDark ? "#2b2d30" : "#fff",
                  borderColor: isDark ? "#393b40" : "#ddd",
                  color: isDark ? "#d9dee7" : "#333",
                }}
              >
                <span className="font-bold" style={{ color: "#3dd6c8" }}>
                  {MUTATION_LABELS[m.action] ?? m.action}
                </span>
                <span className={muted}>on</span>
                <code className={`text-[10px] ${isDark ? "text-[#56a8f5]" : "text-[#3574f0]"}`}>
                  {m.target}
                </code>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Validation findings */}
      {findings && findings.length > 0 && (
        <div className="mb-1">
          <span className={`text-[10px] font-bold tracking-wide ${muted}`}>
            {totalFaults ? `${totalFaults} Faults` : "Findings"}:
          </span>
          <div className="flex flex-col gap-0.5 mt-0.5">
            {findings.map((f, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className={`shrink-0 px-1 rounded text-[9px] font-bold
                  ${f.tier.includes("SYNTAX") ? "bg-red-500/15 text-red-400"
                    : f.tier.includes("COMPLEXITY") ? "bg-orange-500/15 text-orange-400"
                    : f.tier.includes("BOUNDARY") ? "bg-yellow-500/15 text-yellow-400"
                    : f.tier.includes("JUDGE") ? "bg-purple-500/15 text-purple-400"
                    : "bg-gray-500/15 text-gray-400"}`}>
                  {TIER_LABELS[f.tier] ?? f.tier}
                </span>
                <span className={isDark ? "text-[#c1c8d6]" : "text-[#555]"}>
                  {f.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Judge verdict */}
      {judgeVerdict && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[13px]">{judgeVerdict === "ACCEPT" ? "✅" : "❌"}</span>
          <span className={`text-[12px] font-bold ${judgeVerdict === "ACCEPT" ? "text-[#27c93f]" : "text-[#f93e3e]"}`}>
            {judgeVerdict}
          </span>
        </div>
      )}

      {/* Judge issues */}
      {judgeIssues && judgeIssues.length > 0 && (
        <div className="flex flex-col gap-0.5">
          {judgeIssues.map((issue, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <AlertCircle size={10} className="mt-0.5 shrink-0 text-orange-400" />
              <span>
                <span className="font-bold text-orange-400">{issue.issueType}</span>
                <span className={muted}> — {issue.description}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Fallback */}
      {!intent && !mutations && (!findings || findings.length === 0) && !judgeVerdict && (
        <span className={muted}>{phaseAction ?? "Processing..."}</span>
      )}
    </div>
  );
}

function Tag({ label, value, color, isDark }: { label: string; value: string; color: string; isDark: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border
      ${isDark ? "bg-[#2b2d30]" : "bg-white"}`}
      style={{ borderColor: `${color}44`, color: isDark ? "#d9dee7" : "#333" }}
    >
      <span className="font-bold" style={{ color }}>{label}</span>
      <code className="text-[10px]" style={{ color: isDark ? "#56a8f5" : "#3574f0" }}>{value}</code>
    </span>
  );
}
