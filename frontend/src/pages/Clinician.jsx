import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Clinician() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState(1);
  const [patientName, setPatientName] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  const patientId = useRef(`P-${crypto.randomUUID()}`);
  const navigate = useNavigate();

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

    const analyzeRes = await fetch("/api/scan", {
      method: "POST",
      body: formData,
    });
    const analyzeData = await analyzeRes.json();

    console.log("Analysis result:", analyzeData);
    setLoading(false);
    navigate(`/physician/${analyzeData.patient_id}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-8 gap-6">

      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold tracking-tight">MedEcho</h1>
        <p className="text-gray-500 text-sm mt-1">Clinician Portal</p>
      </div>

      <div className="w-full max-w-2xl bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-8 flex flex-col gap-6">

        {step === 1 && (
          <>
            <div
              className={`border-2 border-dashed rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-3
                ${dragging ? "border-[#3b82f6] bg-[#3b82f610]" : "border-[#1e1e2e] hover:border-[#3b82f6]"}
                ${preview ? "p-4" : "p-12"}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById("fileInput").click()}
            >
              {preview ? (
                <div className="flex flex-col items-center gap-3 w-full">
                  <img src={preview} alt="Preview" className="rounded-lg object-contain max-h-48 max-w-full" />
                  <p className="text-gray-400 text-xs">{image.name}</p>
                  <button
                    className="text-xs text-[#3b82f6] hover:underline"
                    onClick={(e) => { e.stopPropagation(); setImage(null); setPreview(null); }}
                  >
                    Remove and upload different image
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#1e1e2e] flex items-center justify-center">
                    <svg width="24" height="24" fill="none" stroke="#3b82f6" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                    </svg>
                  </div>
                  <p className="text-gray-300 text-sm font-medium">Drop X-ray or skin image here</p>
                  <p className="text-gray-600 text-xs">or click to browse — PNG, JPG supported</p>
                </>
              )}
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>

            {image && (
              <button
                className="w-full bg-[#3b82f6] hover:bg-blue-500 transition text-white font-semibold py-3 rounded-xl"
                onClick={() => setStep(2)}
              >
                Continue →
              </button>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-center gap-4 bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl p-4">
              <img src={preview} alt="Scan" className="h-16 w-16 object-contain rounded-lg" />
              <div>
                <p className="text-sm font-medium text-gray-300">{image.name}</p>
                <button
                  className="text-xs text-[#3b82f6] hover:underline mt-1"
                  onClick={() => setStep(1)}
                >
                  Change image
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Patient name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Jane Smith"
                className="bg-[#0a0a0f] border border-[#1e1e2e] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6] placeholder-gray-600"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Patient language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#0a0a0f] border border-[#1e1e2e] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Spanish</option>
                <option value="fr">🇫🇷 French</option>
                <option value="hi">🇮🇳 Hindi</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Patient symptoms</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. chest pain, shortness of breath, fever for 3 days..."
                rows={3}
                className="bg-[#0a0a0f] border border-[#1e1e2e] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6] resize-none placeholder-gray-600"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-400">Clinician notes <span className="text-gray-600">(optional)</span></label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant clinical context..."
                rows={3}
                className="bg-[#0a0a0f] border border-[#1e1e2e] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6] resize-none placeholder-gray-600"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#3b82f6] hover:bg-blue-500 disabled:opacity-50 transition text-white font-semibold py-3 rounded-xl"
            >
              {loading ? "Analyzing..." : "Send to Physician →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}