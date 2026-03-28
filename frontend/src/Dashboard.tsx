import { Sidebar } from './Sidebar'

export default function Dashboard() {
  const dummyActivity = [
    { id: '1', type: 'agent', name: 'KAN-10: Add new device types (SBRs)', status: 'Success', time: '10 minutes ago' },
    { id: '2', type: 'agent', name: 'UI-05: Migrate to Dark Theme UI', status: 'Success', time: '2 hours ago' },
    { id: '3', type: 'system', name: 'System Settings: Linked Atlassian Jira', status: 'Updated', time: '3 hours ago' },
    { id: '4', type: 'agent', name: 'AUTH-20: Implement SSO Microsoft', status: 'Success', time: '1 day ago' }
  ]

  return (
    <div className="app-shell">
      <Sidebar active="dashboard" />
      <main className="main-content">
        <div className="page-container">
          
          <div className="agent-header" style={{ marginBottom: '24px' }}>
            <div className="agent-title-section">
              <div className="agent-icon" style={{ fontSize: '1.5rem', background: 'var(--primary-blue)' }}>🏠</div>
              <div className="agent-title">
                <h1>Overview Dashboard</h1>
                <p>Welcome to TestingBuddy AI! Below is your daily test engineering summary.</p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Total Test Plans</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>24</div>
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Test Cases Generated</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>1,894</div>
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Active Projects</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>3</div>
            </div>
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>Engine Used</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--success-green)' }}>GROQ ⚡</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Recent Activity</h2>
              <p>Your latest test plan generations and platform configurations</p>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Event Type</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Description</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyActivity.map(act => (
                    <tr key={act.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                      <td style={{ padding: '14px 16px' }}>
                         {act.type === 'agent' ? <span style={{ padding: '4px 8px', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary-blue)', borderRadius: '4px', fontSize: '0.8rem' }}>🎯 Generator</span> 
                         : <span style={{ padding: '4px 8px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning-yellow)', borderRadius: '4px', fontSize: '0.8rem' }}>⚙️ ALM Sync</span>}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-main)', fontWeight: 500 }}>{act.name}</td>
                      <td style={{ padding: '14px 16px' }}>
                         <span style={{ color: act.status === 'Success' ? 'var(--success-green)' : 'var(--text-soft)' }}>{act.status}</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{act.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}
