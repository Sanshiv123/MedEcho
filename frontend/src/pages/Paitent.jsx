// frontend/pages/Patient.jsx
import React, { useEffect, useState } from "react";
import AvatarPlayer from "../components/AvatarPlayer";
import TranscriptPanel from "../components/TranscriptPanel";
import TrialCard from "../components/TrialCard";
import LanguageSelector from "../components/LanguageSelector";

// Helper to read ?id=P001 from URL
function usePatientIdFromUrl() {
  const [patientId, setPatientId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    setPatientId(id);
  }, []);

  return patientId;
}

export default function Patient() {
  const patientId = usePatientIdFromUrl();

  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState(1); // 1 or 2
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState(null);

  // Polling interval id
  const [pollId, setPollId] = useState(null);

  // Initial fetch + polling
  useEffect(() => {
    if (!patientId) return;

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/status?patient_id=${patientId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch patient status");
        }
        const data = await res.json();
        setPatientData(data);
        setLoading(false);

        if (data.approved) {
          setPhase(2);
        } else {
          setPhase(1);
        }
      } catch (err) {
        console.error(err);
        setError("Could not load your scan. Please try again in a few minutes.");
        setLoading(false);
      }
    }

    // First fetch
    fetchStatus();

    // Start polling every 5s
    const interval = setInterval(fetchStatus, 5000);
    setPollId(interval);

    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, [patientId]);

  // Stop polling once approved
  useEffect(() => {
    if (phase === 2 && pollId) {
      clearInterval(pollId);
    }
  }, [phase, pollId]);

  if (!patientId) {
    return (
      <div className="patient-page">
        <h1>MedEcho</h1>
        <p>Missing patient ID in URL. Please use a link from your care team.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="patient-page">
        <h1>MedEcho</h1>
        <p>Loading your scan…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patient-page">
        <h1>MedEcho</h1>
        <p>{error}</p>
      </div>
    );
  }

  const { scan, ai_report, explanations, trials, language } = patientData || {};

  const currentScript =
    phase === 1
      ? explanations?.phase1_script
      : explanations?.phase2_script;

  const audioUrl =
    phase === 1
      ? null
      : explanations?.audio_url; // Phase 2 audio

  const firstTrial = trials && trials.length > 0 ? trials[0] : null;

  return (
    <div className="patient-page">
      <header className="patient-header">
        <h1>MedEcho</h1>
        <LanguageSelector currentLanguage={language} />
      </header>

      <main className="patient-main">
        <section className="scan-section">
          <h2>Your scan</h2>
          {scan?.image_url ? (
            <img
              src={scan.image_url}
              alt="Chest X-ray"
              className="scan-image"
            />
          ) : (
            <p>Scan image not available.</p>
          )}
        </section>

        <section className="avatar-section">
          <h2>Your explanation</h2>
          <AvatarPlayer
            phase={phase}
            language={language}
            audioUrl={audioUrl}
          />
          <TranscriptPanel
            phase={phase}
            script={currentScript}
          />
        </section>
      </main>

      <footer className="patient-footer">
        {phase === 1 && (
          <p>
            Your care team is reviewing your scan now. You are in good hands.
          </p>
        )}

        {phase === 2 && (
          <>
            <p>Your doctor has reviewed your scan.</p>
            <TrialCard trial={firstTrial} />
          </>
        )}
      </footer>
    </div>
  );
}