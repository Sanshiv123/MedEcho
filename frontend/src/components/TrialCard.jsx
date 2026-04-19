// frontend/src/components/TrialCard.jsx
// Displays a soft notification on the patient portal when matched clinical
// trials are available.
//
// Intentionally minimal — does not show trial names, locations, or details
// to avoid overwhelming the patient. The physician has already reviewed the
// matched trials and will follow up directly.
//
// Only shown in phase 2 (after physician has sent their assessment) and only
// when at least one trial was matched. Controlled by Patient.jsx.
//
// Props:
//   trial - The first matched trial object from the patient record
//           (only used to check existence — details not displayed to patient)

import React from "react";

export default function TrialCard({ trial }) {
  // Don't render if no trial was matched
  if (!trial) return null;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2"
      style={{
        background: 'rgba(61,126,255,0.05)',
        border: '1px solid rgba(61,126,255,0.15)'
      }}
    >
      {/* Soft headline — encouraging but not alarming */}
      <p
        className="text-white/70 text-sm font-medium"
        style={{fontFamily: 'Syne, sans-serif'}}
      >
        You may be eligible for a nearby research study
      </p>

      {/* Reassuring follow-up note */}
      <p className="text-white/40 text-xs leading-relaxed">
        Your care team will follow up with more information.
      </p>
    </div>
  );
}