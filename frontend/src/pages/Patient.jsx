import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Patient() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [manualId, setManualId] = useState("");
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState(1);
  const [phase2Script, setPhase2Script] = useState(null);
  const [loading, setLoading] = useState(!!patientId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    fetch(`/api/patient/${patientId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); setLoading(false); return; }
        setData(d);
        if (d.phase === 2) { setPhase(2); setPhase2Script(d.phase2_script); }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load your information."); setLoading(false); });
  }, [patientId]);

  useEffect(() => {
    if (!patientId || phase === 2) return;
    const interval = setInterval(() => {
      fetch(`/api/patient/${patientId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.phase === 2) {
            setPhase(2);
            setPhase2Script(d.phase2_script);
            clearInterval(interval);
          }
        });
    }, 5000);
    return () => clearInterval(interval);
  }, [patientId, phase]);

  if (!patientId) return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center p-8 gap-8">
      <div className="fade-in-up stagger-1 text-center">
        <h1 style={{fontFamily: 'Syne, sans-serif'}} className="text-3xl font-bold text-white">MedEcho</h1>
        <p className="text-white/30 text-sm mt-1">Your Health Summary</p>
      </div>
      <div className="fade-in-up stagger-2 w-full max-w-md glass rounded-3xl p-8 flex flex-col gap-4">
        <p className="text-white/40 text-sm">Enter your patient ID to view your results</p>
        <input
          type="text"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          placeholder="P-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none"
          style={{border: '1px solid rgba(255,255,255,0.07)', fontFamily: 'DM Mono, monospace'}}
        />
        <button
          onClick={() => { if (manualId.trim()) navigate(`/patient/${manualId.trim()}`); }}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{background: 'linear-gradient(135deg, #F59E0B, #D97706)', fontFamily: 'Syne, sans-serif'}}
        >
          View My Results →
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen grid-bg flex items-center justify-center">
      <p className="text-white/30 text-sm">Loading your information...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen grid-bg flex items-center justify-center">
      <p className="text-red-400/70 text-sm">{error}</p>
    </div>
  );

  const phase1Message = data.phase1_script || "Your scan has come through clearly. Your care team is reviewing it now and will be in touch with you soon. You're in good hands.";

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center p-8 gap-6">

      <div className="fade-in-up stagger-1 text-center">
        <h1 style={{fontFamily: 'Syne, sans-serif'}} className="text-3xl font-bold text-white">MedEcho</h1>
        <p className="text-white/30 text-sm mt-1">Your Health Summary</p>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-4">

        {/* Status */}
        <div className="fade-in-up stagger-2 glass rounded-2xl p-4 flex items-center gap-4">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{
              background: phase === 2 ? '#10B981' : '#F59E0B',
              boxShadow: phase === 2 ? '0 0 8px rgba(16,185,129,0.5)' : '0 0 8px rgba(245,158,11,0.5)',
              animation: phase === 1 ? 'pulseDot 2s ease-in-out infinite' : 'none'
            }}
          />
          <div>
            <p style={{fontFamily: 'Syne, sans-serif'}} className="text-white font-semibold text-sm">
              {phase === 2 ? "Your doctor has reviewed your scan" : "Your care team is reviewing your scan"}
            </p>
            <p className="text-white/30 text-xs mt-0.5">
              {phase === 2 ? "See your explanation below" : "You'll be notified when your doctor has reviewed it"}
            </p>
          </div>
        </div>

        {/* Scan */}
        <div className="fade-in-up stagger-3 glass rounded-2xl p-4 flex flex-col gap-3">
          <p style={{fontFamily: 'Syne, sans-serif'}} className="text-xs font-semibold text-white/30 uppercase tracking-widest">Your scan</p>
          <img
            src={data.image_url}
            alt="Your scan"
            className="rounded-xl w-full object-contain max-h-64"
          />
        </div>

        {/* Avatar + Message */}
        <div className="fade-in-up stagger-4 glass rounded-2xl p-5 flex flex-col gap-4">

          {/* Avatar placeholder */}
          <div
            className="w-full h-36 rounded-xl flex items-center justify-center flex-col gap-2"
            style={{background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)'}}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'rgba(61,126,255,0.1)'}}>
              <svg width="20" height="20" fill="none" stroke="#3D7EFF" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z"/>
                <path d="M3 21C3 17.134 7.02944 14 12 14C16.9706 14 21 17.134 21 21"/>
              </svg>
            </div>
            <p className="text-white/20 text-xs">Avatar will appear here</p>
          </div>

          {/* Message */}
          <div
            className="rounded-xl p-4"
            style={{background: phase === 2 ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${phase === 2 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)'}`}}
          >
            <p className="text-white/70 text-sm leading-relaxed">
              {phase === 2 ? phase2Script : phase1Message}
            </p>
          </div>
        </div>

        {/* Trials soft card - phase 2 only */}
        {phase === 2 && data.trials && data.trials.length > 0 && (
          <div className="fade-in-up stagger-5 glass rounded-2xl p-5 flex flex-col gap-2">
            <p style={{fontFamily: 'Syne, sans-serif'}} className="text-white/70 text-sm font-semibold">You may be eligible for a nearby study</p>
            <p className="text-white/30 text-xs">Your care team will follow up with more information.</p>
          </div>
        )}

        <p className="fade-in text-center text-white/15 text-xs">
          Prepared for {data.patient_name} · <span style={{fontFamily: 'DM Mono, monospace'}}>{data.patient_id}</span>
        </p>
      </div>
    </div>
  );
}