import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const Card = ({ children, className = "" }) => (
  <div className={`glass rounded-2xl p-5 flex flex-col gap-4 ${className}`}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <p style={{fontFamily: 'Syne, sans-serif'}} className="text-xs font-semibold text-white/30 uppercase tracking-widest">{children}</p>
);

export default function Physician() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [manualId, setManualId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!!patientId);
  const [error, setError] = useState(null);
  const [physicianNotes, setPhysicianNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    fetch(`/api/patient/${patientId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); setLoading(false); return; }
        setData(d);
        setPhysicianNotes(d.physician_notes || "");
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
    Critical: { color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)" },
    Moderate: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
    Low: { color: "#10B981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)" },
  };

  if (!patientId) return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center p-8 gap-8">
      <div className="fade-in-up stagger-1 text-center">
        <h1 style={{fontFamily: 'Syne, sans-serif'}} className="text-3xl font-bold text-white">MedEcho</h1>
        <p className="text-white/30 text-sm mt-1">Physician Portal</p>
      </div>
      <div className="fade-in-up stagger-2 w-full max-w-md glass rounded-3xl p-8 flex flex-col gap-4">
        <SectionLabel>Patient ID</SectionLabel>
        <input
          type="text"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          placeholder="P-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none"
          style={{border: '1px solid rgba(255,255,255,0.07)', fontFamily: 'DM Mono, monospace'}}
        />
        <button
          onClick={() => { if (manualId.trim()) navigate(`/physician/${manualId.trim()}`); }}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 accent-glow"
          style={{background: 'linear-gradient(135deg, #10B981, #059669)', fontFamily: 'Syne, sans-serif'}}
        >
          Load Patient →
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen grid-bg flex items-center justify-center">
      <p className="text-white/30 text-sm">Loading patient data...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen grid-bg flex items-center justify-center">
      <p className="text-red-400/70 text-sm">{error}</p>
    </div>
  );

  const urg = urgencyConfig[data.urgency] || urgencyConfig.Low;

  return (
    <div className="min-h-screen grid-bg text-white p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="fade-in-up stagger-1 flex items-center justify-between">
          <div>
            <h1 style={{fontFamily: 'Syne, sans-serif'}} className="text-2xl font-bold text-white">MedEcho</h1>
            <p className="text-white/30 text-sm mt-0.5">Physician Portal</p>
          </div>
          <div className="text-right">
            <p style={{fontFamily: 'Syne, sans-serif'}} className="text-white font-semibold text-lg">{data.patient_name}</p>
            <p className="text-white/25 text-xs mt-0.5" style={{fontFamily: 'DM Mono, monospace'}}>{data.patient_id}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">

          {/* Left column */}
          <div className="flex flex-col gap-4">

            {/* Scan */}
            <div className="fade-in-up stagger-2 glass rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <SectionLabel>{showHeatmap ? "GradCAM Heatmap" : "Original Scan"}</SectionLabel>
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className="text-xs transition-colors"
                  style={{color: '#3D7EFF'}}
                >
                  {showHeatmap ? "Show original" : "Show heatmap"}
                </button>
              </div>
              <img
                src={showHeatmap ? data.heatmap_url : data.image_url}
                alt={showHeatmap ? "Heatmap" : "Scan"}
                className="rounded-xl w-full object-contain max-h-72"
              />
            </div>

            {/* AI Findings */}
            <Card className="fade-in-up stagger-3">
              <SectionLabel>AI Findings</SectionLabel>

              <div className="flex items-start justify-between">
                <div>
                  <p style={{fontFamily: 'Syne, sans-serif'}} className="text-white font-bold text-xl">{data.condition}</p>
                  <p className="text-white/30 text-xs mt-0.5">Primary condition</p>
                </div>
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{color: urg.color, background: urg.bg, border: `1px solid ${urg.border}`, fontFamily: 'Syne, sans-serif'}}
                >
                  {data.urgency}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-full h-1.5" style={{background: 'rgba(255,255,255,0.06)'}}>
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{width: `${Math.round(data.confidence * 100)}%`, background: 'linear-gradient(90deg, #3D7EFF, #60A5FA)'}}
                  />
                </div>
                <p className="text-white/40 text-xs w-9 text-right">{Math.round(data.confidence * 100)}%</p>
              </div>

              <div>
                <p className="text-white/25 text-xs mb-2">Differential</p>
                <div className="flex flex-wrap gap-2">
                  {data.differential_diagnosis.map((d, i) => (
                    <span key={i} className="text-xs text-white/50 px-3 py-1 rounded-full" style={{background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)'}}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* AI Clinical Report */}
            {data.clinical_report && (
              <Card className="fade-in-up stagger-4">
                <SectionLabel>AI Clinical Report</SectionLabel>
                <p className="text-white/60 text-sm leading-relaxed">{data.clinical_report}</p>
              </Card>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Clinician Notes */}
            <Card className="fade-in-up stagger-2">
              <SectionLabel>Clinician Notes</SectionLabel>
              <p className="text-white/50 text-sm leading-relaxed">
                {data.clinician_notes || <span className="text-white/20 italic">No notes provided.</span>}
              </p>
            </Card>

            {/* Your Assessment */}
            <Card className="fade-in-up stagger-3">
              <SectionLabel>Your Assessment</SectionLabel>
              <textarea
                value={physicianNotes}
                onChange={(e) => setPhysicianNotes(e.target.value)}
                placeholder="Add your clinical assessment..."
                rows={5}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none resize-none transition-all"
                style={{background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)'}}
              />
            </Card>

            {/* Trials */}
            {data.trials && data.trials.length > 0 && (
              <Card className="fade-in-up stagger-4">
                <SectionLabel>Matched Clinical Trials</SectionLabel>
                <div className="flex flex-col gap-2">
                  {data.trials.map((trial, i) => (
                    <div
                        key={i}
                        className="rounded-xl p-3 flex flex-col gap-1.5 cursor-pointer transition-all"
                        style={{background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'}}
                        onClick={() => trial.nct_id && window.open(`https://clinicaltrials.gov/study/${trial.nct_id}`, '_blank')}
                        >
                        <p className="text-white/70 text-xs font-medium leading-snug">{trial.name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{color: '#10B981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)'}}>
                            {trial.status}
                            </span>
                            {trial.phase && trial.phase !== "N/A" && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{color: '#3D7EFF', background: 'rgba(61,126,255,0.1)', border: '1px solid rgba(61,126,255,0.2)'}}>
                                {trial.phase}
                            </span>
                            )}
                            <span className="text-white/25 text-xs">{trial.location}</span>
                            {trial.nct_id && (
                            <span className="text-xs ml-auto" style={{color: '#3D7EFF'}}>View →</span>
                            )}
                        </div>
                        </div>
                    ))}
                    </div>
                </Card>
            )}

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={sending || sent}
              className="fade-in-up stagger-5 w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
              style={{
                background: sent ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg, #10B981, #059669)',
                border: sent ? '1px solid rgba(16,185,129,0.3)' : 'none',
                color: sent ? '#10B981' : 'white',
                fontFamily: 'Syne, sans-serif'
              }}
            >
              {sent ? "Sent to Patient ✓" : sending ? "Sending..." : "Send to Patient →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}