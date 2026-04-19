import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AvatarPlayer from "../components/AvatarPlayer";
import TrialCard from "../components/TrialCard";

const isDark = () => document.body.getAttribute('data-theme') !== 'light';

export default function Patient() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [manualId, setManualId] = useState("");
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState(1);
  const [phase2Script, setPhase2Script] = useState(null);
  const [loading, setLoading] = useState(!!patientId);
  const [error, setError] = useState(null);
  const [, forceUpdate] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [scanExpanded, setScanExpanded] = useState(false);
  const typingRef = useRef(null);

  useEffect(() => {
    const obs = new MutationObserver(() => forceUpdate(n => n + 1));
    obs.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!patientId) return;
    fetch(`/api/patient/${patientId}`).then(r => r.json()).then(d => {
      if (d.error) { setError(d.error); setLoading(false); return; }
      setData(d);
      if (d.phase === 2) { setPhase(2); setPhase2Script(d.phase2_script); }
      setLoading(false);
    }).catch(() => { setError("Failed to load."); setLoading(false); });
  }, [patientId]);

  useEffect(() => {
    if (!patientId || phase === 2) return;
    const iv = setInterval(() => {
      fetch(`/api/patient/${patientId}`).then(r => r.json()).then(d => {
        if (d.phase === 2) { setPhase(2); setPhase2Script(d.phase2_script); setData(d); clearInterval(iv); }
      });
    }, 5000);
    return () => clearInterval(iv);
  }, [patientId, phase]);

  useEffect(() => {
    if (!data) return;
    const script = phase === 1
      ? (data.phase1_script || "Your scan has come through clearly. Your care team is reviewing it now. You are in good hands.")
      : phase2Script;
    if (!script) return;
    if (typingRef.current) clearInterval(typingRef.current);
    setDisplayedText(""); setIsTyping(true);
    let i = 0;
    typingRef.current = setInterval(() => {
      i += 2; setDisplayedText(script.slice(0, i));
      if (i >= script.length) { clearInterval(typingRef.current); setIsTyping(false); }
    }, 25);
    return () => clearInterval(typingRef.current);
  }, [phase, data]);

  const dark = isDark();
  const currentScript = phase === 1
    ? (data?.phase1_script || "Your scan has come through clearly. Your care team is reviewing it now. You are in good hands.")
    : phase2Script;
  const firstTrial = data?.trials?.length > 0 ? data.trials[0] : null;
  const audioUrl = phase === 1 ? data?.phase1_audio_url : data?.phase2_audio_url;

  const bg = dark
    ? 'linear-gradient(135deg, #060E1A 0%, #0A1628 50%, #06101E 100%)'
    : 'linear-gradient(135deg, #E8EFFF 0%, #EEF4FF 40%, #E4EEFF 100%)';

  const glass = (accent = null) => ({
    background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)',
    backdropFilter: 'blur(20px)',
    border: `1px solid ${accent || (dark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.15)')}`,
    borderRadius: 20,
  });

  if (!patientId) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,#F59E0B,#D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
        </div>
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 700, color: dark ? '#E2EAF8' : '#0A1628' }}>MedEcho</p>
        <p style={{ fontSize: 14, color: dark ? '#4A6A8A' : '#6B7280', marginTop: 4 }}>Your personal health portal</p>
      </div>
      <div style={{ width: '100%', maxWidth: 420, ...glass(), padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 13, color: dark ? '#4A6A8A' : '#6B7280' }}>Enter your patient ID to view your results</p>
        <input value={manualId} onChange={e => setManualId(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && manualId.trim()) navigate(`/patient/${manualId.trim()}`); }}
          placeholder="P-xxxxxxxx..."
          style={{ width: '100%', background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(240,244,255,0.9)', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.2)'}`, borderRadius: 10, padding: '11px 14px', fontSize: 13, color: dark ? '#E2EAF8' : '#0A1628', outline: 'none', fontFamily: 'DM Mono, monospace' }}/>
        <button onClick={() => { if (manualId.trim()) navigate(`/patient/${manualId.trim()}`); }}
          style={{ padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg,#F59E0B,#D97706)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Syne, sans-serif', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>
          View My Results →
        </button>
      </div>
    </div>
  );

  if (loading) return <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#6B7280' }}>Loading your results...</p></div>;
  if (error) return <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#EF4444' }}>{error}</p></div>;

  return (
    <div style={{ minHeight: '100vh', background: bg, position: 'relative', overflow: 'hidden' }}>

      {/* Background orbs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: dark ? 'rgba(99,102,241,0.06)' : 'rgba(147,197,253,0.25)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: dark ? 'rgba(245,158,11,0.04)' : 'rgba(196,181,253,0.2)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '40%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: dark ? 'rgba(16,185,129,0.03)' : 'rgba(167,243,208,0.2)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Scan modal */}
      {scanExpanded && (
        <div onClick={() => setScanExpanded(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: 700, width: '100%' }}>
            <button onClick={() => setScanExpanded(false)} style={{ position: 'absolute', top: -14, right: -14, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <img src={data.image_url} alt="scan" style={{ width: '100%', borderRadius: 14, objectFit: 'contain' }}/>
          </div>
        </div>
      )}

      {/* Sticky header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: dark ? 'rgba(6,14,26,0.85)' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.1)'}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#F59E0B,#D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          </div>
          <div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: dark ? '#E2EAF8' : '#0A1628', lineHeight: 1 }}>Patient Portal</p>
            <p style={{ fontSize: 10, color: dark ? '#4A6A8A' : '#9CA3AF', marginTop: 2 }}>MedEcho · Secure</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select value={data.language || 'en'} style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(240,244,255,0.9)', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.15)'}`, borderRadius: 8, padding: '5px 10px', fontSize: 12, color: dark ? '#C8D8F0' : '#374151', outline: 'none' }}>
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="fr">🇫🇷 Français</option>
            <option value="hi">🇮🇳 हिन्दी</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
            <p style={{ fontSize: 11, fontWeight: 600, color: '#10B981' }}>HIPAA Secure</p>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '28px 28px 40px' }}>

        {/* Welcome hero */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, background: dark ? 'linear-gradient(135deg,#E2EAF8,#93B4FF)' : 'linear-gradient(135deg,#4F46E5,#0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
            Welcome{data.patient_name ? `, ${data.patient_name.split(' ')[0]}` : ''}
          </p>
          <p style={{ fontSize: 14, color: dark ? '#4A6A8A' : '#6B7280', marginTop: 6 }}>Your medical imaging results and care team updates</p>
        </div>

        {/* Status banner */}
        <div style={{ ...glass(phase === 2 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'), padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, background: phase === 2 ? (dark ? 'rgba(16,185,129,0.08)' : 'rgba(236,253,245,0.85)') : (dark ? 'rgba(245,158,11,0.08)' : 'rgba(255,251,235,0.85)') }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: phase === 2 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {phase === 2
              ? <svg width="18" height="18" fill="none" stroke="#10B981" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              : <svg width="18" height="18" fill="none" stroke="#F59E0B" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            }
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: phase === 2 ? '#059669' : '#D97706' }}>
              {phase === 2 ? "✓ Your doctor has reviewed your scan" : "Your care team is reviewing your scan"}
            </p>
            <p style={{ fontSize: 12, color: dark ? '#4A6A8A' : '#6B7280', marginTop: 3 }}>
              {phase === 2 ? "Full results and explanation are ready below" : "You'll be notified when your doctor completes the review"}
            </p>
            <p style={{ fontSize: 11, color: dark ? '#253548' : '#9CA3AF', marginTop: 2 }}>
              Scan uploaded today · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          {data.image_url && (
            <button onClick={() => setScanExpanded(true)} style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#6366F1', cursor: 'pointer', fontFamily: 'Syne, sans-serif', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, boxShadow: '0 2px 8px rgba(99,102,241,0.15)' }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7"/></svg>
              View X-Ray
            </button>
          )}
        </div>

        {/* Main 2-col — Avatar | Transcript */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16, alignItems: 'stretch' }}>

          {/* Avatar card */}
          <div style={{ ...glass('rgba(245,158,11,0.2)'), padding: '18px 20px', display: 'flex', flexDirection: 'column', background: dark ? 'rgba(255,252,245,0.03)' : 'rgba(255,252,240,0.85)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(245,158,11,0.1))', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" fill="none" stroke="#F59E0B" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              </div>
              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: dark ? '#E2EAF8' : '#0A1628', lineHeight: 1 }}>Your Care Assistant</p>
                <p style={{ fontSize: 10, color: dark ? '#4A6A8A' : '#9CA3AF', marginTop: 2 }}>AI-powered by MedEcho</p>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: isTyping ? 'rgba(245,158,11,0.12)' : (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'), border: `1px solid ${isTyping ? 'rgba(245,158,11,0.3)' : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')}` }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: isTyping ? '#F59E0B' : '#10B981', animation: isTyping ? 'pulseDot 1s infinite' : 'none' }} />
                <p style={{ fontSize: 10, fontWeight: 600, color: isTyping ? '#F59E0B' : '#10B981' }}>{isTyping ? "Speaking" : "Ready"}</p>
              </div>
            </div>
            <div style={{ height: 320 }}>
              <AvatarPlayer phase={phase} language={data.language} script={currentScript} patientId={patientId} />
            </div>
            {audioUrl && <audio key={audioUrl} autoPlay src={audioUrl} style={{ display: 'none' }}/>}
          </div>

          {/* Transcript card */}
          <div style={{ ...glass('rgba(99,102,241,0.2)'), padding: '18px 20px', display: 'flex', flexDirection: 'column', background: dark ? 'rgba(99,102,241,0.03)' : 'rgba(248,247,255,0.85)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: dark ? '#E2EAF8' : '#0A1628', lineHeight: 1 }}>
                  {phase === 2 ? "Your Full Results" : "Initial Summary"}
                </p>
                <p style={{ fontSize: 10, color: dark ? '#4A6A8A' : '#9CA3AF', marginTop: 2 }}>
                  {phase === 2 ? "Reviewed & approved by your doctor" : "From your care team"}
                </p>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, color: phase === 2 ? '#059669' : '#6366F1', background: phase === 2 ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)', border: `1px solid ${phase === 2 ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.25)'}`, fontFamily: 'Syne, sans-serif', letterSpacing: '0.3px' }}>
                {phase === 2 ? "✓ DOCTOR APPROVED" : "AWAITING REVIEW"}
              </span>
            </div>

            {/* Centered inner box */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(240,244,255,0.7)', border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.12)'}`, borderRadius: 14, padding: '20px 24px' }}>
                {displayedText ? (
                  <p style={{ fontSize: 16, color: dark ? '#C8D8F0' : '#1E293B', lineHeight: 2, textAlign: 'center', fontWeight: 400 }}>
                    "{displayedText}
                    {isTyping && <span style={{ display: 'inline-block', width: 2, height: 16, background: '#6366F1', marginLeft: 2, animation: 'pulseDot 1s infinite', verticalAlign: 'middle' }}/>}
                    "
                  </p>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: dark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                      <svg width="18" height="18" fill="none" stroke="#6366F1" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    </div>
                    <p style={{ fontSize: 13, color: dark ? '#253548' : '#9CA3AF', fontStyle: 'italic' }}>Your explanation will appear here...</p>
                  </div>
                )}
              </div>
            </div>

            {phase === 2 && (
              <button onClick={() => setPhase(1)} style={{ marginTop: 12, padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'transparent', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.2)'}`, color: dark ? '#4A6A8A' : '#6366F1', cursor: 'pointer', fontFamily: 'Syne, sans-serif', alignSelf: 'flex-start' }}>
                ← View Initial Summary
              </button>
            )}
          </div>
        </div>

        {/* Phase 2 — doctor assessment + explanation */}
        {phase === 2 && (data.physician_notes || data.phase2_script) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {data.physician_notes && (
              <div style={{ ...glass('rgba(99,102,241,0.18)'), padding: '18px 20px', background: dark ? 'rgba(99,102,241,0.05)' : 'rgba(245,245,255,0.85)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="12" height="12" fill="none" stroke="#6366F1" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Doctor's Assessment</p>
                </div>
                <p style={{ fontSize: 13, color: dark ? '#8A9ABB' : '#4B5563', lineHeight: 1.8 }}>{data.physician_notes}</p>
              </div>
            )}
            {data.phase2_script && (
              <div style={{ ...glass('rgba(16,185,129,0.25)'), padding: '18px 20px', background: dark ? 'rgba(16,185,129,0.05)' : 'rgba(236,253,245,0.85)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="12" height="12" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.8px' }}>What This Means For You</p>
                </div>
                <p style={{ fontSize: 14, color: dark ? '#C8D8F0' : '#1E293B', lineHeight: 1.85 }}>{data.phase2_script}</p>
              </div>
            )}
          </div>
        )}

        {/* Next steps */}
        <div style={{ ...glass(), padding: '20px 22px', marginBottom: 16, background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)' }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 10, fontWeight: 700, color: dark ? '#4A6A8A' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 14 }}>Your Next Steps</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { icon: '📅', title: 'Your appointment', text: phase === 2 ? 'Discuss results with your physician at your next visit' : 'Wait for your physician to review your scan', color: '#6366F1', bg: dark ? 'rgba(99,102,241,0.08)' : 'rgba(238,242,255,0.9)', border: 'rgba(99,102,241,0.2)' },
              { icon: '❓', title: 'Have questions?', text: 'Write down any questions you have before your next appointment', color: '#F59E0B', bg: dark ? 'rgba(245,158,11,0.08)' : 'rgba(255,251,235,0.9)', border: 'rgba(245,158,11,0.2)' },
              { icon: '🚨', title: 'Feeling worse?', text: 'If symptoms worsen or you feel unwell, contact your care team immediately', color: '#EF4444', bg: dark ? 'rgba(239,68,68,0.08)' : 'rgba(255,241,242,0.9)', border: 'rgba(239,68,68,0.2)' },
            ].map(({ icon, title, text, color, bg, border }, i) => (
              <div key={i} style={{ padding: '14px', borderRadius: 12, background: bg, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{icon}</div>
                <p style={{ fontSize: 13, fontWeight: 700, color, fontFamily: 'Syne, sans-serif' }}>{title}</p>
                <p style={{ fontSize: 12, color: dark ? '#4A6A8A' : '#6B7280', lineHeight: 1.55 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trial card */}
        {phase === 2 && firstTrial && <div style={{ marginBottom: 16 }}><TrialCard trial={firstTrial} /></div>}

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: 8, paddingBottom: 16 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)', border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.1)'}`, marginBottom: 10 }}>
            <svg width="10" height="10" fill="none" stroke="#10B981" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            <p style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>HIPAA Protected</p>
          </div>
          <p style={{ fontSize: 12, color: dark ? '#253548' : '#9CA3AF' }}>Prepared for <strong style={{ fontFamily: 'DM Mono, monospace', fontWeight: 500, color: dark ? '#4A6A8A' : '#6B7280' }}>{data.patient_name}</strong></p>
          <p style={{ fontSize: 11, color: dark ? '#1A2840' : '#CBD5E1', marginTop: 4, fontStyle: 'italic' }}>MedEcho is a research prototype. Not a certified medical device.</p>
        </div>
      </div>
    </div>
  );
}