import { Sidebar } from './Sidebar'

export default function Curriculum() {
  const courses = [
    { title: 'Mastering B.L.A.S.T Prompts', desc: 'Learn how to configure LLMs to output strict, robust test plans.', progress: 100, icon: '⚡' },
    { title: 'Jira Integration 101', desc: 'Step-by-step guide to connecting Atlassian tokens securely.', progress: 45, icon: '🔗' },
    { title: 'Advanced Analytics', desc: 'How to monitor generation costs and token usage in your dashboard.', progress: 0, icon: '📊' },
    { title: 'Azure DevOps Pipeline', desc: 'Pushing your generated Markdown documents into ADO effortlessly.', progress: 0, icon: '☁️' }
  ]

  return (
    <div className="app-shell">
      <Sidebar active="curriculum" />
      <main className="main-content">
        <div className="page-container">
          
          <div className="agent-header" style={{ marginBottom: '24px' }}>
            <div className="agent-title-section">
              <div className="agent-icon" style={{ fontSize: '1.5rem', background: 'var(--primary-blue)' }}>📖</div>
              <div className="agent-title">
                <h1>Testing Curriculum</h1>
                <p>Training modules to help your QA team master AI-assisted test engineering</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {courses.map((course, i) => (
              <div key={i} className="card" style={{ padding: '24px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                   onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                   onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                   <div style={{ background: 'var(--surface)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                     {course.icon}
                   </div>
                   <div>
                     <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>{course.title}</h3>
                     <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{course.desc}</p>
                   </div>
                </div>
                <div style={{ background: 'var(--surface)', width: '100%', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                   <div style={{ background: course.progress === 100 ? 'var(--success-green)' : 'var(--primary-blue)', width: `${course.progress}%`, height: '100%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>{course.progress === 0 ? 'Not Started' : course.progress === 100 ? 'Completed 🎉' : 'In Progress'}</span>
                  <span>{course.progress}%</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  )
}
