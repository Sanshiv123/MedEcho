import React from "react";

export default function TrialCard({ trial }) {
  if (!trial) return null;

  return (
    <div
      className="trial-card"
      style={{
        marginTop: "16px",
        padding: "16px",
        border: "1px solid #dbeafe",
        borderRadius: "12px",
        background: "#eff6ff",
      }}
    >
      <p style={{ marginTop: 0 }}>You may be eligible for a nearby research study.</p>
      <p>
        <strong>{trial.name}</strong> — {trial.location}
      </p>
      <p style={{ marginBottom: 0 }}>Your care team will follow up with more information.</p>
    </div>
  );
}