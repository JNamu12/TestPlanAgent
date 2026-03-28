import { Link } from 'react-router-dom'

export function NavBar({ active }: { active: 'home' | 'settings' }) {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="nav-icon">🧠</span>
        <span>TestPlan<strong>Agent</strong></span>
      </div>
      <div className="nav-links">
        <Link to="/" className={`nav-link ${active === 'home' ? 'active' : ''}`}>Generator</Link>
        <Link to="/settings" className={`nav-link ${active === 'settings' ? 'active' : ''}`}>⚙️ Settings</Link>
      </div>
    </nav>
  )
}
