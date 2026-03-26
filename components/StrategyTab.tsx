"use client";

import { useState } from "react";

interface StrategyTabProps {
  strategy: string;
  onSave: (newStrategy: string) => void;
}

export default function StrategyTab({ strategy, onSave }: StrategyTabProps) {
  const [content, setContent] = useState(strategy);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "保存失败");
      }

      onSave(content);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", minHeight: "70vh" }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <p
          style={{
            fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
            fontSize: "14px",
            color: "#9C958D",
            lineHeight: 1.6,
          }}
        >
          编辑算法规则、参考博主、内容策略。改动持久保存，影响所有后续生成。
        </p>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flexShrink: 0,
            padding: "8px 18px",
            borderRadius: "8px",
            fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
            fontSize: "14px",
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            border: saved ? "1px solid rgba(45,143,94,0.3)" : "none",
            backgroundColor: saved
              ? "rgba(45,143,94,0.1)"
              : saving
              ? "#E0D9CF"
              : "#4A7C59",
            color: saved ? "#2D8F5E" : saving ? "#9C958D" : "#ffffff",
          }}
          onMouseEnter={(e) => {
            if (!saving && !saved)
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#3D6A4A";
          }}
          onMouseLeave={(e) => {
            if (!saving && !saved)
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4A7C59";
          }}
        >
          {saved ? "✓ Saved" : saving ? "Saving..." : "Save"}
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
            color: "#C44B3F",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={saving}
        spellCheck={false}
        style={{
          flex: 1,
          width: "100%",
          minHeight: "60vh",
          backgroundColor: "#F2EDE7",
          color: "#2C2C2C",
          border: "1px solid #E0D9CF",
          borderRadius: "10px",
          padding: "18px 20px",
          fontFamily: "var(--font-mono), monospace",
          fontSize: "13px",
          lineHeight: 1.8,
          resize: "vertical",
          transition: "border-color 0.2s ease",
        }}
      />
    </div>
  );
}
