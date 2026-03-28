import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Generator from './Generator'
import Settings from './Settings'
import Dashboard from './Dashboard'
import Curriculum from './Curriculum'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/agent" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/curriculum" element={<Curriculum />} />
        <Route path="/agent" element={<Generator />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}
