// frontend/components/AvatarPlayer.jsx
import React from "react";

export default function AvatarPlayer({ phase, language, audioUrl }) {
  const phaseLabel = phase === 1 ? "Phase 1" : "Phase 2";

  return (
    <div className="avatar-player">
      <div className="avatar-visual">
        {/* Replace with real avatar image if you have one */}
        <div className="avatar-circle" />
      </div>

      <p className="avatar-status">
        {phaseLabel} explanation in your language.
      </p>

      {audioUrl ? (
        <div className="avatar-audio">
          <audio controls src={audioUrl}>
            Your browser does not support audio playback.
          </audio>
        </div>
      ) : (
        <p className="avatar-waiting">
          Preparing your detailed audio explanation…
        </p>
      )}
    </div>
  );
}