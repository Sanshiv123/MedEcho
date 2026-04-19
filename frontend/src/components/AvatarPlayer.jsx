import React, { useState, useEffect } from "react";

export default function AvatarPlayer({ phase, language, script, patientId }) {
  const [embedUrl, setEmbedUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setEmbedUrl(null);
    const params = new URLSearchParams({ sandbox: 'false' });
    if (script) params.append('script', script);
    if (patientId) params.append('patient_id', patientId);
    
    fetch(`/api/avatar?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        if (d.embed_url) setEmbedUrl(d.embed_url);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [phase, script]);

  if (loading) return (
    <div
      className="w-full rounded-xl flex items-center justify-center"
      style={{height: '280px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)'}}
    >
      <p className="text-white/20 text-xs">Loading avatar...</p>
    </div>
  );

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