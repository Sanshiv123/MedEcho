import React from "react";

export default function TrialCard({ trial }) {
  if (!trial) return null;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2"
      style={{background: 'rgba(61,126,255,0.05)', border: '1px solid rgba(61,126,255,0.15)'}}
    >
      <p className="text-white/70 text-sm font-medium" style={{fontFamily: 'Syne, sans-serif'}}>
        You may be eligible for a nearby research study
      </p>
      <p className="text-white/40 text-xs leading-relaxed">
        Your care team will follow up with more information.
      </p>
    </div>
  );
}