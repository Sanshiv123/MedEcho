import { useEffect, useRef, useState } from "react";

const Label = ({ children }) => (
  <p style={{fontFamily: 'Syne, sans-serif'}} className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">{children}</p>
);

const Input = ({ ...props }) => (
  <input
    {...props}
    className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#3D7EFF]/50 transition-all"
    style={{border: '1px solid rgba(255,255,255,0.07)'}}
  />
);

const Textarea = ({ ...props }) => (
  <textarea
    {...props}
    className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none resize-none transition-all"
    style={{border: '1px solid rgba(255,255,255,0.07)'}}
  />
);

function StepIndicator({ step, label, active, completed }) {
  const isDark = document.body.getAttribute('data-theme') !== 'light';
  
  const circleStyle = completed || active ? {
    background: '#3D7EFF',
    color: '#fff',
    border: '1px solid #3D7EFF'
  } : isDark ? {
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.3)',
    border: '1px solid rgba(255,255,255,0.1)'
  } : {
    background: 'rgba(61,126,255,0.08)',
    color: '#4A6A9A',
    border: '1px solid rgba(61,126,255,0.25)'
  };

  const labelColor = completed || active 
    ? (isDark ? 'rgba(255,255,255,0.7)' : '#1A3A6E')
    : (isDark ? 'rgba(255,255,255,0.3)' : '#6A8AB8');

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all text-sm"
        style={{fontFamily: 'Syne, sans-serif', ...circleStyle}}>
        {completed ? (
          <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7"/>
          </svg>
        ) : step}
      </div>
      <span className="text-xs" style={{color: labelColor, fontFamily: 'Syne, sans-serif'}}>{label}</span>
    </div>
  );
}

