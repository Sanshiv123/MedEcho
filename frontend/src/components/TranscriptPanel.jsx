import React from "react";

export default function TranscriptPanel({ phase, script }) {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "12px",
        background: phase === 2 ? "rgba(16,185,129,0.05)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${phase === 2 ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)"}`,
      }}
    >
      <p className="text-white/70 text-sm leading-relaxed">
        {script || "Transcript not available yet."}
      </p>
    </div>
  );
}