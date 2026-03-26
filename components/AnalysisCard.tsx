"use client";

import type { TwitterAnalysis, RedditAnalysis, XHSAnalysis } from "@/lib/types";

// ─── Score Badge ─────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  let color = "#C44B3F";
  if (score >= 8) color = "#2D8F5E";
  else if (score >= 5) color = "#C4960A";

  return (
    <span
      style={{
        fontFamily: "var(--font-serif), var(--font-noto-serif-sc), serif",
        fontSize: "22px",
        fontWeight: 500,
        color,
        lineHeight: 1,
      }}
    >
      {score}
      <span
        style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "11px",
          color: "#9C958D",
          fontWeight: 400,
        }}
      >
        /10
      </span>
    </span>
  );
}

// ─── Apply Button ─────────────────────────────────────────────────

function ApplyButton({
  label,
  applied,
  onClick,
}: {
  label: string;
  applied: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={applied}
      style={{
        fontFamily: "var(--font-mono), monospace",
        fontSize: "11px",
        padding: "3px 8px",
        borderRadius: "4px",
        backgroundColor: applied ? "rgba(45,143,94,0.1)" : "#F2EDE7",
        color: applied ? "#2D8F5E" : "#6B6560",
        border: `1px solid ${applied ? "rgba(45,143,94,0.3)" : "#E0D9CF"}`,
        cursor: applied ? "default" : "pointer",
        whiteSpace: "nowrap" as const,
        transition: "all 0.15s ease",
        flexShrink: 0,
      }}
    >
      {applied ? "✓ Applied" : label}
    </button>
  );
}

// ─── Warning ─────────────────────────────────────────────────────

function Warning({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "6px",
        backgroundColor: "rgba(196,150,10,0.08)",
        border: "1px solid rgba(196,150,10,0.2)",
        borderRadius: "6px",
        padding: "7px 10px",
        fontSize: "12px",
        lineHeight: 1.5,
        color: "#6B6560",
        fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
      }}
    >
      <span style={{ flexShrink: 0, color: "#C4960A" }}>⚠</span>
      <span>{text}</span>
    </div>
  );
}

// ─── Suggestion Row ───────────────────────────────────────────────

function SuggestionRow({
  label,
  value,
  applyLabel,
  applied,
  onApply,
}: {
  label: string;
  value: string;
  applyLabel: string;
  applied: boolean;
  onApply: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
        <span
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "10px",
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
            color: "#9C958D",
          }}
        >
          {label}
        </span>
        <ApplyButton label={applyLabel} applied={applied} onClick={onApply} />
      </div>
      <p
        style={{
          fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
          fontSize: "12px",
          lineHeight: 1.6,
          color: "#2C2C2C",
          backgroundColor: "#F2EDE7",
          borderRadius: "6px",
          padding: "8px 10px",
        }}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Card shell ───────────────────────────────────────────────────

