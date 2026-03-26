"use client";

import { useState, useEffect, useCallback } from "react";
import ComposeTab from "@/components/ComposeTab";
import StrategyTab from "@/components/StrategyTab";
import HistoryTab from "@/components/HistoryTab";
import type { AdaptResult, HistoryEntry } from "@/lib/types";

type Tab = "compose" | "strategy" | "history";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("compose");

  const [strategy, setStrategy] = useState<string>("");
  const [strategyLoaded, setStrategyLoaded] = useState(false);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const [prefillDraft, setPrefillDraft] = useState<string | undefined>(undefined);
  const [prefillAdaptResult, setPrefillAdaptResult] = useState<AdaptResult | undefined>(undefined);
  const [composeKey, setComposeKey] = useState(0);

  useEffect(() => {
    fetch("/api/strategy")
      .then((r) => r.json())
      .then((data) => {
        setStrategy(data.content ?? "");
        setStrategyLoaded(true);
      })
      .catch(() => setStrategyLoaded(true));

    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, []);

  const handleGenerated = useCallback((_draft: string, _result: AdaptResult) => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
      })
      .catch(() => {});
  }, []);

  function handleHistorySelect(draft: string, result: AdaptResult) {
    setPrefillDraft(draft);
    setPrefillAdaptResult(result);
    setComposeKey((k) => k + 1);
    setActiveTab("compose");
  }

  function handleClearAll() {
    setHistory([]);
  }

  function handleStrategySave(newStrategy: string) {
    setStrategy(newStrategy);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "compose", label: "Compose" },
    { id: "strategy", label: "Strategy" },
    {
      id: "history",
      label: `History${history.length > 0 ? ` (${history.length})` : ""}`,
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF6F1" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10"
        style={{
          backgroundColor: "#FAF6F1",
          borderBottom: "1px solid #E0D9CF",
        }}
      >
        <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 24px" }}>
          <div className="flex items-baseline justify-between" style={{ height: "56px" }}>
            {/* Brand */}
            <h1
              style={{
                fontFamily: "var(--font-serif), var(--font-noto-serif-sc), serif",
                fontSize: "26px",
                fontWeight: 500,
                color: "#2C2C2C",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              Content Studio
            </h1>

            {/* Tabs */}
            <nav className="flex items-baseline" style={{ gap: "4px" }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    fontFamily: "var(--font-sans), var(--font-noto-sans-sc), sans-serif",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: activeTab === tab.id ? "#2C2C2C" : "#9C958D",
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: activeTab === tab.id ? "2px solid #4A7C59" : "2px solid transparent",
                    padding: "4px 12px",
                    cursor: "pointer",
                    transition: "color 0.15s ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          maxWidth: "780px",
          margin: "0 auto",
          padding: "40px 24px",
        }}
      >
        {activeTab === "compose" && (
          <ComposeTab
            key={composeKey}
            strategy={strategy}
            prefillDraft={prefillDraft}
            prefillAdaptResult={prefillAdaptResult}
            onGenerated={handleGenerated}
          />
        )}

        {activeTab === "strategy" && strategyLoaded && (
          <StrategyTab strategy={strategy} onSave={handleStrategySave} />
        )}

        {activeTab === "strategy" && !strategyLoaded && (
          <div className="flex items-center justify-center py-20">
            <p style={{ color: "#9C958D", fontSize: "14px" }}>Loading strategy...</p>
          </div>
        )}

        {activeTab === "history" && historyLoaded && (
          <HistoryTab
            history={history}
            onSelect={handleHistorySelect}
            onClearAll={handleClearAll}
          />
        )}

        {activeTab === "history" && !historyLoaded && (
          <div className="flex items-center justify-center py-20">
            <p style={{ color: "#9C958D", fontSize: "14px" }}>Loading history...</p>
          </div>
        )}
      </main>
    </div>
  );
}
