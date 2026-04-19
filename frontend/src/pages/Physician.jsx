import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const SectionLabel = ({ children }) => (
  <p style={{
    fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 600,
    color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
    letterSpacing: '0.8px', marginBottom: 8
  }}>{children}</p>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 16, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10,
    ...style
  }}>{children}</div>
);

export default function Physician() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [manualId, setManualId] = useState("");
  const [cases, setCases] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [physicianNotes, setPhysicianNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => forceUpdate(n => n + 1));
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const isDark = document.body.getAttribute('data-theme') !== 'light';

  const sidebarBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)';
  const sidebarBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(61,126,255,0.15)';
  const textPrimary = isDark ? 'white' : '#0A1628';
  const textMuted = isDark ? 'rgba(255,255,255,0.3)' : '#4A6A9A';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(61,126,255,0.12)';

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

  const urgencyConfig = {
    Critical: { color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
    Moderate: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
    Low: { color: "#10B981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)" },
  };

  const pendingCases = cases.filter(c => c.phase === 1);
  const reviewedCases = cases.filter(c => c.phase === 2);

  const Sidebar = () => (
    <div data-print-hide style={{
      width: 320, background: sidebarBg,
      borderRight: `1px solid ${sidebarBorder}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      height: '100vh', position: 'sticky', top: 0
    }}>
      {/* Header */}
      <div style={{padding: '20px 18px', borderBottom: `1px solid ${sidebarBorder}`}}>
        <p style={{fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700, color: textPrimary}}>MedEcho</p>
        <p style={{fontSize: 12, color: textMuted, marginTop: 2}}>Physician Portal</p>
      </div>

      {/* Tabs */}
      <div style={{display: 'flex', padding: '12px 12px 8px', gap: 6}}>
        {['pending', 'reviewed'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 600,
            fontFamily: 'Syne, sans-serif', cursor: 'pointer', border: 'none',
            background: activeTab === tab ? 'rgba(61,126,255,0.15)' : 'transparent',
            color: activeTab === tab ? '#6FA3FF' : textMuted,
            textTransform: 'capitalize', transition: 'all 0.15s'
          }}>
            {tab} ({tab === 'pending' ? pendingCases.length : reviewedCases.length})
          </button>
        ))}
      </div>

      {/* Case list */}
      <div style={{flex: 1, overflowY: 'auto', padding: '4px 8px'}}>
        {(activeTab === 'pending' ? pendingCases : reviewedCases).length === 0 ? (
          <div style={{padding: 24, textAlign: 'center'}}>
            <p style={{fontSize: 13, color: textMuted}}>No {activeTab} cases</p>
          </div>
        ) : (
          (activeTab === 'pending' ? pendingCases : reviewedCases).map(c => {
            const isActive = c.patient_id === patientId;
            return (
              <button key={c.patient_id}
                onClick={() => navigate(`/physician/${c.patient_id}`)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12, marginBottom: 4,
                  background: isActive ? 'rgba(61,126,255,0.12)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(61,126,255,0.3)' : 'transparent'}`,
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(61,126,255,0.05)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4}}>
                  <p style={{fontSize: 14, fontWeight: 600, color: textPrimary, fontFamily: 'Syne, sans-serif'}}>{c.patient_name}</p>
                  {c.urgency && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      color: urgencyConfig[c.urgency]?.color,
                      background: urgencyConfig[c.urgency]?.bg,
                      border: `1px solid ${urgencyConfig[c.urgency]?.border}`
                    }}>{c.urgency}</span>
                  )}
                </div>
                <p style={{fontSize: 12, color: textMuted}}>{c.condition} · {c.language?.toUpperCase()}</p>
              </button>
            );
          })
        )}
      </div>

      {/* Manual ID */}
      <div style={{padding: '12px 12px', borderTop: `1px solid ${sidebarBorder}`}}>
        <input
          value={manualId}
          onChange={e => setManualId(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && manualId.trim()) navigate(`/physician/${manualId.trim()}`); }}
          placeholder="Paste patient ID..."
          style={{
            width: '100%', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(240,245,255,0.9)',
            border: `1px solid ${cardBorder}`, borderRadius: 8,
            padding: '8px 12px', fontSize: 12, color: textPrimary, outline: 'none',
            fontFamily: 'DM Mono, monospace', marginBottom: 8
          }}
        />
        <button onClick={() => { if (manualId.trim()) navigate(`/physician/${manualId.trim()}`); }}
          style={{
            width: '100%', padding: '8px', borderRadius: 8, fontSize: 12,
            fontWeight: 600, background: 'rgba(61,126,255,0.15)',
            border: '1px solid rgba(61,126,255,0.25)', color: '#6FA3FF',
            cursor: 'pointer', fontFamily: 'Syne, sans-serif'
          }}>
          Load Patient →
        </button>
      </div>
    </div>
  );

  if (!patientId || (!data && !loading && !error)) return (
    <div className="min-h-screen grid-bg flex" style={{color: textPrimary}}>
      <Sidebar />
      <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(61,126,255,0.06)',
            border: `1px solid ${cardBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="28" height="28" fill="none" stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(61,126,255,0.4)"} strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p style={{fontSize: 16, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.4)' : '#4A6A9A', fontFamily: 'Syne, sans-serif'}}>Select a case</p>
          <p style={{fontSize: 13, color: isDark ? 'rgba(255,255,255,0.2)' : '#7A9CC8', marginTop: 4}}>Choose from the sidebar to review</p>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen grid-bg flex" style={{color: textPrimary}}>
      <Sidebar />
      <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <p style={{color: textMuted, fontSize: 14}}>Loading patient data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen grid-bg flex" style={{color: textPrimary}}>
      <Sidebar />
      <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <p style={{color: '#EF4444', fontSize: 14}}>{error}</p>
      </div>
    </div>
  );

  const urg = urgencyConfig[data.urgency] || urgencyConfig.Low;

  return (
    <div className="min-h-screen grid-bg flex" style={{color: textPrimary}}>
      <Sidebar />

      {/* Main */}
      <div data-print-main style={{flex: 1, overflowY: 'auto', padding: '28px 32px'}}>
        <div style={{maxWidth: 960, margin: '0 auto'}}>

          {/* Header */}
          <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24}}>
            <div>
              <p style={{fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: textPrimary}}>{data.patient_name}</p>
              <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap'}}>
                <span style={{fontSize: 12, color: textMuted}}>{data.language?.toUpperCase()}</span>
                <span style={{color: textMuted}}>·</span>
                <span style={{fontSize: 11, color: textMuted, fontFamily: 'DM Mono, monospace'}}>{data.patient_id}</span>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                  color: urg.color, background: urg.bg, border: `1px solid ${urg.border}`,
                  fontFamily: 'Syne, sans-serif'
                }}>{data.urgency}</span>
                {sent && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                    color: '#10B981', background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.2)', fontFamily: 'Syne, sans-serif'
                  }}>✓ Sent to Patient</span>
                )}
              </div>
            </div>
            <button onClick={() => window.print()} style={{
              padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600,
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(61,126,255,0.08)',
              border: `1px solid ${cardBorder}`,
              color: textMuted, cursor: 'pointer', fontFamily: 'Syne, sans-serif',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Export PDF
            </button>
          </div>

          {/* Two columns */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>

            {/* Left */}
            <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>

              {/* Scan */}
              <div style={{background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 16}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12}}>
                  <SectionLabel>{showHeatmap ? "GradCAM Heatmap" : "Original Scan"}</SectionLabel>
                  <div style={{
                    display: 'flex', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(61,126,255,0.06)',
                    borderRadius: 8, padding: 3, gap: 2
                  }}>
                    {['Scan', 'Heatmap'].map((label, i) => (
                      <button key={label} onClick={() => setShowHeatmap(i === 1)} style={{
                        padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        fontFamily: 'Syne, sans-serif', cursor: 'pointer', border: 'none',
                        background: showHeatmap === (i === 1) ? 'rgba(61,126,255,0.2)' : 'transparent',
                        color: showHeatmap === (i === 1) ? '#6FA3FF' : textMuted,
                        transition: 'all 0.15s'
                      }}>{label}</button>
                    ))}
                  </div>
                </div>
                <img
                  src={showHeatmap ? data.heatmap_url : data.image_url}
                  alt={showHeatmap ? "Heatmap" : "Scan"}
                  style={{width: '100%', borderRadius: 10, objectFit: 'contain', maxHeight: 260}}
                />
                {showHeatmap && (
                  <p style={{fontSize: 11, color: textMuted, textAlign: 'center', marginTop: 8}}>
                    Highlighted regions indicate areas of diagnostic relevance
                  </p>
                )}
              </div>

              {/* AI Findings */}
              <div style={{background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 16}}>
                <SectionLabel>AI Findings</SectionLabel>
                <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12}}>
                  <div>
                    <p style={{fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: textPrimary}}>{data.condition}</p>
                    <p style={{fontSize: 11, color: textMuted, marginTop: 2}}>Primary condition</p>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
                    color: urg.color, background: urg.bg, border: `1px solid ${urg.border}`,
                    fontFamily: 'Syne, sans-serif'
                  }}>{data.urgency}</span>
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
                  <div style={{flex: 1, height: 4, borderRadius: 2, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(61,126,255,0.1)'}}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      width: `${Math.round(data.confidence * 100)}%`,
                      background: 'linear-gradient(90deg, #3D7EFF, #60A5FA)'
                    }} />
                  </div>
                  <p style={{fontSize: 12, color: textMuted, fontFamily: 'DM Mono, monospace'}}>
                    {Math.round(data.confidence * 100)}%
                  </p>
                </div>

                <div>
                  <p style={{fontSize: 11, color: textMuted, marginBottom: 8}}>Differential diagnosis</p>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
                    {data.differential_diagnosis?.map((d, i) => (
                      <span key={i} style={{
                        fontSize: 11, color: textMuted, padding: '4px 10px',
                        borderRadius: 20,
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(61,126,255,0.06)',
                        border: `1px solid ${cardBorder}`
                      }}>{d}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Clinical Report */}
              {data.clinical_report && (
                <div style={{background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 16}}>
                  <SectionLabel>AI Clinical Report</SectionLabel>
                  <p style={{fontSize: 13, color: isDark ? 'rgba(255,255,255,0.55)' : '#3A5A8E', lineHeight: 1.7}}>{data.clinical_report}</p>
                </div>
              )}
            </div>

            {/* Right */}
            <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>

              {/* Symptoms */}
              <div style={{background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 16}}>
                <SectionLabel>Patient Symptoms</SectionLabel>
                <p style={{fontSize: 13, color: isDark ? 'rgba(255,255,255,0.5)' : '#3A5A8E', lineHeight: 1.6}}>
                  {data.symptoms || <span style={{fontStyle: 'italic', color: textMuted}}>No symptoms reported.</span>}
                </p>
              </div>

              {/* Clinician Notes */}
              <div style={{background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 16}}>
                <SectionLabel>Clinician Notes</SectionLabel>
                <p style={{fontSize: 13, color: isDark ? 'rgba(255,255,255,0.5)' : '#3A5A8E', lineHeight: 1.6}}>
                  {data.clinician_notes || <span style={{fontStyle: 'italic', color: textMuted}}>No notes provided.</span>}
                </p>
              </div>

              {/* Physician Assessment */}
              <div style={{background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 16}}>
                <SectionLabel>Your Assessment</SectionLabel>
                <textarea
                  value={physicianNotes}
                  onChange={e => setPhysicianNotes(e.target.value)}
                  placeholder="Add your clinical assessment — Gemini will rewrite this into plain language for the patient..."
                  rows={5}
                  disabled={sent}
                  style={{
                    width: '100%', borderRadius: 10, padding: '10px 14px',
                    fontSize: 13, color: isDark ? 'rgba(255,255,255,0.7)' : '#0A1628',
                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(240,245,255,0.8)',
                    border: `1px solid ${cardBorder}`,
                    outline: 'none', resize: 'none', fontFamily: 'DM Sans, sans-serif',
                    opacity: sent ? 0.5 : 1
                  }}
                />
                <p style={{fontSize: 11, color: textMuted}}>
                  Gemini will rewrite this into plain language for the patient.
                </p>
              </div>

              {/* Matched Trials */}
              {data.trials && data.trials.length > 0 && (
                <div style={{background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 16}}>
                  <SectionLabel>Matched Clinical Trials</SectionLabel>
                  <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                    {data.trials.map((trial, i) => (
                      <div key={i} style={{
                        borderRadius: 10, padding: '10px 12px',
                        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(61,126,255,0.04)',
                        border: `1px solid ${cardBorder}`
                      }}>
                        <p style={{fontSize: 12, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.7)' : '#1A3A6E', lineHeight: 1.4, marginBottom: 6}}>{trial.name}</p>
                        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                          <span style={{
                            fontSize: 10, padding: '2px 8px', borderRadius: 20,
                            color: '#10B981', background: 'rgba(16,185,129,0.1)',
                            border: '1px solid rgba(16,185,129,0.2)'
                          }}>{trial.status}</span>
                          <span style={{fontSize: 11, color: textMuted}}>{trial.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={sending || sent}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  fontSize: 14, fontWeight: 600,
                  cursor: sent ? 'default' : 'pointer',
                  fontFamily: 'Syne, sans-serif',
                  background: sent ? 'rgba(16,185,129,0.12)' : 'linear-gradient(135deg, #10B981, #059669)',
                  color: sent ? '#10B981' : 'white',
                  border: sent ? '1px solid rgba(16,185,129,0.25)' : 'none',
                  opacity: sending ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: sent ? 'none' : '0 0 24px rgba(16,185,129,0.2)',
                  transition: 'all 0.2s'
                }}
              >
                {sent ? (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7"/>
                    </svg>
                    Sent to Patient
                  </>
                ) : sending ? "Sending..." : (
                  <>
                    <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
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