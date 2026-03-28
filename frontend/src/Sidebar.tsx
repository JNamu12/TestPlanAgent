import { Link } from 'react-router-dom'

export function Sidebar({ active }: { active: string }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">TB</div>
        <div className="sidebar-brand">
          <h2>TestingBuddy AI</h2>
          <p>Testing Platform</p>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <div className="nav-section-title">Main</div>
        
        <Link to="/dashboard" className={`nav-link ${active === 'dashboard' ? 'active' : ''}`}>
          <span>🏠</span> Dashboard
        </Link>
        <Link to="/curriculum" className={`nav-link ${active === 'curriculum' ? 'active' : ''}`}>
          <span>📖</span> Curriculum
        </Link>
        <Link to="/settings" className={`nav-link ${active === 'settings' ? 'active' : ''}`}>
          <span>⚙️</span> Settings
        </Link>

        <div className="nav-section-title" style={{ marginTop: '24px' }}>Planning & Strategy</div>
        
        <Link to="/agent" className={`nav-link ${active === 'agent' ? 'active' : ''}`}>
          <span>🎯</span> Intelligent Test Planning Agent
        </Link>
      </nav>
    </aside>
  )
}
