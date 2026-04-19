// frontend/src/components/LanguageSelector.jsx
// Displays the patient's selected language on the patient portal.
//
// Read-only by default (disabled=true) — the language is set by the clinician
// at scan submission time and is not changed by the patient.
//
// Could be made interactive in a future version to allow patients to switch
// languages, which would re-fetch Gemini-generated scripts in the new language.
//
// Props:
//   currentLanguage - ISO 639-1 language code ("en", "es", "fr", "hi")
//                     Defaults to "en" if not provided
//   onChange        - Optional callback when language selection changes
//                     Only relevant if disabled=false
//   disabled        - If true (default), selector is read-only

import React from "react";

// Supported languages — must match clinician portal and Gemini language codes
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "hi", label: "हिन्दी" },
];

export default function LanguageSelector({
  currentLanguage = "en",
  onChange = null,
  disabled = true
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Label */}
      <p
        className="text-white/30 text-xs uppercase tracking-widest"
        style={{fontFamily: 'Syne, sans-serif'}}
      >
        Language
      </p>

      {/* Language dropdown */}
      <select
        value={currentLanguage}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        className="glass rounded-lg px-3 py-1.5 text-sm text-white/60 focus:outline-none"
        style={{border: '1px solid rgba(255,255,255,0.07)'}}
      >
        {LANGUAGES.map(({ code, label }) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
    </div>
  );
}