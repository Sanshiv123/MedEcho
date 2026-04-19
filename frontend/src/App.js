// frontend/src/App.js
// Root application component for MedEcho.
//
// Responsibilities:
// 1. Global theme management — toggles light/dark mode by setting
//    data-theme="dark"|"light" on document.body. All portal components
//    read this attribute to adapt their colors.
//
// 2. Theme toggle button — fixed position, visible on all pages,
//    hidden on print (data-print-hide).
//
// 3. Client-side routing — all three portals plus the landing page.
//    Physician and Patient routes accept an optional :patientId param
//    so deep links from the clinician portal work directly.
//
// Route map:
//   /                        → Landing page (role selector)
//   /clinician               → Clinician portal (scan upload)
//   /physician               → Physician portal (no patient selected)
//   /physician/:patientId    → Physician portal (specific patient loaded)
//   /patient                 → Patient portal (manual ID entry)
//   /patient/:patientId      → Patient portal (specific patient loaded)

import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Clinician from './pages/Clinician'
import Landing from './pages/Landing'
import Patient from './pages/Patient'
import Physician from './pages/Physician'

export default function App() {
  // ---------------------------------------------------------------------------
  // Theme state
  // Default: dark mode (matches the dark glass aesthetic across all portals)
  // ---------------------------------------------------------------------------
  const [dark, setDark] = useState(false)

  // Sync theme state to document.body data-theme attribute
  // All portal components read this attribute to adapt colors
  useEffect(() => {
    document.body.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <BrowserRouter>

      {/* ── Global theme toggle button ──
          Fixed top-right, visible on all pages.
          data-print-hide removes it from PDF exports.
          Toggles between dark (🌙) and light (☀️) modes. */}
      <button
        data-print-hide
        onClick={() => setDark(!dark)}
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 9999,
          width: 44, height: 24, borderRadius: 12,
          background: dark ? 'rgba(255,255,255,0.1)' : '#3D7EFF',
          border: '1px solid rgba(255,255,255,0.15)',
          cursor: 'pointer', transition: 'background 0.2s',
          display: 'flex', alignItems: 'center',
          padding: '0 4px'
        }}
      >
        {/* Sliding pill indicator */}
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: 'white',
          transform: dark ? 'translateX(0)' : 'translateX(20px)',
          transition: 'transform 0.2s',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 9
        }}>
          {dark ? '🌙' : '☀️'}
        </div>
      </button>

      {/* ── Application routes ── */}
      <Routes>
        {/* Public landing page — role selector modal */}
        <Route path="/" element={<Landing />} />

        {/* Clinician portal — scan upload and submission */}
        <Route path="/clinician" element={<Clinician />} />

        {/* Physician portal — no patient pre-selected, shows sidebar + empty state */}
        <Route path="/physician" element={<Physician />} />

        {/* Physician portal — patient pre-loaded via deep link from clinician portal */}
        <Route path="/physician/:patientId" element={<Physician />} />

        {/* Patient portal — manual ID entry screen */}
        <Route path="/patient" element={<Patient />} />

        {/* Patient portal — patient pre-loaded via deep link from clinician portal */}
        <Route path="/patient/:patientId" element={<Patient />} />
      </Routes>

    </BrowserRouter>
  )
}