import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function Patient() {
  const { patientId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/patient/${patientId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load your information.");
        setLoading(false);
      });
  }, [patientId]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <p className="text-gray-500 text-sm">Loading your information...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  );

  const phase1Message = data.phase1_script || "Your scan has come through clearly. Your care team is looking at it now and will be in touch with you soon. You're in good hands.";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-8 gap-6">

      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold tracking-tight">MedEcho</h1>
        <p className="text-gray-500 text-sm mt-1">Your Health Summary</p>
      </div>

      <div className="w-full max-w-xl flex flex-col gap-5">

        {/* Status banner */}
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-yellow-400 shrink-0 animate-pulse" />
          <div>
            <p className="text-white font-medium text-sm">Your care team is reviewing your scan</p>
            <p className="text-gray-500 text-xs mt-0.5">You'll be notified when your doctor has reviewed it</p>
          </div>
        </div>

        {/* Scan */}
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-5 flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-300">Your scan</p>
          <img
            src={data.image_url}
            alt="Your scan"
            className="rounded-xl w-full object-contain max-h-64"
          />
        </div>

        {/* Avatar placeholder + message */}
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl p-5 flex flex-col gap-4">

          {/* Avatar placeholder */}
          <div className="w-full h-40 bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#1e1e2e] flex items-center justify-center">
                <svg width="24" height="24" fill="none" stroke="#3b82f6" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z"/>
                  <path d="M3 21C3 17.134 7.02944 14 12 14C16.9706 14 21 17.134 21 21"/>
                </svg>
              </div>
              <p className="text-gray-600 text-xs">Avatar will appear here</p>
            </div>
          </div>

          {/* Message */}
          <div className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl p-4">
            <p className="text-gray-300 text-sm leading-relaxed">{phase1Message}</p>
          </div>
        </div>

        {/* Patient name */}
        <p className="text-center text-gray-600 text-xs">
          Prepared for {data.patient_name} · {data.patient_id}
        </p>

      </div>
    </div>
  );
}