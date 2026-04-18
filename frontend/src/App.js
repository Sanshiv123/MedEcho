import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Clinician from './pages/Clinician'
import Patient from './pages/Patient'
import Physician from './pages/Physician'
import Landing from './pages/Landing'


export default function App() {
  return (
    <BrowserRouter>
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