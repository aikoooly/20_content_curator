"use client";

import { useState } from "react";
import type { TwitterAdapt, RedditAdapt, XHSAdapt } from "@/lib/types";

// ─── Copy Button ──────────────────────────────────────────────────

function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getText());
    } catch {
      const el = document.createElement("textarea");
      el.value = getText();
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        fontFamily: "var(--font-mono), monospace",
        fontSize: "12px",
        padding: "4px 10px",
        borderRadius: "6px",
        backgroundColor: copied ? "rgba(45,143,94,0.1)" : "#F2EDE7",
        color: copied ? "#2D8F5E" : "#9C958D",
        border: `1px solid ${copied ? "rgba(45,143,94,0.3)" : "#E0D9CF"}`,
        cursor: "pointer",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap" as const,
      }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ─── Lang Tag ─────────────────────────────────────────────────────

function LangTag({ lang }: { lang: string }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono), monospace",
        fontSize: "11px",
        fontWeight: 500,
        padding: "2px 7px",
        borderRadius: "4px",
        backgroundColor: "#F2EDE7",
        color: "#9C958D",
        border: "1px solid #E0D9CF",
      }}
    >
      {lang}
    </span>
  );
}

// ─── Changes Section ──────────────────────────────────────────────

function ChangesSection({
  changesMade,
  changePercentage,
}: {
  changesMade: string[];
  changePercentage: number;
}) {
  const over = changePercentage > 20;
  return (
    <div
      style={{
        backgroundColor: "#FAF6F1",
        borderRadius: "6px",
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "10px",
            textTransform: "uppercase" as const,
            letterSpacing: "0.06em",
            color: "#9C958D",
          }}
        >
          Changes
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "12px",
            fontWeight: 500,
            color: over ? "#C44B3F" : "#2D8F5E",
          }}
        >
          {over ? "⚠ " : ""}{changePercentage}% changed
        </span>
      </div>
      {changesMade.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "3px" }}>
          {changesMade.map((change, i) => (
            <li
              key={i}
              style={{
                fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
                fontSize: "12px",
                color: "#6B6560",
                display: "flex",
                gap: "6px",
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: "#9C958D", flexShrink: 0 }}>–</span>
              {change}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Twitter Result Card ──────────────────────────────────────────

export function TwitterCard({ result }: { result: TwitterAdapt }) {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E0D9CF",
        borderLeft: "3px solid #1D9BF0",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(29,155,240,0.06)",
          padding: "14px 24px",
          borderBottom: "1px solid #E0D9CF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--font-serif), var(--font-noto-serif-sc), serif",
              fontSize: "17px",
              fontWeight: 500,
              color: "#1D9BF0",
            }}
          >
            Twitter / X
          </span>
          <LangTag lang="EN" />
        </div>
        <CopyButton getText={() => result.content} />
      </div>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ backgroundColor: "#F2EDE7", borderRadius: "8px", padding: "16px" }}>
          <p
            className="post-content"
            style={{
              fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
              fontSize: "14px",
              lineHeight: 1.8,
              color: "#2C2C2C",
            }}
          >
            {result.content}
          </p>
        </div>
        <ChangesSection changesMade={result.changes_made} changePercentage={result.change_percentage} />
      </div>
    </div>
  );
}

// ─── Reddit Result Card ───────────────────────────────────────────

export function RedditCard({ result }: { result: RedditAdapt }) {
  const copyText = `${result.title}\n\n${result.content}`;

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E0D9CF",
        borderLeft: "3px solid #FF4500",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255,69,0,0.06)",
          padding: "14px 24px",
          borderBottom: "1px solid #E0D9CF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--font-serif), var(--font-noto-serif-sc), serif",
              fontSize: "17px",
              fontWeight: 500,
              color: "#FF4500",
            }}
          >
            Reddit
          </span>
          <LangTag lang="EN" />
        </div>
        <CopyButton getText={() => copyText} />
      </div>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {result.title && (
          <div>
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "10px",
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em",
                color: "#9C958D",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Post Title
            </span>
            <p
              style={{
                fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
                fontSize: "15px",
                fontWeight: 600,
                color: "#2C2C2C",
                lineHeight: 1.4,
              }}
            >
              {result.title}
            </p>
          </div>
        )}

        {result.subreddits && result.subreddits.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px" }}>
            {result.subreddits.map((sub) => (
              <span
                key={sub}
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "12px",
                  padding: "3px 10px",
                  borderRadius: "16px",
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

        <div style={{ backgroundColor: "#F2EDE7", borderRadius: "8px", padding: "16px" }}>
          <p
            className="post-content"
            style={{
              fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
              fontSize: "14px",
              lineHeight: 1.8,
              color: "#2C2C2C",
            }}
          >
            {result.content}
          </p>
        </div>

        <ChangesSection changesMade={result.changes_made} changePercentage={result.change_percentage} />
      </div>
    </div>
  );
}

// ─── Xiaohongshu Result Card ──────────────────────────────────────

export function XiaohongshuCard({ result }: { result: XHSAdapt }) {
  const copyText = `${result.title}\n\n${result.content}`;

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E0D9CF",
        borderLeft: "3px solid #FF2442",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255,36,66,0.06)",
          padding: "14px 24px",
          borderBottom: "1px solid #E0D9CF",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--font-serif), var(--font-noto-serif-sc), serif",
              fontSize: "17px",
              fontWeight: 500,
              color: "#FF2442",
            }}
          >
            小红书
          </span>
          <LangTag lang="中文" />
        </div>
        <CopyButton getText={() => copyText} />
      </div>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {result.title && (
          <div>
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontSize: "10px",
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em",
                color: "#9C958D",
                display: "block",
                marginBottom: "5px",
              }}
            >
              标题
            </span>
            <p
              style={{
                fontFamily: "var(--font-serif), var(--font-noto-serif-sc), serif",
                fontSize: "20px",
                fontWeight: 600,
                color: "#2C2C2C",
                lineHeight: 1.35,
              }}
            >
              {result.title}
            </p>
          </div>
        )}

        {result.keywords && result.keywords.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "6px" }}>
            {result.keywords.map((kw) => (
              <span
                key={kw}
                style={{
                  fontSize: "12px",
                  padding: "3px 10px",
                  borderRadius: "16px",
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

        <div style={{ backgroundColor: "#F2EDE7", borderRadius: "8px", padding: "16px" }}>
          <p
            className="post-content"
            style={{
              fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
              fontSize: "14px",
              lineHeight: 1.8,
              color: "#2C2C2C",
            }}
          >
            {result.content}
          </p>
        </div>

        <ChangesSection changesMade={result.changes_made} changePercentage={result.change_percentage} />
      </div>
    </div>
  );
}
