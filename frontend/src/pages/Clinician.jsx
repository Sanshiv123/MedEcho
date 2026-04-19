import { useState, useRef } from "react";

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

export default function Clinician() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState(1);
  const [patientDob, setPatientDob] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientLocation, setPatientLocation] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const patientId = useRef(`P-${crypto.randomUUID()}`);

  const handleFile = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);
    formData.append("symptoms", symptoms);
    formData.append("language", language);
    formData.append("clinician_notes", notes);
    formData.append("patient_id", patientId.current);
    formData.append("patient_name", patientName);
    formData.append("patient_location", patientLocation);
    formData.append("patient_dob", patientDob);

    const res = await fetch("/api/scan", { method: "POST", body: formData });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center p-8 gap-8">

      {/* Header */}
      <div className="fade-in-up stagger-1 text-center">
        <h1 style={{fontFamily: 'Syne, sans-serif'}} className="text-3xl font-bold text-white">MedEcho</h1>
        <p className="text-white/30 text-sm mt-1">Clinician Portal</p>
      </div>

      {!result && (
        <div className="fade-in-up stagger-2 w-full max-w-xl glass rounded-3xl p-8 flex flex-col gap-6">

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                  style={{
                    background: step >= s ? '#3D7EFF' : 'rgba(255,255,255,0.05)',
                    color: step >= s ? '#fff' : 'rgba(255,255,255,0.3)',
                    fontFamily: 'Syne, sans-serif'
                  }}
                >
                  {s}
                </div>
                {s < 2 && <div className="w-8 h-px" style={{background: step > s ? '#3D7EFF' : 'rgba(255,255,255,0.1)'}} />}
              </div>
            ))}
            <p className="text-white/30 text-xs ml-2">{step === 1 ? "Upload scan" : "Patient details"}</p>
          </div>

          {step === 1 && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => document.getElementById("fileInput").click()}
                className="rounded-2xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-4"
                style={{
                  border: `1.5px dashed ${dragging ? '#3D7EFF' : 'rgba(255,255,255,0.1)'}`,
                  background: dragging ? 'rgba(61,126,255,0.05)' : 'transparent',
                  padding: preview ? '16px' : '48px 24px',
                }}
              >
                {preview ? (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <img src={preview} alt="Preview" className="rounded-xl object-contain max-h-48 max-w-full" />
                    <p className="text-white/30 text-xs">{image.name}</p>
                    <button
                      className="text-xs text-[#3D7EFF] hover:text-[#6FA3FF] transition-colors"
                      onClick={(e) => { e.stopPropagation(); setImage(null); setPreview(null); }}
                    >
                      Remove image
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

              {image && (
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 accent-glow"
                  style={{background: 'linear-gradient(135deg, #3D7EFF, #2563EB)', fontFamily: 'Syne, sans-serif'}}
                >
                  Continue →
                </button>
              )}
            </>
          )}

          {step === 2 && (
            <>
              {/* Scan thumbnail */}
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
                <img src={preview} alt="Scan" className="h-12 w-12 object-contain rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-xs truncate">{image.name}</p>
                </div>
                <button className="text-xs text-[#3D7EFF]" onClick={() => setStep(1)}>Change</button>
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
                <Label>Date of birth</Label>
                <input
                    type="date"
                    value={patientDob}
                    onChange={(e) => setPatientDob(e.target.value)}
                    className="w-full glass rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
                    style={{border: '1px solid rgba(255,255,255,0.07)', colorScheme: 'dark'}}
                />
                </div>

              <div>
                <Label>Patient language</Label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full glass rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
                  style={{border: '1px solid rgba(255,255,255,0.07)'}}
                >
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
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add relevant clinical context..." rows={3} />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 accent-glow"
                style={{background: 'linear-gradient(135deg, #3D7EFF, #2563EB)', fontFamily: 'Syne, sans-serif'}}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Analyzing scan...
                  </span>
                ) : "Submit Scan →"}
              </button>
            </>
          )}
        </div>
      )}

      {result && (
        <div className="fade-in-up stagger-1 w-full max-w-xl glass rounded-3xl p-8 flex flex-col gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)'}}>
              <svg width="16" height="16" fill="none" stroke="#10B981" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div>
              <p style={{fontFamily: 'Syne, sans-serif'}} className="text-white font-semibold">Scan submitted</p>
              <p className="text-white/30 text-xs mt-0.5">{result.patient_name} · {result.condition}</p>
            </div>
          </div>

          <div className="h-px" style={{background: 'rgba(255,255,255,0.05)'}} />

          {[
            { label: "Physician link", id: "physician" },
            { label: "Patient link", id: "patient" },
          ].map(({ label, id }) => (
            <div key={id} className="flex flex-col gap-2">
              <Label>{label}</Label>
              <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)'}}>
                <p className="text-white/50 text-xs flex-1 truncate" style={{fontFamily: 'DM Mono, monospace'}}>
                  {window.location.origin}/{id}/{result.patient_id}
                </p>
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${id}/${result.patient_id}`)}
                  className="text-xs text-[#3D7EFF] hover:text-[#6FA3FF] transition-colors shrink-0 font-medium"
                >
                  Copy
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              setResult(null); setStep(1); setImage(null); setPreview(null);
              setPatientName(""); setPatientLocation(""); setSymptoms(""); setNotes("");
              patientId.current = `P-${crypto.randomUUID()}`;
            }}
            className="text-white/25 text-xs hover:text-white/50 transition-colors text-center"
          >
            Submit another scan
          </button>
        </div>
      )}
    </div>
  );
}