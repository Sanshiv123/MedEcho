// frontend/src/components/AvatarPlayer.jsx
// Renders the LiveAvatar embed for the patient portal.
//
// On mount (and whenever the phase or script changes), fetches a fresh
// LiveAvatar embed URL from /api/avatar and loads it in an iframe.
// A new session is created for each phase transition so the avatar
// delivers the correct greeting for the current phase.
//
// Props:
//   phase     - Current phase (1 = pre-physician review, 2 = post-review)
//   language  - Patient's language code ("en", "es", "fr", "hi")
//   script    - Gemini-generated script for the current phase (used as greeting)
//   patientId - Patient UUID for loading full context from the backend

import React, { useState, useEffect } from "react";

export default function AvatarPlayer({ phase, language, script, patientId }) {
  const [embedUrl, setEmbedUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset state on phase or script change
    setLoading(true);
    setEmbedUrl(null);

    // Build query params for the avatar endpoint
    // sandbox=false uses the production female avatar (consumes LiveAvatar credits)
    // sandbox=true  uses the Wayne avatar (no credits, limited behavior)
    const params = new URLSearchParams({ sandbox: 'false' });
    if (script) params.append('script', script);         // Greeting text for the avatar
    if (patientId) params.append('patient_id', patientId); // For loading patient knowledge

    // Request a fresh embed session from the backend
    fetch(`/api/avatar?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (d.embed_url) setEmbedUrl(d.embed_url);
        setLoading(false);
      })
      .catch(() => setLoading(false));

  }, [phase, script]); // Re-fetch when phase transitions or script changes

  // Loading state — shown while the embed session is being created
  if (loading) return (
    <div
      className="w-full rounded-xl flex items-center justify-center"
      style={{height: '280px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)'}}
    >
      <p className="text-white/20 text-xs">Loading avatar...</p>
    </div>
  );

  // Error state — shown if the embed URL could not be created
  if (!embedUrl) return (
    <div
      className="w-full rounded-xl flex items-center justify-center flex-col gap-2"
      style={{height: '280px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)'}}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'rgba(61,126,255,0.1)'}}>
        <svg width="20" height="20" fill="none" stroke="#3D7EFF" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z"/>
          <path d="M3 21C3 17.134 7.02944 14 12 14C16.9706 14 21 17.134 21 21"/>
        </svg>
      </div>
      <p className="text-white/20 text-xs">Avatar unavailable</p>
    </div>
  );

  // Embed state — LiveAvatar iframe with microphone and autoplay permissions
  return (
    <iframe
      src={embedUrl}
      allow="microphone; autoplay; camera"
      title="MedEcho Avatar"
      className="w-full rounded-xl"
      style={{height: '280px', border: 'none'}}
    />
  );
}