"use client";

interface ScoreBarProps {
  score: number;
}

export default function ScoreBar({ score }: ScoreBarProps) {
  const clampedScore = Math.max(0, Math.min(10, score));
  const percentage = (clampedScore / 10) * 100;

  let color = "#C44B3F"; // red
  if (clampedScore >= 8) {
    color = "#2D8F5E"; // green
  } else if (clampedScore >= 5) {
    color = "#C4960A"; // yellow
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {/* Bar */}
      <div
        style={{
          flex: 1,
          height: "4px",
          backgroundColor: "#E0D9CF",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          className="score-bar-fill"
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: "2px",
          }}
        />
      </div>

      {/* Score label */}
      <span
        style={{
          fontFamily: "var(--font-serif), var(--font-noto-serif-sc), serif",
          fontSize: "28px",
          fontWeight: 500,
          color: color,
          lineHeight: 1,
          minWidth: "52px",
          textAlign: "right",
        }}
      >
        {clampedScore}
        <span
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: "12px",
            color: "#9C958D",
            fontWeight: 400,
          }}
        >
          /10
        </span>
      </span>
    </div>
  );
}