export default function Clinician() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState(1);
  const [patientName, setPatientName] = useState("");
  const [patientLocation, setPatientLocation] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const observer = new MutationObserver(() => forceUpdate(n => n + 1));
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const patientId = useRef(`P-${crypto.randomUUID()}`);

  const handleFile = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => p >= 90 ? 90 : p + Math.random() * 15);
    }, 300);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("symptoms", symptoms);
    formData.append("language", language);
    formData.append("clinician_notes", notes);
    formData.append("patient_id", patientId.current);
    formData.append("patient_name", patientName);
    formData.append("patient_location", patientLocation);

    const res = await fetch("/api/scan", { method: "POST", body: formData });
    const data = await res.json();
    clearInterval(interval);
    setProgress(100);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center p-8 gap-8">

      {/* Header */}
      <div className="fade-in-up stagger-1 w-full max-w-5xl flex items-center justify-between">
        <div>
          <h1 style={{fontFamily: 'Syne, sans-serif'}} className="text-2xl font-bold text-white">MedEcho</h1>
          <p className="text-white/30 text-xs mt-0.5">Clinician Portal</p>
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs flex items-center gap-2"
          style={{background: 'rgba(61,126,255,0.1)', border: '1px solid rgba(61,126,255,0.2)', color: '#3D7EFF', fontFamily: 'Syne, sans-serif'}}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#3D7EFF]" />
          Active Session
        </div>
      </div>

      {/* Step indicators */}
      <div className="fade-in-up stagger-1 flex items-center gap-4">
        <StepIndicator step={1} label="Upload & Submit" active={step === 1} completed={step === 2 || !!result} />
        <div style={{
          width: 96, height: 1,
          background: step > 1 || result ? '#3D7EFF' : 
            document.body.getAttribute('data-theme') === 'light' ? 'rgba(61,126,255,0.3)' : 'rgba(255,255,255,0.15)'
        }} />
        <StepIndicator step={2} label="Patient Details" active={step === 2 && !result} completed={!!result} />
        <div style={{
          width: 96, height: 1,
          background: result ? '#3D7EFF' : 
            document.body.getAttribute('data-theme') === 'light' ? 'rgba(61,126,255,0.3)' : 'rgba(255,255,255,0.15)'
        }} />
        <StepIndicator step={3} label="Confirmation" active={!!result} completed={false} />
      </div>

      {!result && (
        <div className="fade-in-up stagger-2 w-full max-w-5xl">

          {step === 1 && (
            <div className="grid grid-cols-2 gap-6">
              {/* Left — Patient info */}
              <div className="glass rounded-3xl p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'rgba(61,126,255,0.1)'}}>
                    <svg width="16" height="16" fill="none" stroke="#3D7EFF" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <p style={{fontFamily: 'Syne, sans-serif'}} className="text-white font-semibold text-sm">Patient Information</p>
                </div>

                <div>
                  <Label>Patient name</Label>
                  <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Jane Smith" />
                </div>
                <div>
                  <Label>Patient city</Label>
                  <Input value={patientLocation} onChange={(e) => setPatientLocation(e.target.value)} placeholder="New York" />
                </div>
                <div>
                  <Label>Patient language</Label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}
                    className="w-full glass rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
                    style={{border: '1px solid rgba(255,255,255,0.07)'}}>
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Spanish</option>
                    <option value="fr">🇫🇷 French</option>
                    <option value="hi">🇮🇳 Hindi</option>
                  </select>
                </div>
                <div>
                  <Label>Patient symptoms</Label>
                  <Textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="e.g. chest pain, shortness of breath..." rows={3} />
                </div>
                <div>
                  <Label>Clinician notes <span className="normal-case text-white/20 font-normal">(optional)</span></Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add relevant clinical context..." rows={2} />
                </div>
              </div>

              {/* Right — Scan upload */}
              <div className="flex flex-col gap-6">
                <div className="glass rounded-3xl p-6 flex flex-col gap-4 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'rgba(61,126,255,0.1)'}}>
                      <svg width="16" height="16" fill="none" stroke="#3D7EFF" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <p style={{fontFamily: 'Syne, sans-serif'}} className="text-white font-semibold text-sm">Scan Upload</p>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => document.getElementById("fileInput").click()}
                    className="rounded-2xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4 flex-1"
                    style={{
                      border: `1.5px dashed ${dragging ? '#3D7EFF' : 'rgba(255,255,255,0.1)'}`,
                      background: dragging ? 'rgba(61,126,255,0.05)' : 'transparent',
                      padding: preview ? '16px' : '48px 24px',
                      minHeight: '200px'
                    }}
                  >
                    {preview ? (
                      <div className="relative w-full">
                        <img src={preview} alt="Preview" className="rounded-xl object-contain w-full" style={{maxHeight: 280}} />
                        <button
                          onClick={(e) => { e.stopPropagation(); setImage(null); setPreview(null); }}
                          style={{
                            position: 'absolute', top: 8, right: 8,
                            width: 28, height: 28,
                            background: 'rgba(0,0,0,0.7)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50%', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                          <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background: 'rgba(61,126,255,0.1)'}}>
                          <svg width="22" height="22" fill="none" stroke="#3D7EFF" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="text-white/70 text-sm font-medium">Drop X-ray or skin image</p>
                          <p className="text-white/25 text-xs mt-1">or click to browse — PNG, JPG</p>
                        </div>
                      </>
                    )}
                    <input id="fileInput" type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                  </div>
                </div>

                {/* What happens info card */}
                <div className="rounded-2xl p-4 flex flex-col gap-3"
                  style={{background: 'rgba(61,126,255,0.05)', border: '1px dashed rgba(61,126,255,0.2)'}}>
                  <p style={{fontFamily: 'Syne, sans-serif'}} className="text-white/60 text-xs font-semibold uppercase tracking-widest">What happens when you submit?</p>
                  {[
                    "AI triage runs immediately — CNN classification + GradCAM heatmap",
                    "Patient receives a reassuring Phase 1 summary in their language",
                    "Clinical trials are matched automatically via ClinicalTrials.gov"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{background: 'rgba(16,185,129,0.15)'}}>
                        <svg width="10" height="10" fill="none" stroke="#10B981" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                      <p className="text-white/40 text-xs">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Progress bar during loading */}
          {loading && (
            <div className="mt-6 glass rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Processing scan...</span>
                <span className="text-[#3D7EFF] font-semibold" style={{fontFamily: 'DM Mono, monospace'}}>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{background: 'rgba(255,255,255,0.05)'}}>
                <div className="h-full rounded-full transition-all duration-300" style={{width: `${progress}%`, background: 'linear-gradient(90deg, #3D7EFF, #2563EB)'}} />
              </div>
              <p className="text-white/25 text-xs">Running CNN inference, generating AI report, matching clinical trials...</p>
            </div>
          )}

          {/* Submit button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              disabled={!image || !patientName || !symptoms || loading}
              className="px-12 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 accent-glow"
              style={{background: 'linear-gradient(135deg, #3D7EFF, #2563EB)', fontFamily: 'Syne, sans-serif'}}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Analyzing scan...
                </span>
              ) : "Submit to Physician & Notify Patient →"}
            </button>
          </div>
        </div>
      )}

      {/* Success screen */}
      {result && (
        <div className="fade-in-up stagger-1 w-full max-w-2xl glass rounded-3xl p-10 flex flex-col items-center gap-6 text-center">
          
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)'}}>
            <svg width="32" height="32" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7"/>
            </svg>
          </div>

          <div>
            <p style={{fontFamily: 'Syne, sans-serif'}} className="text-white text-2xl font-bold">Case Submitted Successfully</p>
            <p className="text-white/30 text-sm mt-2">The medical report has been sent to the physician and the patient has been notified.</p>
          </div>

          {/* Simple status lines — no boxes */}
          <div className="w-full flex flex-col gap-3">
            {[
              { icon: "✓", label: "Physician notified", desc: "AI analysis, scan and clinical notes sent for review", color: '#3D7EFF' },
              { icon: "✓", label: "Patient informed", desc: `${result.patient_name} can now view their scan with a Phase 1 summary`, color: '#10B981' },
              { icon: "✓", label: "Clinical trials matched", desc: "Relevant trials found via ClinicalTrials.gov", color: '#A78BFA' }
            ].map(({ icon, label, desc, color }) => (
              <div key={label} className="flex items-center gap-4 text-left px-4 py-3 rounded-xl"
                style={{background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'}}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{background: `${color}18`, border: `1px solid ${color}30`}}>
                  <svg width="12" height="12" fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium" style={{fontFamily: 'Syne, sans-serif'}}>{label}</p>
                  <p className="text-white/30 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Two redirect cards */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {[
              { label: "Physician Portal", id: "physician", desc: "Review AI report & approve", color: '#3D7EFF' },
              { label: "Patient Portal", id: "patient", desc: "View scan & hear results", color: '#10B981' }
            ].map(({ label, id, desc, color }) => (
              <button
                key={id}
                onClick={() => window.open(`${window.location.origin}/${id}/${result.patient_id}`, '_blank')}
                className="rounded-2xl p-4 text-left transition-all hover:opacity-80"
                style={{background: `${color}10`, border: `1px solid ${color}25`, cursor: 'pointer'}}>
                <p style={{fontFamily: 'Syne, sans-serif'}} className="text-white text-sm font-semibold mb-1">{label}</p>
                <p className="text-xs mb-3" style={{color: 'rgba(255,255,255,0.3)'}}>{desc}</p>
                <div className="flex items-center gap-1 text-xs font-medium" style={{color}}>
                  Open portal
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M7 17L17 7M17 7H7M17 7v10"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setResult(null); setStep(1); setImage(null); setPreview(null);
              setPatientName(""); setPatientLocation(""); setSymptoms(""); setNotes("");
              patientId.current = `P-${crypto.randomUUID()}`;
            }}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'Syne, sans-serif'}}>
            Submit Another Case
          </button>

        </div>
      )}
    </div>
  );
}