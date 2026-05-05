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
  // Default: light mode
  // ---------------------------------------------------------------------------
  const [dark, setDark] = useState(false)

  // Sync theme state to document.body data-theme attribute
  useEffect(() => {
    document.body.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <BrowserRouter>

      {/* ── Global theme toggle — sliding pill ── */}
      <div
        data-print-hide
        onClick={() => setDark(!dark)}
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          position: 'fixed', top: 90, right: 18, zIndex: 9999,
          width: 52, height: 28, borderRadius: 14,
          background: dark ? '#7F77DD' : '#CBD5E1',
          cursor: 'pointer',
          transition: 'background 0.3s ease',
          boxShadow: dark ? '0 0 10px rgba(127,119,221,0.4)' : 'none',
          flexShrink: 0,
        }}
      >
        {/* Sliding knob */}
        <div style={{
          position: 'absolute',
          top: 4,
          left: dark ? 28 : 4,
          width: 20, height: 20,
          borderRadius: '50%',
          background: 'white',
          transition: 'left 0.3s ease',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11,
        }}>
          {dark ? '🌙' : '☀️'}
        </div>
      </div>

      {/* ── Application routes ── */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/clinician" element={<Clinician />} />
        <Route path="/physician" element={<Physician />} />
        <Route path="/physician/:patientId" element={<Physician />} />
        <Route path="/patient" element={<Patient />} />
        <Route path="/patient/:patientId" element={<Patient />} />
      </Routes>

    </BrowserRouter>
  )
}