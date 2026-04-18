import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Physician() {
  const { patientId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [physicianNotes, setPhysicianNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    fetch(`/api/patient/${patientId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setPhysicianNotes(d.physician_notes || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load patient data.");
        setLoading(false);
      });
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

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <p className="text-gray-500 text-sm">Loading patient data...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  );

  const urgencyColor = {
    Critical: "text-red-400 bg-red-400/10 border-red-400/20",
    Moderate: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    Low: "text-green-400 bg-green-400/10 border-green-400/20",
  }[data.urgency] || "text-gray-400";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">MedEcho</h1>
            <p className="text-gray-500 text-sm mt-1">Physician Portal</p>
          </div>
          <div className="text-right">
            <p className="text-white font-semibold text-lg">{data.patient_name}</p>
            <p className="text-gray-600 text-xs font-mono mt-1">{data.patient_id}</p>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-2 gap-6">

          {/* Left — scans */}
          <div className="flex flex-col gap-4">

            {/* Scan toggle */}
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-300">
                  {showHeatmap ? "GradCAM Heatmap" : "Original Scan"}
                </p>
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className="text-xs text-[#3b82f6] hover:underline"
                >
                  {showHeatmap ? "Show original" : "Show heatmap"}
                </button>
              </div>
              <img
                src={`${showHeatmap ? data.heatmap_url : data.image_url}`}
                alt={showHeatmap ? "Heatmap" : "Scan"}
                className="rounded-xl w-full object-contain max-h-72"
              />
            </div>

            {/* AI findings */}
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-5 flex flex-col gap-4">
              <p className="text-sm font-medium text-gray-300">AI Findings</p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-lg">{data.condition}</p>
                  <p className="text-gray-500 text-xs mt-0.5">Primary condition</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full border ${urgencyColor}`}>
                  {data.urgency}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#1e1e2e] rounded-full h-2">
                  <div
                    className="bg-[#3b82f6] h-2 rounded-full"
                    style={{ width: `${Math.round(data.confidence * 100)}%` }}
                  />
                </div>
                <p className="text-gray-400 text-xs w-10 text-right">
                  {Math.round(data.confidence * 100)}%
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-xs mb-2">Differential diagnosis</p>
                <div className="flex flex-wrap gap-2">
                  {data.differential_diagnosis.map((d, i) => (
                    <span key={i} className="text-xs bg-[#1e1e2e] text-gray-300 px-3 py-1 rounded-full">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right — notes + trials */}
          <div className="flex flex-col gap-4">

            {/* Clinician notes */}
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-5 flex flex-col gap-3">
              <p className="text-sm font-medium text-gray-300">Clinician Notes</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                {data.clinician_notes || <span className="text-gray-600 italic">No clinician notes provided.</span>}
              </p>
            </div>

            {/* Physician assessment */}
            <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-5 flex flex-col gap-3">
              <p className="text-sm font-medium text-gray-300">Your Assessment</p>
              <textarea
                value={physicianNotes}
                onChange={(e) => setPhysicianNotes(e.target.value)}
                placeholder="Add your clinical assessment..."
                rows={4}
                className="bg-[#0a0a0f] border border-[#1e1e2e] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#3b82f6] resize-none placeholder-gray-600"
              />
            </div>

            {/* Matched trials */}
            {data.trials && data.trials.length > 0 && (
              <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-5 flex flex-col gap-3">
                <p className="text-sm font-medium text-gray-300">Matched Clinical Trials</p>
                <div className="flex flex-col gap-3">
                  {data.trials.map((trial, i) => (
                    <div key={i} className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl p-3 flex flex-col gap-1">
                      <p className="text-white text-xs font-medium leading-snug">{trial.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
                          {trial.status}
                        </span>
                        <span className="text-gray-600 text-xs">{trial.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Send to patient */}
            <button
              onClick={handleSend}
              disabled={sending || sent}
              className="w-full bg-[#3b82f6] hover:bg-blue-500 disabled:opacity-50 transition text-white font-semibold py-3 rounded-xl"
            >
              {sent ? "Sent to Patient ✓" : sending ? "Sending..." : "Send to Patient →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}