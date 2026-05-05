// frontend/src/pages/Physician.jsx
// Physician portal — the clinical review interface for MedEcho.

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MedEchoLogo from '../components/MedEchoLogo';

// ---------------------------------------------------------------------------
// Reusable section label
// ---------------------------------------------------------------------------

const SectionLabel = ({ children }) => (
  <p style={{
    fontFamily: 'Syne, sans-serif',
    fontSize: 13,           // CHANGED: 11 → 13
    fontWeight: 700,
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: 8
  }}>
    {children}
  </p>
);


// ---------------------------------------------------------------------------
// Urgency color config
// ---------------------------------------------------------------------------

const URGENCY_CONFIG = {
  Critical: { color: "#EF4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)" },
  Moderate: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  Low:      { color: "#10B981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)" },
};


// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function Physician() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [manualId, setManualId] = useState("");
  const [cases, setCases] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [physicianNotes, setPhysicianNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const obs = new MutationObserver(() => forceUpdate(n => n + 1));
    obs.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const isDark       = document.body.getAttribute('data-theme') !== 'light';
  const sidebarBg    = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)';
  const sidebarBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(61,126,255,0.15)';
  const textPrimary  = isDark ? '#E2EAF8' : '#0A1628';
  const textMuted    = isDark ? 'rgba(255,255,255,0.35)' : '#4A6A9A';
  const cardBg       = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)';
  const cardBorder   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(61,126,255,0.12)';
  const innerBg      = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(61,126,255,0.04)';

  useEffect(() => {
    fetch('/api/cases')
      .then(r => r.json())
      .then(d => setCases(Array.isArray(d) ? d : []))
      .catch(() => setCases([]));
  }, [sent]);

  useEffect(() => {
    if (!patientId) { setData(null); return; }
    setLoading(true);
    setError(null);
    setSent(false);
    setShowHeatmap(false);

    fetch(`/api/patient/${patientId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setLoading(false); return; }
        setData(d);
        setPhysicianNotes(d.physician_notes || "");
        setSent(d.phase === 2);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load patient data."); setLoading(false); });
  }, [patientId]);

  const handleSend = async () => {
    setSending(true);
    await fetch(`/api/approve/${patientId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ physician_notes: physicianNotes }),
    });
    setSending(false);
    setSent(true);
  };

  const pendingCases  = cases.filter(c => c.phase === 1);
  const reviewedCases = cases.filter(c => c.phase === 2);


  // ---------------------------------------------------------------------------
  // Sidebar
  // ---------------------------------------------------------------------------
  const Sidebar = () => {
    const URGENCY_ORDER = { Critical: 0, Moderate: 1, Low: 2 };
    const sortedPending = [...pendingCases].sort((a, b) =>
      (URGENCY_ORDER[a.urgency] ?? 3) - (URGENCY_ORDER[b.urgency] ?? 3)
    );

    return (
      <div
        data-print-hide
        style={{
          width: 300,
          background: sidebarBg,
          borderRight: `1px solid ${sidebarBorder}`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0
        }}
      >
        {/* CHANGED: Brand mark — logo 130→180, height auto→66, added gap between logo and label,
            increased label font size, fixed crowding with flex layout */}
        <div style={{
          padding: 'px px px',
          borderBottom: `1px solid ${sidebarBorder}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          height: 72
        }}>
          <div style={{ flexShrink: 0 }}>
            <MedEchoLogo width="150" height="55" />
          </div>
          {/* Divider */}
          <div style={{
            width: 1, height: 28,
            marginLeft: 0,
            background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(61,126,255,0.2)',
            flexShrink: 0
          }} />
          <p style={{
            fontSize: 14,
            fontWeight: 700,
            color: textMuted,
            fontFamily: 'Syne, sans-serif',
            margin: 0,
            whiteSpace: 'nowrap',
            marginLeft: 10,
          }}>
            Physician Portal
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '12px 12px 6px', gap: 6 }}>
          {['pending', 'reviewed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '7px 0', borderRadius: 8,
                fontSize: 12,             // CHANGED: 11 → 12
                fontWeight: 700,
                fontFamily: 'Syne, sans-serif',
                cursor: 'pointer', border: 'none',
                background: activeTab === tab
                  ? (isDark ? 'rgba(61,126,255,0.15)' : 'rgba(61,126,255,0.1)')
                  : 'transparent',
                color: activeTab === tab ? '#6FA3FF' : textMuted,
                textTransform: 'capitalize',
                transition: 'all 0.15s'
              }}
            >
              {tab} ({tab === 'pending' ? pendingCases.length : reviewedCases.length})
            </button>
          ))}
        </div>

        {/* Case list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
          {(activeTab === 'pending' ? sortedPending : reviewedCases).length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: textMuted }}>No {activeTab} cases</p>
            </div>
          ) : (
            (activeTab === 'pending' ? sortedPending : reviewedCases).map(c => {
              const isActive = c.patient_id === patientId;
              const uc = URGENCY_CONFIG[c.urgency] || URGENCY_CONFIG.Low;
              return (
                <button
                  key={c.patient_id}
                  onClick={() => navigate(`/physician/${c.patient_id}`)}
                  style={{
                    width: '100%', padding: '11px 13px', borderRadius: 12, marginBottom: 4,
                    background: isActive
                      ? (isDark ? 'rgba(61,126,255,0.1)' : 'rgba(61,126,255,0.08)')
                      : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(61,126,255,0.28)' : 'transparent'}`,
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(61,126,255,0.05)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: textPrimary, fontFamily: 'Syne, sans-serif' }}>
                      {c.patient_name}
                    </p>
                    {c.urgency && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                        color: uc.color, background: uc.bg, border: `1px solid ${uc.border}`
                      }}>
                        {c.urgency}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: textMuted }}>
                    {c.condition} · {c.language?.toUpperCase()}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Manual patient ID lookup */}
        <div style={{ padding: '12px', borderTop: `1px solid ${sidebarBorder}` }}>
          <input
            value={manualId}
            onChange={e => setManualId(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && manualId.trim()) navigate(`/physician/${manualId.trim()}`); }}
            placeholder="Paste patient ID..."
            style={{
              width: '100%',
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(240,245,255,0.9)',
              border: `1px solid ${cardBorder}`,
              borderRadius: 8, padding: '8px 12px',
              fontSize: 13, color: textPrimary,   // CHANGED: 12→13
              outline: 'none', fontFamily: 'DM Mono, monospace',
              marginBottom: 8, boxSizing: 'border-box'
            }}
          />
          <button
            onClick={() => { if (manualId.trim()) navigate(`/physician/${manualId.trim()}`); }}
            style={{
              width: '100%', padding: '8px', borderRadius: 8,
              fontSize: 13, fontWeight: 700,      // CHANGED: 12→13
              background: isDark ? 'rgba(61,126,255,0.12)' : 'rgba(61,126,255,0.1)',
              border: '1px solid rgba(61,126,255,0.22)',
              color: '#6FA3FF', cursor: 'pointer', fontFamily: 'Syne, sans-serif'
            }}
          >
            Load Patient →
          </button>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Empty / loading / error states
  // ---------------------------------------------------------------------------
  if (!patientId || (!data && !loading && !error)) return (
    <div className="min-h-screen grid-bg flex" style={{ color: textPrimary }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(61,126,255,0.06)',
            border: `1px solid ${cardBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="26" height="26" fill="none" stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(61,126,255,0.4)"} strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: textMuted, fontFamily: 'Syne, sans-serif' }}>Select a case</p>
          <p style={{ fontSize: 14, color: textMuted, marginTop: 4, opacity: 0.6 }}>Choose from the sidebar to begin review</p>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen grid-bg flex" style={{ color: textPrimary }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: textMuted, fontSize: 15 }}>Loading patient data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen grid-bg flex" style={{ color: textPrimary }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#EF4444', fontSize: 15 }}>{error}</p>
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Derived display values
  // ---------------------------------------------------------------------------
  const urg = URGENCY_CONFIG[data.urgency] || URGENCY_CONFIG.Low;
  const confidencePct = Math.round(data.confidence * 100);

  const confidenceBarColor = confidencePct >= 80
    ? 'linear-gradient(90deg, #10B981, #34D399)'
    : confidencePct >= 60
      ? 'linear-gradient(90deg, #3D7EFF, #60A5FA)'
      : 'linear-gradient(90deg, #F59E0B, #FBBF24)';

  const confidenceGuidance = confidencePct >= 80
    ? 'High confidence — direct communication recommended'
    : confidencePct >= 60
      ? 'Moderate confidence — review carefully before sending'
      : 'Low confidence — physician assessment critical';

  // ---------------------------------------------------------------------------
  // Main portal render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen grid-bg flex" style={{ color: textPrimary }}>
      <Sidebar />

      <div data-print-main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>

          {/* ── Header ── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 700, color: textPrimary }}>
                {data.patient_name}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, color: textMuted }}>{data.language?.toUpperCase()}</span>
                <span style={{ color: textMuted }}>·</span>
                <span style={{ fontSize: 12, color: textMuted, fontFamily: 'DM Mono, monospace' }}>{data.patient_id}</span>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  color: urg.color, background: urg.bg, border: `1px solid ${urg.border}`,
                  fontFamily: 'Syne, sans-serif'
                }}>{data.urgency}</span>
                {sent && (
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    color: '#10B981', background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.2)', fontFamily: 'Syne, sans-serif'
                  }}>✓ Sent to Patient</span>
                )}
              </div>
            </div>

            <button
              onClick={() => window.print()}
              style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(61,126,255,0.07)',
                border: `1px solid ${cardBorder}`, color: textMuted,
                cursor: 'pointer', fontFamily: 'Syne, sans-serif',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export PDF
            </button>
          </div>

          {/* ── Two-column layout ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* ════ Left column ════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Scan / Heatmap toggle card */}
              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <SectionLabel>{showHeatmap ? "GradCAM Heatmap" : "Original Scan"}</SectionLabel>
                  <div style={{
                    display: 'flex',
                    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(61,126,255,0.06)',
                    borderRadius: 8, padding: 3, gap: 2
                  }}>
                    {['Scan', 'Heatmap'].map((label, i) => (
                      <button
                        key={label}
                        onClick={() => setShowHeatmap(i === 1)}
                        style={{
                          padding: '4px 12px', borderRadius: 6,
                          fontSize: 12, fontWeight: 700,          // CHANGED: 11→12
                          fontFamily: 'Syne, sans-serif',
                          cursor: 'pointer', border: 'none',
                          background: showHeatmap === (i === 1)
                            ? (isDark ? 'rgba(61,126,255,0.2)' : 'rgba(61,126,255,0.15)')
                            : 'transparent',
                          color: showHeatmap === (i === 1) ? '#6FA3FF' : textMuted,
                          transition: 'all 0.15s'
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <img
                  src={showHeatmap ? data.heatmap_url : data.image_url}
                  alt={showHeatmap ? "Heatmap" : "Scan"}
                  style={{ width: '100%', borderRadius: 10, objectFit: 'contain', maxHeight: 260 }}
                />
                {showHeatmap && (
                  <p style={{ fontSize: 12, color: textMuted, textAlign: 'center', marginTop: 8 }}>
                    Highlighted regions indicate areas of diagnostic relevance
                  </p>
                )}
              </div>

              {/* AI Findings card */}
              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 16 }}>
                <SectionLabel>AI Findings</SectionLabel>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: textPrimary }}>
                      {data.condition}
                    </p>
                    <p style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>Primary condition</p>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
                    color: urg.color, background: urg.bg, border: `1px solid ${urg.border}`,
                    fontFamily: 'Syne, sans-serif'
                  }}>{data.urgency}</span>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <p style={{ fontSize: 12, color: textMuted }}>Confidence Level</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: textPrimary, fontFamily: 'DM Mono, monospace' }}>
                      {confidencePct}%
                    </p>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(61,126,255,0.1)' }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      width: `${confidencePct}%`,
                      background: confidenceBarColor,
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                  <p style={{ fontSize: 11, color: textMuted, marginTop: 5 }}>
                    {confidenceGuidance}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: 12, color: textMuted, marginBottom: 8 }}>Differential diagnosis</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {data.differential_diagnosis?.map((d, i) => (
                      <span key={i} style={{
                        fontSize: 12, color: textMuted, padding: '4px 10px', borderRadius: 20,
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(61,126,255,0.06)',
                        border: `1px solid ${cardBorder}`
                      }}>{d}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Clinical Report */}
              {data.clinical_report && (
                <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 16 }}>
                  <SectionLabel>AI Clinical Report</SectionLabel>
                  <p style={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.55)' : '#3A5A8E', lineHeight: 1.75 }}>
                    {data.clinical_report}
                  </p>
                </div>
              )}
            </div>

            {/* ════ Right column ════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Patient symptoms */}
              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 16 }}>
                <SectionLabel>Patient Symptoms</SectionLabel>
                <p style={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.5)' : '#3A5A8E', lineHeight: 1.7 }}>
                  {data.symptoms || <span style={{ fontStyle: 'italic', color: textMuted }}>No symptoms reported.</span>}
                </p>
              </div>

              {/* Clinician notes */}
              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 16 }}>
                <SectionLabel>Clinician Notes</SectionLabel>
                <p style={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.5)' : '#3A5A8E', lineHeight: 1.7 }}>
                  {data.clinician_notes || <span style={{ fontStyle: 'italic', color: textMuted }}>No notes provided.</span>}
                </p>
              </div>

              {/* Physician assessment */}
              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 16 }}>
                <SectionLabel>Your Assessment</SectionLabel>
                <textarea
                  value={physicianNotes}
                  onChange={e => setPhysicianNotes(e.target.value)}
                  placeholder="Add your clinical assessment — Gemini will rewrite this into plain language for the patient..."
                  rows={5}
                  disabled={sent}
                  style={{
                    width: '100%', borderRadius: 10, padding: '10px 14px',
                    fontSize: 14, color: isDark ? 'rgba(255,255,255,0.7)' : '#0A1628',
                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(240,245,255,0.8)',
                    border: `1px solid ${cardBorder}`,
                    outline: 'none', resize: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                    opacity: sent ? 0.5 : 1,
                    boxSizing: 'border-box', lineHeight: 1.6
                  }}
                />
                <p style={{ fontSize: 12, color: textMuted, marginTop: 6 }}>
                  Gemini will rewrite this into plain language for the patient.
                </p>
              </div>

              {/* Matched clinical trials */}
              {data.trials && data.trials.length > 0 && (
                <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <svg width="13" height="13" fill="none" stroke="#6FA3FF" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <SectionLabel>Matched Clinical Trials</SectionLabel>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.trials.map((trial, i) => (
                      <div
                        key={i}
                        onClick={() => trial.nct_id && window.open(`https://clinicaltrials.gov/study/${trial.nct_id}`, '_blank')}
                        style={{
                          borderRadius: 12, padding: '12px 14px',
                          background: innerBg, border: `1px solid ${cardBorder}`,
                          cursor: trial.nct_id ? 'pointer' : 'default',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => {
                          if (trial.nct_id) {
                            e.currentTarget.style.borderColor = 'rgba(61,126,255,0.3)';
                            e.currentTarget.style.background = isDark ? 'rgba(61,126,255,0.06)' : 'rgba(61,126,255,0.07)';
                          }
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = cardBorder;
                          e.currentTarget.style.background = innerBg;
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.75)' : '#1A3A6E', lineHeight: 1.45, flex: 1 }}>
                            {trial.name}
                          </p>
                          {trial.match_score !== undefined && (
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, flexShrink: 0,
                              color: trial.match_score >= 70 ? '#10B981' : trial.match_score >= 40 ? '#F59E0B' : '#9CA3AF',
                              background: trial.match_score >= 70 ? 'rgba(16,185,129,0.1)' : trial.match_score >= 40 ? 'rgba(245,158,11,0.1)' : 'rgba(156,163,175,0.1)',
                              border: `1px solid ${trial.match_score >= 70 ? 'rgba(16,185,129,0.25)' : trial.match_score >= 40 ? 'rgba(245,158,11,0.25)' : 'rgba(156,163,175,0.2)'}`
                            }}>
                              {trial.match_score}% match
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: 11, padding: '2px 8px', borderRadius: 20,
                            color: '#10B981', background: 'rgba(16,185,129,0.1)',
                            border: '1px solid rgba(16,185,129,0.2)'
                          }}>{trial.status}</span>
                          {trial.phase && trial.phase !== 'N/A' && (
                            <span style={{
                              fontSize: 11, padding: '2px 8px', borderRadius: 20,
                              color: '#6FA3FF', background: 'rgba(61,126,255,0.1)',
                              border: '1px solid rgba(61,126,255,0.2)'
                            }}>{trial.phase}</span>
                          )}
                          <span style={{ fontSize: 12, color: textMuted }}>{trial.location}</span>
                          {trial.nct_id && (
                            <span style={{ fontSize: 12, color: '#6FA3FF', marginLeft: 'auto', fontWeight: 600 }}>
                              View →
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Send to Patient button */}
              <button
                onClick={handleSend}
                disabled={sending || sent}
                style={{
                  width: '100%', padding: '15px', borderRadius: 12,
                  fontSize: 16, fontWeight: 700,                    // CHANGED: 14→16
                  cursor: sent ? 'default' : 'pointer',
                  fontFamily: 'Syne, sans-serif',
                  transition: 'all 0.2s',
                  background: sent
                    ? 'rgba(16,185,129,0.1)'
                    : 'linear-gradient(135deg, #10B981, #059669)',
                  color: sent ? '#10B981' : 'white',
                  border: sent ? '1px solid rgba(16,185,129,0.25)' : 'none',
                  opacity: sending ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: sent ? 'none' : '0 4px 20px rgba(16,185,129,0.25)',
                }}
              >
                {sent ? (
                  <>
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7"/>
                    </svg>
                    Sent to Patient
                  </>
                ) : sending ? "Sending..." : (
                  <>
                    <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                    </svg>
                    Send to Patient
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}