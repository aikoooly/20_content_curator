"use client";

import { useState } from "react";
import type { HistoryEntry, AdaptResult } from "@/lib/types";

interface HistoryTabProps {
  history: HistoryEntry[];
  onSelect: (draft: string, result: AdaptResult) => void;
  onClearAll: () => void;
}

function ScorePill({ score, label }: { score: number; label: string }) {
  let color = "#C44B3F";
  if (score >= 8) color = "#2D8F5E";
  else if (score >= 5) color = "#C4960A";

  return (
    <span
      style={{
        fontFamily: "var(--font-mono), monospace",
        fontSize: "11px",
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: "4px",
        backgroundColor: `${color}14`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {label} {score}
    </span>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = diff / 1000 / 60 / 60;

  if (hours < 1) {
    const mins = Math.floor(diff / 1000 / 60);
    return mins <= 1 ? "刚刚" : `${mins} 分钟前`;
  }
  if (hours < 24) return `${Math.floor(hours)} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} 天前`;

  return d.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function HistoryTab({ history, onSelect, onClearAll }: HistoryTabProps) {
  const [clearing, setClearing] = useState(false);

  async function handleClearAll() {
    const confirmed = window.confirm("清除所有历史记录？此操作不可恢复。");
    if (!confirmed) return;

    setClearing(true);
    try {
      await fetch("/api/history", { method: "DELETE" });
      onClearAll();
    } catch {
      alert("清除失败，请重试");
    } finally {
      setClearing(false);
    }
  }

  if (history.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "80px 0",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
            fontSize: "15px",
            color: "#9C958D",
          }}
        >
          暂无历史记录
        </p>
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "12px",
            color: "#E0D9CF",
          }}
        >
          Generate your first post to see it here
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#9C958D",
          }}
        >
          {history.length} entries
        </span>
        <button
          onClick={handleClearAll}
          disabled={clearing}
          style={{
            fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
            fontSize: "13px",
            padding: "5px 12px",
            borderRadius: "6px",
            backgroundColor: "rgba(196,75,63,0.07)",
            color: "#C44B3F",
            border: "1px solid rgba(196,75,63,0.2)",
            cursor: clearing ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {clearing ? "Clearing..." : "Clear All"}
        </button>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {history.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelect(entry.draft, entry.adaptResult)}
            style={{
              width: "100%",
              textAlign: "left",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E0D9CF",
              borderRadius: "10px",
              padding: "16px 18px",
              cursor: "pointer",
              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "#4A7C59";
              el.style.boxShadow = "0 1px 4px rgba(74,124,89,0.1)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "#E0D9CF";
              el.style.boxShadow = "none";
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <p
                style={{
                  fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  color: "#2C2C2C",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {entry.draftPreview}
              </p>
              <span
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "12px",
                  color: "#9C958D",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {formatDate(entry.date)}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }}>
              <ScorePill score={entry.twitterScore} label="TW" />
              <ScorePill score={entry.redditScore} label="RD" />
              <ScorePill score={entry.xhsScore} label="XHS" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
