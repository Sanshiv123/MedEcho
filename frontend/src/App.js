import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Clinician from './pages/Clinician'
import Landing from './pages/Landing'
import Patient from './pages/Patient'
import Physician from './pages/Physician'

export default function App() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.body.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <BrowserRouter>
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

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/clinician" element={<Clinician />} />
        <Route path="/physician" element={<Physician />} />
        <Route path="/patient" element={<Patient />} />
        <Route path="/physician/:patientId" element={<Physician />} />
        <Route path="/patient/:patientId" element={<Patient />} />
      </Routes>
    </BrowserRouter>
  )
}