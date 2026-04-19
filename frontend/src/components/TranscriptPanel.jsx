// frontend/src/components/TranscriptPanel.jsx
// Displays the Gemini-generated patient script as readable text below the avatar.
//
// Shown in phase 1 only — provides a written version of what the avatar is
// saying so the patient can read along or reference it after the avatar speaks.
//
// In phase 2, the physician assessment and "What this means for you" cards
// replace this panel as the primary information display.
//
// Styling adapts by phase:
// - Phase 1: subtle white border (neutral, informational)
// - Phase 2: green tint border (positive, doctor-reviewed)
//
// Props:
//   phase  - Current phase (1 or 2) — controls border color
//   script - The Gemini-generated script text to display

import React from "react";

export default function TranscriptPanel({ phase, script }) {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "12px",
        // Green tint in phase 2 signals doctor-reviewed content
        background: phase === 2
          ? "rgba(16,185,129,0.05)"
          : "rgba(255,255,255,0.02)",
        border: `1px solid ${phase === 2
          ? "rgba(16,185,129,0.15)"
          : "rgba(255,255,255,0.05)"}`,
      }}
    >
      <p className="text-white/70 text-sm leading-relaxed">
        {script || "Transcript not available yet."}
      </p>
    </div>
  );
}