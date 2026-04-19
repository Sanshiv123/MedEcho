import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MedEchoLogo from "../components/MedEchoLogo";

const isDark = () => document.body.getAttribute("data-theme") !== "light";

// ── Role Modal ────────────────────────────────────────────────────────────────
function RoleModal({ onClose, onSelect }) {
  const dark = isDark();
  const overlay = dark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.4)";
  const bg = dark ? "#0D1828" : "#FFFFFF";
  const border = dark ? "#1A2840" : "rgba(99,102,241,0.15)";
  const textPrimary = dark ? "#E2EAF8" : "#0F172A";
  const textMuted = dark ? "#4A6A8A" : "#64748B";

  const roles = [
    { key: "clinician", label: "Clinician", icon: "🩺", desc: "Upload scans & patient info" },
    { key: "physician", label: "Physician", icon: "👨‍⚕️", desc: "Review AI reports & approve" },
    { key: "patient",   label: "Patient",   icon: "🧑", desc: "View results & hear explanation" },
  ];

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: overlay, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: bg, border: `1px solid ${border}`, borderRadius: 20, padding: "36px 32px", width: 340, boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}
      >
        <p style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>Open portal as…</p>
        <p style={{ fontSize: 14, color: textMuted, marginBottom: 24 }}>Select your role to continue</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {roles.map(({ key, label, icon, desc }) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                background: dark ? "rgba(255,255,255,0.04)" : "rgba(127,119,221,0.04)",
                border: `1px solid ${border}`, borderRadius: 12, padding: "14px 18px",
                cursor: "pointer", textAlign: "left", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#7F77DD"; e.currentTarget.style.background = dark ? "rgba(127,119,221,0.1)" : "rgba(127,119,221,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = dark ? "rgba(255,255,255,0.04)" : "rgba(127,119,221,0.04)"; }}
            >
              <span style={{ fontSize: 26 }}>{icon}</span>
              <div>
                <p style={{ fontFamily: "Syne, sans-serif", fontSize: 15, fontWeight: 700, color: textPrimary, margin: 0 }}>{label}</p>
                <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{ marginTop: 20, width: "100%", padding: "10px", background: "transparent", border: `1px solid ${border}`, borderRadius: 10, fontSize: 13, color: textMuted, cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}



// ── Landing ───────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const [, forceUpdate] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const obs = new MutationObserver(() => forceUpdate(n => n + 1));
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const dark = isDark();
  const bg = dark
    ? "linear-gradient(135deg, #060E1A 0%, #0A1628 100%)"
    : "linear-gradient(160deg, #EEF4FF 0%, #E8F0FF 50%, #F0F4FF 100%)";
  const textPrimary = dark ? "#E2EAF8" : "#0F172A";
  const textMuted   = dark ? "#4A6A8A" : "#64748B";
  const cardBg      = dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)";
  const cardBorder  = dark ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.12)";
  const navBg       = dark ? "rgba(6,14,26,0.85)"     : "rgba(255,255,255,0.85)";

  const openModal  = () => setShowModal(true);
  const handleRole = (role) => {
    setShowModal(false);
    navigate(role === "patient" ? "/patient/demo" : `/${role}`);
  };

  const features = [
    { icon: "🧠", title: "AI-Powered Triage",    desc: "DenseNet CNN analyzes chest X-rays with GradCAM heatmaps pinpointing the exact diagnostic regions on the scan." },
    { icon: "🎥", title: "Avatar Explanations",  desc: "A warm HeyGen LiveAvatar walks patients through results face-to-face — no one faces scary medical language alone." },
    { icon: "🌐", title: "Multilingual Support", desc: "Full support for English, Spanish, French, and Hindi with ElevenLabs voices tuned per language." },
    { icon: "🛡️", title: "Two-Phase Delivery",  desc: "Immediate Phase 1 reassurance first. Full Phase 2 explanation unlocks only after physician review and approval." },
    { icon: "📋", title: "Trial Matching",        desc: "Real-time ClinicalTrials.gov lookups surface relevant studies for each patient's condition automatically." },
    { icon: "📊", title: "Confidence-Adaptive",  desc: "Communication adapts to AI confidence — cautious below 60%, direct and clear above 85%." },
  ];

  const steps = [
    { n: 1, title: "Clinician uploads the scan",            desc: "Upload a chest X-ray with patient symptoms and preferred language. The CNN runs immediately in the background." },
    { n: 2, title: "Patient gets Phase 1 right away",       desc: "No more waiting in the dark. The avatar delivers a calm, non-diagnostic summary while the care team reviews." },
    { n: 3, title: "Physician reviews everything",          desc: "Full picture: scan, GradCAM heatmap, AI findings, clinician notes, matched trials. Physician adds their assessment." },
    { n: 4, title: "Patient receives the full explanation", desc: "Avatar returns in the patient's language with a complete, plain-language explanation. No jargon, no panic." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "DM Sans, sans-serif", color: textPrimary }}>
      {/* BG orbs */}
      <div style={{ position: "fixed", top: "-15%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: dark ? "rgba(127,119,221,0.06)" : "rgba(147,197,253,0.3)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-15%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: dark ? "rgba(212,83,126,0.04)" : "rgba(212,83,126,0.12)", filter: "blur(80px)", pointerEvents: "none", zIndex: 0 }} />

      {showModal && <RoleModal onClose={() => setShowModal(false)} onSelect={handleRole} />}

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, padding: "0 48px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", background: navBg, backdropFilter: "blur(20px)", borderBottom: `1px solid ${cardBorder}` }}>
        <MedEchoLogo width={120} height={44} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={openModal} style={{ padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, background: "transparent", border: "none", color: textMuted, cursor: "pointer" }}>Log In</button>
          <button onClick={openModal} style={{ padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, background: "linear-gradient(135deg,#7F77DD,#5A52B8)", color: "white", border: "none", cursor: "pointer", fontFamily: "Syne, sans-serif", boxShadow: "0 4px 14px rgba(127,119,221,0.35)" }}>Sign Up</button>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── Hero — full animated logo centered ── */}
        <section style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 40px 48px" }}>
          <MedEchoLogo width={520} height="auto" />
          <p style={{ fontSize: 17, color: textMuted, margin: "8px 0 28px", letterSpacing: "0.3px" }}>Medical Results, Human Understanding</p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 20, background: dark ? "rgba(127,119,221,0.1)" : "rgba(127,119,221,0.07)", border: `1px solid ${dark ? "rgba(127,119,221,0.25)" : "rgba(127,119,221,0.2)"}`, marginBottom: 32 }}>
            <svg width="14" height="14" fill="none" stroke="#7F77DD" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#7F77DD" }}>HIPAA Compliant Healthcare Platform</span>
          </div>
          <p style={{ fontSize: 20, color: textMuted, maxWidth: 620, lineHeight: 1.75, marginBottom: 44 }}>
            Bridge the gap between radiology results and patient understanding. AI triage for clinicians and physicians — compassionate explanations for patients.
          </p>
          <button
            onClick={openModal}
            style={{ padding: "16px 48px", borderRadius: 12, fontSize: 17, fontWeight: 700, background: "linear-gradient(135deg,#7F77DD,#5A52B8)", color: "white", border: "none", cursor: "pointer", fontFamily: "Syne, sans-serif", boxShadow: "0 6px 24px rgba(127,119,221,0.4)", letterSpacing: "0.3px" }}
          >
            Get Started
          </button>
        </section>

        {/* ── Features ── */}
        <section style={{ padding: "60px 60px 48px", textAlign: "center" }}>
          <p style={{ fontFamily: "Syne, sans-serif", fontSize: 30, fontWeight: 800, color: textPrimary, marginBottom: 10 }}>Designed for Compassionate Care</p>
          <p style={{ fontSize: 17, color: textMuted, maxWidth: 520, margin: "0 auto 44px", lineHeight: 1.7 }}>Every feature built to reduce patient anxiety and improve care team communication.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, maxWidth: 1080, margin: "0 auto" }}>
            {features.map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: "28px 24px", textAlign: "left", backdropFilter: "blur(12px)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(127,119,221,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 12, background: dark ? "rgba(127,119,221,0.1)" : "rgba(127,119,221,0.07)", border: `1px solid ${dark ? "rgba(127,119,221,0.2)" : "rgba(127,119,221,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 22 }}>{icon}</div>
                <p style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 8 }}>{title}</p>
                <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section style={{ padding: "48px 60px", textAlign: "center" }}>
          <p style={{ fontFamily: "Syne, sans-serif", fontSize: 30, fontWeight: 800, color: textPrimary, marginBottom: 10 }}>How It Works</p>
          <p style={{ fontSize: 17, color: textMuted, marginBottom: 48 }}>A seamless workflow from scan upload to patient understanding.</p>
          <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
            {steps.map(({ n, title, desc }) => (
              <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 20, textAlign: "left" }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg,#7F77DD,#5A52B8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(127,119,221,0.3)" }}>
                  <span style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 700, color: "white" }}>{n}</span>
                </div>
                <div style={{ paddingTop: 4 }}>
                  <p style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>{title}</p>
                  <p style={{ fontSize: 15, color: textMuted, lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Portals ── */}
        <section style={{ padding: "48px 60px", textAlign: "center" }}>
          <p style={{ fontFamily: "Syne, sans-serif", fontSize: 30, fontWeight: 800, color: textPrimary, marginBottom: 10 }}>Built for Every Role</p>
          <p style={{ fontSize: 17, color: textMuted, marginBottom: 44 }}>Dedicated portals for the specific needs of each user.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, maxWidth: 900, margin: "0 auto" }}>
            {[
              { role: "For Clinicians", color: "#7F77DD", items: ["Upload scans with patient info", "Enter symptoms and language", "Add clinical notes", "Submit to physician instantly"] },
              { role: "For Physicians", color: "#D4537E", items: ["Review AI analysis + GradCAM", "See clinician notes and symptoms", "Browse matched clinical trials", "Approve and send to patient"] },
              { role: "For Patients",   color: "#1D9E75", items: ["View scan immediately", "Hear Phase 1 summary via avatar", "Receive full results after review", "Supports 4 languages"] },
            ].map(({ role, color, items }) => (
              <div key={role} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: "24px 22px", textAlign: "left", backdropFilter: "blur(12px)" }}>
                <p style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 16 }}>{role}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {items.map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                      <svg width="16" height="16" fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 2 }}><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p style={{ fontSize: 14, color: textMuted, lineHeight: 1.55 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: "40px 60px 80px" }}>
          <div style={{ maxWidth: 660, margin: "0 auto", background: dark ? "rgba(127,119,221,0.06)" : "rgba(127,119,221,0.05)", border: `1px solid ${dark ? "rgba(127,119,221,0.15)" : "rgba(127,119,221,0.18)"}`, borderRadius: 20, padding: "52px 40px", textAlign: "center", backdropFilter: "blur(12px)" }}>
            <p style={{ fontFamily: "Syne, sans-serif", fontSize: 26, fontWeight: 800, color: textPrimary, marginBottom: 12 }}>Ready to Transform Patient Communication?</p>
            <p style={{ fontSize: 16, color: textMuted, marginBottom: 28, lineHeight: 1.7 }}>Join healthcare teams using MedEcho to bridge the gap between medical results and patient understanding.</p>
            <button
              onClick={openModal}
              style={{ padding: "14px 36px", borderRadius: 10, fontSize: 15, fontWeight: 700, background: "linear-gradient(135deg,#7F77DD,#5A52B8)", color: "white", border: "none", cursor: "pointer", fontFamily: "Syne, sans-serif", boxShadow: "0 4px 16px rgba(127,119,221,0.35)" }}
            >
              Create Your Account
            </button>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ padding: "20px 60px", borderTop: `1px solid ${cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: dark ? "rgba(6,14,26,0.5)" : "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)" }}>
          <MedEchoLogo width={120} height={44} />
          <p style={{ fontSize: 13, color: textMuted }}>Bridging the gap between medical results and patient understanding.</p>
        </footer>
      </div>
    </div>
  );
}