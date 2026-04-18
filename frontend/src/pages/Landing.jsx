import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-8 gap-8">
      
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">MedEcho</h1>
        <p className="text-gray-500 text-sm mt-2">AI-powered medical image triage</p>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-3xl">

        <button
          onClick={() => navigate("/clinician")}
          className="bg-[#12121a] border border-[#1e1e2e] hover:border-[#3b82f6] transition rounded-2xl p-8 flex flex-col items-center gap-4 text-left"
        >
          <div className="w-12 h-12 rounded-full bg-[#1e1e2e] flex items-center justify-center">
            <svg width="22" height="22" fill="none" stroke="#3b82f6" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.122m-6 0a2.25 2.25 0 00-1.5 2.122M9.75 3.104c.251.023.501.05.75.082M19.5 14.5l-4.091-4.091A2.25 2.25 0 0114.25 8.818V3.104m0 0c-.251.023-.501.05-.75.082"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Clinician</p>
            <p className="text-gray-500 text-xs mt-1">Upload scan and patient info</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/physician")}
          className="bg-[#12121a] border border-[#1e1e2e] hover:border-[#3b82f6] transition rounded-2xl p-8 flex flex-col items-center gap-4 text-left"
        >
          <div className="w-12 h-12 rounded-full bg-[#1e1e2e] flex items-center justify-center">
            <svg width="22" height="22" fill="none" stroke="#3b82f6" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Physician</p>
            <p className="text-gray-500 text-xs mt-1">Review scan and send to patient</p>
          </div>
        </button>

        <button
          onClick={() => navigate("/patient")}
          className="bg-[#12121a] border border-[#1e1e2e] hover:border-[#3b82f6] transition rounded-2xl p-8 flex flex-col items-center gap-4 text-left"
        >
          <div className="w-12 h-12 rounded-full bg-[#1e1e2e] flex items-center justify-center">
            <svg width="22" height="22" fill="none" stroke="#3b82f6" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Patient</p>
            <p className="text-gray-500 text-xs mt-1">View your scan and results</p>
          </div>
        </button>

      </div>
    </div>
  );
}