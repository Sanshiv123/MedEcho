import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Clinician from './pages/Clinician'
import Patient from './pages/Patient'
import Physician from './pages/Physician'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/clinician" element={<Clinician />} />
        <Route path="/physician" element={<Physician />} />
        <Route path="/patient" element={<Patient />} />
      </Routes>
    </BrowserRouter>
  )
}