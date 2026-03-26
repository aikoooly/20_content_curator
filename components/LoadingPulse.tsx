"use client";

export default function LoadingPulse() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "48px 0",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          className="pulse-dot"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#4A7C59",
            display: "inline-block",
          }}
        />
        <span
          className="pulse-dot"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#4A7C59",
            display: "inline-block",
          }}
        />
        <span
          className="pulse-dot"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#4A7C59",
            display: "inline-block",
          }}
        />
      </div>
      <p
        style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: "13px",
          color: "#9C958D",
        }}
      >
        Adapting for three platforms...
      </p>
    </div>
  );
}
