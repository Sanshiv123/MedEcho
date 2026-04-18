import React from "react";

export default function LanguageSelector({ currentLanguage = "en", onChange = null, disabled = true }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-white/30 text-xs uppercase tracking-widest" style={{fontFamily: 'Syne, sans-serif'}}>Language</p>
      <select
        value={currentLanguage}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        className="glass rounded-lg px-3 py-1.5 text-sm text-white/60 focus:outline-none"
        style={{border: '1px solid rgba(255,255,255,0.07)'}}
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="hi">हिन्दी</option>
      </select>
    </div>
  );
}