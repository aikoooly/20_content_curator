"use client";

import { useState, useEffect, useRef } from "react";
import LoadingPulse from "./LoadingPulse";
import { TwitterCard, RedditCard, XiaohongshuCard } from "./ResultCard";
import { TwitterAnalysisCard, RedditAnalysisCard, XHSAnalysisCard } from "./AnalysisCard";

function PlatformSkeleton({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D9CF", borderLeft: `3px solid ${color}`, borderRadius: "12px", padding: "18px 24px", display: "flex", alignItems: "center", gap: "10px" }}>
      <span className="spinner" style={{ borderColor: "rgba(0,0,0,0.1)", borderTopColor: color }} />
      <span style={{ fontFamily: "var(--font-serif), var(--font-noto-serif-sc), serif", fontSize: "15px", color: color }}>{label}</span>
      <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "12px", color: "#9C958D" }}>Adapting...</span>
    </div>
  );
}

function PlatformError({
  label,
  message,
  rawResponse,
  parseError,
  onRetry,
}: {
  label: string;
  message: string;
  rawResponse?: string;
  parseError?: string;
  onRetry: () => void;
}) {
  return (
    <div style={{ backgroundColor: "rgba(196,75,63,0.06)", border: "1px solid rgba(196,75,63,0.2)", borderRadius: "10px", padding: "14px 18px", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <span style={{ fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif", fontSize: "13px", color: "#C44B3F", fontWeight: 600 }}>
          {label}: {message}
        </span>
        <button
          onClick={onRetry}
          style={{ fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif", fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: "6px", backgroundColor: "rgba(196,75,63,0.1)", color: "#C44B3F", border: "1px solid rgba(196,75,63,0.25)", cursor: "pointer", whiteSpace: "nowrap" as const, flexShrink: 0 }}
        >
          重试
        </button>
      </div>
      {parseError && (
        <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: "11px", color: "#C44B3F", backgroundColor: "rgba(196,75,63,0.05)", borderRadius: "4px", padding: "6px 8px" }}>
          Parse error: {parseError}
        </div>
      )}
      {rawResponse && (
        <details>
          <summary style={{ fontFamily: "var(--font-mono), monospace", fontSize: "11px", color: "#9C958D", cursor: "pointer" }}>
            Claude raw response ({rawResponse.length} chars)
          </summary>
          <pre style={{ fontFamily: "var(--font-mono), monospace", fontSize: "11px", color: "#6B6560", backgroundColor: "#F2EDE7", borderRadius: "6px", padding: "10px", marginTop: "6px", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {rawResponse}
          </pre>
        </details>
      )}
    </div>
  );
}
import type {
  AnalysisResult, AdaptResult, AppliedSuggestions,
  TwitterAdapt, RedditAdapt, XHSAdapt,
} from "@/lib/types";

interface ComposeTabProps {
  strategy: string;
  prefillDraft?: string;
  prefillAdaptResult?: AdaptResult;
  onGenerated: (draft: string, result: AdaptResult) => void;
}

export default function ComposeTab({
  strategy,
  prefillDraft,
  prefillAdaptResult,
  onGenerated,
}: ComposeTabProps) {
  const [draft, setDraft] = useState(prefillDraft ?? "");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Per-platform adapt state
  const [twitterResult, setTwitterResult] = useState<TwitterAdapt | null>(
    prefillAdaptResult?.twitter ?? null
  );
  const [redditResult, setRedditResult] = useState<RedditAdapt | null>(
    prefillAdaptResult?.reddit ?? null
  );
  const [xhsResult, setXhsResult] = useState<XHSAdapt | null>(
    prefillAdaptResult?.xiaohongshu ?? null
  );
  const [twitterLoading, setTwitterLoading] = useState(false);
  const [redditLoading, setRedditLoading] = useState(false);
  const [xhsLoading, setXhsLoading] = useState(false);
  const [adaptErrors, setAdaptErrors] = useState<Record<string, { message: string; rawResponse?: string; parseError?: string }>>({});

  const [appliedKeys, setAppliedKeys] = useState<Set<string>>(new Set());
  const [appliedSuggestions, setAppliedSuggestions] = useState<AppliedSuggestions>({});
  const [reframe, setReframe] = useState<Record<string, string | null>>({
    twitter: null,
    reddit: null,
    xiaohongshu: null,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (prefillDraft !== undefined) setDraft(prefillDraft);
    if (prefillAdaptResult !== undefined) {
      setTwitterResult(prefillAdaptResult.twitter);
      setRedditResult(prefillAdaptResult.reddit);
      setXhsResult(prefillAdaptResult.xiaohongshu);
    }
  }, [prefillDraft, prefillAdaptResult]);

  // ─── Apply handler ────────────────────────────────────────────

  function handleApply(key: string, value: string, action: "prepend" | "append" | "store") {
    if (appliedKeys.has(key)) return;

    if (action === "prepend") {
      setDraft((prev) => `${value}\n\n${prev}`);
    } else if (action === "append") {
      setDraft((prev) => `${prev}\n\n${value}`);
    }
    // "store" — title only, goes into appliedSuggestions for the API

    setAppliedKeys((prev) => new Set(prev).add(key));
    setAppliedSuggestions((prev) => ({ ...prev, [key]: value }));
  }

  // ─── Analyze ─────────────────────────────────────────────────

  async function handleAnalyze() {
    if (!draft.trim()) return;
    setAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setTwitterResult(null);
    setRedditResult(null);
    setXhsResult(null);
    setAppliedKeys(new Set());
    setAppliedSuggestions({});

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft, strategy }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "分析失败，请重试");
        return;
      }
      setAnalysisResult(data as AnalysisResult);
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("请求超时（3分钟），请重试");
      } else {
        setError(err instanceof Error ? err.message : "未知错误，请重试");
      }
    } finally {
      setAnalyzing(false);
    }
  }

  // ─── Single-platform fetch (used by handleAdapt and retry) ──────

  async function fetchOnePlatform(
    platform: "twitter" | "reddit" | "xiaohongshu",
  ): Promise<TwitterAdapt | RedditAdapt | XHSAdapt | null> {
    const setLoading = { twitter: setTwitterLoading, reddit: setRedditLoading, xiaohongshu: setXhsLoading }[platform];
    const setResult = { twitter: setTwitterResult, reddit: setRedditResult, xiaohongshu: setXhsResult }[platform] as
      (r: TwitterAdapt | RedditAdapt | XHSAdapt) => void;

    setLoading(true);
    setAdaptErrors((prev) => { const n = { ...prev }; delete n[platform]; return n; }); // clear previous error for this platform

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000);
    try {
      const res = await fetch("/api/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft,
          strategy,
          platform,
          applied_suggestions: appliedSuggestions,
          reframe_instructions: reframe[platform] ?? undefined,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok || data.error) {
        setAdaptErrors((prev) => ({
          ...prev,
          [platform]: {
            message: data.error ?? "适配失败",
            rawResponse: data.raw_response,
            parseError: data.parse_error,
          },
        }));
        return null;
      }
      setResult(data);
      return data;
    } catch (err) {
      clearTimeout(timeout);
      const msg = err instanceof DOMException && err.name === "AbortError"
        ? "请求超时（3分钟）"
        : err instanceof Error ? err.message : "未知错误";
      setAdaptErrors((prev) => ({ ...prev, [platform]: { message: msg } }));
      return null;
    } finally {
      setLoading(false);
    }
  }

  // ─── Adapt — sequential with 500ms gaps ───────────────────────

  async function handleAdapt() {
    if (!draft.trim()) return;

    setTwitterResult(null);
    setRedditResult(null);
    setXhsResult(null);
    setAdaptErrors({});
    setError(null);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const tw = await fetchOnePlatform("twitter");
    await sleep(500);
    const rd = await fetchOnePlatform("reddit");
    await sleep(500);
    const xhs = await fetchOnePlatform("xiaohongshu");

    if (tw && rd && xhs) {
      const adaptResult: AdaptResult = { twitter: tw as TwitterAdapt, reddit: rd as RedditAdapt, xiaohongshu: xhs as XHSAdapt };
      onGenerated(draft, adaptResult);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          date: new Date().toISOString(),
          draft,
          draftPreview: draft.slice(0, 80) + (draft.length > 80 ? "…" : ""),
          twitterScore: 0, redditScore: 0, xhsScore: 0,
          adaptResult,
        }),
      }).catch(() => {});
    }
  }

  // ─── Per-platform retry ───────────────────────────────────────

  async function retryPlatform(platform: "twitter" | "reddit" | "xiaohongshu") {
    await fetchOnePlatform(platform);
  }

  const adapting = twitterLoading || redditLoading || xhsLoading;
  const isLoading = analyzing || adapting;
  const hasDraft = draft.trim().length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Label row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "11px",
            fontWeight: 500,
            textTransform: "uppercase" as const,
            letterSpacing: "0.08em",
            color: "#9C958D",
          }}
        >
          Draft
        </label>
        <span
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "12px",
            color: "#9C958D",
          }}
        >
          {draft.length} chars
        </span>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Paste or write your draft here... 支持中英混写"
        disabled={isLoading}
        style={{
          width: "100%",
          minHeight: "220px",
          backgroundColor: "#F2EDE7",
          color: "#2C2C2C",
          border: "1px solid #E0D9CF",
          borderRadius: "10px",
          padding: "18px 20px",
          fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
          fontSize: "15px",
          lineHeight: 1.75,
          resize: "vertical",
          transition: "border-color 0.2s ease",
        }}
      />

      {/* Reframe — expandable per platform */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {(["twitter", "reddit", "xiaohongshu"] as const).map((platform) => {
          const labels: Record<string, string> = { twitter: "Twitter / X", reddit: "Reddit", xiaohongshu: "小红书" };
          const isOpen = reframe[platform] !== null;
          return (
            <div key={platform}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  cursor: "pointer",
                  userSelect: "none" as const,
                }}
              >
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={() => {
                    setReframe((prev) => ({
                      ...prev,
                      [platform]: isOpen ? null : "",
                    }));
                  }}
                  style={{ accentColor: "#4A7C59", width: "14px", height: "14px", cursor: "pointer" }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
                    fontSize: "13px",
                    color: isOpen ? "#4A7C59" : "#6B6560",
                    transition: "color 0.15s ease",
                  }}
                >
                  {labels[platform]} 自定义适配
                </span>
              </label>

              {isOpen && (
                <textarea
                  value={reframe[platform] ?? ""}
                  onChange={(e) => setReframe((prev) => ({ ...prev, [platform]: e.target.value }))}
                  placeholder="例：用玩家视角重写开头 / 拆成两条发 / 把技术部分用比喻解释"
                  rows={2}
                  style={{
                    marginTop: "6px",
                    marginLeft: "21px",
                    width: "calc(100% - 21px)",
                    backgroundColor: "#F2EDE7",
                    color: "#2C2C2C",
                    border: "1px solid #E0D9CF",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    resize: "vertical",
                    transition: "border-color 0.2s ease",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Button row */}
      <div style={{ display: "flex", gap: "10px" }}>
        {/* Analyze — outline */}
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !hasDraft}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "8px",
            fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            cursor: isLoading || !hasDraft ? "not-allowed" : "pointer",
            opacity: !hasDraft ? 0.4 : 1,
            transition: "all 0.15s ease",
            backgroundColor: "transparent",
            color: analyzing ? "#9C958D" : "#4A7C59",
            border: "2px solid",
            borderColor: analyzing ? "#E0D9CF" : "#4A7C59",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
          }}
        >
          {analyzing ? (
            <>
              <span className="spinner" style={{ borderColor: "rgba(74,124,89,0.3)", borderTopColor: "#4A7C59" }} />
              Analyzing...
            </>
          ) : "Analyze"}
        </button>

        {/* Adapt — filled */}
        <button
          onClick={handleAdapt}
          disabled={isLoading || !hasDraft}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "8px",
            fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            cursor: isLoading || !hasDraft ? "not-allowed" : "pointer",
            opacity: !hasDraft ? 0.4 : 1,
            transition: "background-color 0.15s ease, opacity 0.15s ease",
            backgroundColor: "#4A7C59",
            color: "#ffffff",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
          }}
          onMouseEnter={(e) => {
            if (!isLoading && hasDraft)
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#3D6A4A";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4A7C59";
          }}
        >
          {adapting ? (
            <>
              <span className="spinner" />
              Adapting...
            </>
          ) : "Adapt →"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            backgroundColor: "rgba(196,75,63,0.08)",
            border: "1px solid rgba(196,75,63,0.25)",
            borderRadius: "8px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <span style={{ color: "#C44B3F", fontSize: "14px" }}>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              color: "#C44B3F",
              fontSize: "12px",
              textDecoration: "underline",
              background: "none",
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            请重试
          </button>
        </div>
      )}

      {/* Loading pulse — only for analyze */}
      {analyzing && <LoadingPulse />}

      {/* Step 1: Analysis */}
      {analysisResult && !isLoading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Section divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#E0D9CF" }} />
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "11px",
                color: "#9C958D",
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
              }}
            >
              Step 1 — Platform Analysis
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#E0D9CF" }} />
          </div>

          {/* Overall */}
          <div
            style={{
              backgroundColor: "rgba(74,124,89,0.08)",
              border: "1px solid rgba(74,124,89,0.15)",
              borderRadius: "10px",
              padding: "14px 18px",
              fontSize: "14px",
              lineHeight: 1.7,
              color: "#6B6560",
              fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
            }}
          >
            {analysisResult.overall}
          </div>

          {/* Three analysis cards — side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <TwitterAnalysisCard
              analysis={analysisResult.twitter}
              appliedKeys={appliedKeys}
              onApply={handleApply}
            />
            <RedditAnalysisCard
              analysis={analysisResult.reddit}
              appliedKeys={appliedKeys}
              onApply={handleApply}
            />
            <XHSAnalysisCard
              analysis={analysisResult.xiaohongshu}
              appliedKeys={appliedKeys}
              onApply={handleApply}
            />
          </div>

          {/* Nudge to Adapt */}
          <p
            style={{
              fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
              fontSize: "13px",
              color: "#9C958D",
              textAlign: "center",
            }}
          >
            参考建议修改 draft，或直接点 <strong style={{ color: "#4A7C59" }}>Adapt →</strong> 生成适配版本
          </p>
        </div>
      )}

      {/* Step 2: Adapted versions — each renders as soon as it arrives */}
      {(twitterLoading || redditLoading || xhsLoading || twitterResult || redditResult || xhsResult || Object.keys(adaptErrors).length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#E0D9CF" }} />
            <span style={{ fontFamily: "var(--font-mono), monospace", fontSize: "11px", color: "#9C958D", textTransform: "uppercase" as const, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
              Step 2 — Adapted Versions
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#E0D9CF" }} />
          </div>

          {/* Twitter */}
          {twitterLoading && <PlatformSkeleton label="Twitter / X" color="#1D9BF0" />}
          {!twitterLoading && adaptErrors.twitter && <PlatformError label="Twitter / X" message={adaptErrors.twitter.message} rawResponse={adaptErrors.twitter.rawResponse} parseError={adaptErrors.twitter.parseError} onRetry={() => retryPlatform("twitter")} />}
          {twitterResult && <TwitterCard result={twitterResult} />}

          {/* Reddit */}
          {redditLoading && <PlatformSkeleton label="Reddit" color="#FF4500" />}
          {!redditLoading && adaptErrors.reddit && <PlatformError label="Reddit" message={adaptErrors.reddit.message} rawResponse={adaptErrors.reddit.rawResponse} parseError={adaptErrors.reddit.parseError} onRetry={() => retryPlatform("reddit")} />}
          {redditResult && <RedditCard result={redditResult} />}

          {/* XHS */}
          {xhsLoading && <PlatformSkeleton label="小红书" color="#FF2442" />}
          {!xhsLoading && adaptErrors.xiaohongshu && <PlatformError label="小红书" message={adaptErrors.xiaohongshu.message} rawResponse={adaptErrors.xiaohongshu.rawResponse} parseError={adaptErrors.xiaohongshu.parseError} onRetry={() => retryPlatform("xiaohongshu")} />}
          {xhsResult && <XiaohongshuCard result={xhsResult} />}
        </div>
      )}
    </div>
  );
}
