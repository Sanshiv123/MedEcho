import React, { useState } from "react";

export default function AvatarPlayer({
  phase,
  language,
  audioUrl,
  videoUrl = null,
}) {
  const [videoLoading, setVideoLoading] = useState(Boolean(videoUrl));

  return (
    <div className="avatar-player">
      <div style={{ marginBottom: "12px" }}>
        <strong>
          {phase === 1 ? "Phase 1" : "Phase 2"} explanation
        </strong>
        <div style={{ color: "#666", fontSize: "14px" }}>
          Language: {language || "en"}
        </div>
      </div>

      {videoUrl ? (
        <div>
          {videoLoading && (
            <div style={{ marginBottom: "8px" }}>
              Avatar is loading...
            </div>
          )}

          <video
            controls
            autoPlay
            style={{ width: "100%", maxWidth: "420px", borderRadius: "12px" }}
            onCanPlay={() => setVideoLoading(false)}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support video playback.
          </video>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            maxWidth: "420px",
            minHeight: "180px",
            borderRadius: "12px",
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
            marginBottom: "12px",
          }}
        >
          Avatar preview not available yet
        </div>
      )}

      {phase === 2 && audioUrl && (
        <div style={{ marginTop: "12px" }}>
          <audio controls style={{ width: "100%", maxWidth: "420px" }}>
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support audio playback.
          </audio>
        </div>
      )}
    </div>
  );
}