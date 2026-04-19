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
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          position: 'fixed', top: 14, right: 16, zIndex: 9999,
          width: 32, height: 32, borderRadius: 8,
          background: 'transparent', border: 'none',
          cursor: 'pointer', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0.5, transition: 'opacity 0.15s ease, transform 0.15s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.opacity = '1'
          e.currentTarget.style.transform = 'scale(1.15)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.opacity = '0.5'
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        🎨
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