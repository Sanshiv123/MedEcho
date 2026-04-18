import React from "react";

export default function LanguageSelector({
  currentLanguage = "en",
  onChange = null,
  disabled = true,
}) {
  return (
    <div className="language-selector">
      <label htmlFor="language-select" style={{ marginRight: "8px" }}>
        Language:
      </label>

      <select
        id="language-select"
        value={currentLanguage}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="hi">हिन्दी</option>
      </select>
    </div>
  );
}