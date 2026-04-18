import React from "react";

export default function TranscriptPanel({ phase, script }) {
  return (
    <div
      className="transcript-panel"
      style={{
        marginTop: "16px",
        padding: "16px",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        background: "#ffffff",
      }}
    >
      <h3 style={{ marginTop: 0 }}>
        {phase === 1 ? "Initial update" : "Doctor-reviewed explanation"}
      </h3>

      <p style={{ marginBottom: 0 }}>
        {script || "Transcript not available yet."}
      </p>
    </div>
  );
}