function AnalysisShell({
  platformName,
  platformColor,
  score,
  scoreReasoning,
  formatAdvice,
  warnings,
  children,
}: {
  platformName: string;
  platformColor: string;
  score: number;
  scoreReasoning: string;
  formatAdvice: string;
  warnings: string[];
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E0D9CF",
        borderTop: `3px solid ${platformColor}`,
        borderRadius: "10px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "0",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 14px",
          borderBottom: "1px solid #E0D9CF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif), var(--font-noto-serif-sc), serif",
            fontSize: "15px",
            fontWeight: 500,
            color: platformColor,
          }}
        >
          {platformName}
        </span>
        <ScoreBadge score={score} />
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Score reasoning */}
        <p
          style={{
            fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
            fontSize: "12px",
            lineHeight: 1.6,
            color: "#6B6560",
          }}
        >
          {scoreReasoning}
        </p>

        {/* Format advice */}
        <div
          style={{
            backgroundColor: "rgba(74,124,89,0.07)",
            borderRadius: "5px",
            padding: "6px 10px",
            fontSize: "12px",
            color: "#4A7C59",
            fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
          }}
        >
          {formatAdvice}
        </div>

        {/* Suggestions */}
        {children}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {warnings.map((w, i) => (
              <Warning key={i} text={w} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Twitter Analysis Card ────────────────────────────────────────

export function TwitterAnalysisCard({
  analysis,
  appliedKeys,
  onApply,
}: {
  analysis: TwitterAnalysis;
  appliedKeys: Set<string>;
  onApply: (key: string, value: string, action: "prepend" | "append" | "store") => void;
}) {
  return (
    <AnalysisShell
      platformName="Twitter / X"
      platformColor="#1D9BF0"
      score={analysis.platform_score}
      scoreReasoning={analysis.score_reasoning}
      formatAdvice={analysis.format_advice}
      warnings={analysis.warnings}
    >
      <SuggestionRow
        label="Hook"
        value={analysis.suggested_hook}
        applyLabel="Apply hook"
        applied={appliedKeys.has("twitter_hook")}
        onApply={() => onApply("twitter_hook", analysis.suggested_hook, "prepend")}
      />
      <SuggestionRow
        label="CTA"
        value={analysis.suggested_cta}
        applyLabel="Apply CTA"
        applied={appliedKeys.has("twitter_cta")}
        onApply={() => onApply("twitter_cta", analysis.suggested_cta, "append")}
      />
    </AnalysisShell>
  );
}

// ─── Reddit Analysis Card ─────────────────────────────────────────

export function RedditAnalysisCard({
  analysis,
  appliedKeys,
  onApply,
}: {
  analysis: RedditAnalysis;
  appliedKeys: Set<string>;
  onApply: (key: string, value: string, action: "prepend" | "append" | "store") => void;
}) {
  return (
    <AnalysisShell
      platformName="Reddit"
      platformColor="#FF4500"
      score={analysis.platform_score}
      scoreReasoning={analysis.score_reasoning}
      formatAdvice={analysis.format_advice}
      warnings={analysis.warnings}
    >
      <SuggestionRow
        label="Title"
        value={analysis.suggested_title}
        applyLabel="Apply title"
        applied={appliedKeys.has("reddit_title")}
        onApply={() => onApply("reddit_title", analysis.suggested_title, "store")}
      />
      <SuggestionRow
        label="Hook"
        value={analysis.suggested_hook}
        applyLabel="Apply hook"
        applied={appliedKeys.has("reddit_hook")}
        onApply={() => onApply("reddit_hook", analysis.suggested_hook, "prepend")}
      />
      <SuggestionRow
        label="CTA"
        value={analysis.suggested_cta}
        applyLabel="Apply CTA"
        applied={appliedKeys.has("reddit_cta")}
        onApply={() => onApply("reddit_cta", analysis.suggested_cta, "append")}
      />
      {analysis.suggested_subreddits.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "4px" }}>
          {analysis.suggested_subreddits.map((sub) => (
            <span
              key={sub}
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "12px",
                backgroundColor: "rgba(255,69,0,0.07)",
                color: "#FF4500",
                border: "1px solid rgba(255,69,0,0.2)",
              }}
            >
              r/{sub}
            </span>
          ))}
        </div>
      )}
    </AnalysisShell>
  );
}

// ─── Xiaohongshu Analysis Card ────────────────────────────────────

export function XHSAnalysisCard({
  analysis,
  appliedKeys,
  onApply,
}: {
  analysis: XHSAnalysis;
  appliedKeys: Set<string>;
  onApply: (key: string, value: string, action: "prepend" | "append" | "store") => void;
}) {
  return (
    <AnalysisShell
      platformName="小红书"
      platformColor="#FF2442"
      score={analysis.platform_score}
      scoreReasoning={analysis.score_reasoning}
      formatAdvice={analysis.format_advice}
      warnings={analysis.warnings}
    >
      <SuggestionRow
        label="标题"
        value={analysis.suggested_title}
        applyLabel="Apply 标题"
        applied={appliedKeys.has("xhs_title")}
        onApply={() => onApply("xhs_title", analysis.suggested_title, "store")}
      />
      <SuggestionRow
        label="开头 Hook"
        value={analysis.suggested_hook}
        applyLabel="Apply hook"
        applied={appliedKeys.has("xhs_hook")}
        onApply={() => onApply("xhs_hook", analysis.suggested_hook, "prepend")}
      />
      <SuggestionRow
        label="结尾 CTA"
        value={analysis.suggested_cta}
        applyLabel="Apply CTA"
        applied={appliedKeys.has("xhs_cta")}
        onApply={() => onApply("xhs_cta", analysis.suggested_cta, "append")}
      />
      {analysis.suggested_keywords.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "4px" }}>
          {analysis.suggested_keywords.map((kw) => (
            <span
              key={kw}
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "12px",
                backgroundColor: "rgba(255,36,66,0.07)",
                color: "#FF2442",
                border: "1px solid rgba(255,36,66,0.2)",
                fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
              }}
            >
              #{kw}
            </span>
          ))}
        </div>
      )}
    </AnalysisShell>
  );
}
