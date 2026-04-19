import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AvatarPlayer from "../components/AvatarPlayer";
import TranscriptPanel from "../components/TranscriptPanel";
import TrialCard from "../components/TrialCard";
import LanguageSelector from "../components/LanguageSelector";

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
            setData(d);
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
          placeholder="P001"
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

  const phase1Message = data.phase1_script || "Your scan has come through clearly. Your care team is reviewing it now. You are in good hands.";
  const currentScript = phase === 1 ? phase1Message : phase2Script;
  const firstTrial = data.trials && data.trials.length > 0 ? data.trials[0] : null;

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center p-8 gap-6">

      <div className="fade-in-up stagger-1 text-center">
        <h1 style={{fontFamily: 'Syne, sans-serif'}} className="text-3xl font-bold text-white">MedEcho</h1>
        <p className="text-white/30 text-sm mt-1">Your Health Summary</p>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-4">

        {/* Status */}
        <div className="fade-in-up stagger-2 glass rounded-2xl p-4 flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{
            background: phase === 2 ? '#10B981' : '#F59E0B',
            boxShadow: phase === 2 ? '0 0 8px rgba(16,185,129,0.5)' : '0 0 8px rgba(245,158,11,0.5)',
            animation: phase === 1 ? 'pulseDot 2s ease-in-out infinite' : 'none'
          }} />
          <div>
            <p style={{fontFamily: 'Syne, sans-serif'}} className="text-white font-semibold text-sm">
              {phase === 2 ? "Your doctor has reviewed your scan" : "Your care team is reviewing your scan"}
            </p>
            <p className="text-white/30 text-xs mt-0.5">
              {phase === 2 ? "See your explanation below" : "You'll be notified when your doctor has reviewed it"}
            </p>
          </div>
        </div>

        {/* Language selector */}
        <div className="fade-in-up stagger-2 glass rounded-2xl p-4">
          <LanguageSelector currentLanguage={data.language} />
        </div>

        {/* Scan */}
        <div className="fade-in-up stagger-3 glass rounded-2xl p-4 flex flex-col gap-3">
          <p style={{fontFamily: 'Syne, sans-serif'}} className="text-xs font-semibold text-white/30 uppercase tracking-widest">Your scan</p>
          {data.image_url
            ? <img src={data.image_url} alt="Your scan" className="rounded-xl w-full object-contain max-h-64" />
            : <p className="text-white/30 text-sm">Scan image not available.</p>
          }
        </div>

        {/* Avatar + transcript */}
        <div className="fade-in-up stagger-4 glass rounded-2xl p-5 flex flex-col gap-4">
          <AvatarPlayer phase={phase} language={data.language} script={currentScript} patientId={patientId} />
          {phase === 1 && <TranscriptPanel phase={phase} script={currentScript} />}        </div>

        {/* Phase 2 — doctor assessment + plain language explanation */}
        {phase === 2 && (
          <>
            {data.physician_notes && (
              <div className="fade-in-up glass rounded-2xl p-5 flex flex-col gap-3">
                <p style={{fontFamily: 'Syne, sans-serif'}} className="text-xs font-semibold text-white/30 uppercase tracking-widest">Your doctor's assessment</p>
                <p className="text-white/60 text-sm leading-relaxed">{data.physician_notes}</p>
              </div>
            )}
            {data.phase2_script && (
              <div className="fade-in-up glass rounded-2xl p-5 flex flex-col gap-3">
                <p style={{fontFamily: 'Syne, sans-serif'}} className="text-xs font-semibold text-white/30 uppercase tracking-widest">What this means for you</p>
                <p className="text-white/70 text-sm leading-relaxed">{data.phase2_script}</p>
              </div>
            )}
          </>
        )}

        {/* Trial card - phase 2 only */}
        {phase === 2 && firstTrial && (
          <div className="fade-in-up stagger-5">
            <TrialCard trial={firstTrial} />
          </div>
        )}

        <p className="fade-in text-center text-white/15 text-xs">
          Prepared for {data.patient_name} · <span style={{fontFamily: 'DM Mono, monospace'}}>{data.patient_id}</span>
        </p>

      </div>
    </div>
  );
}