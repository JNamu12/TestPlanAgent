import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Sidebar } from './Sidebar'
import { API_BASE, loadConfig, saveConfig, DEFAULT_ALM, DEFAULT_LLM } from './shared'
import type { ALMConfig, LLMConfig } from './shared'

export default function Generator() {
  // Step Management
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)
  
  // App Config State (from Settings module ideally, but pulled from shared helper)
  const [alm, setAlm] = useState<ALMConfig>(loadConfig('tpa_alm', DEFAULT_ALM))
  const [llm] = useState<LLMConfig>(loadConfig('tpa_llm', DEFAULT_LLM))
  const [showHistory, setShowHistory] = useState(false)

  const handleAlmSave = () => {
    saveConfig('tpa_alm', alm)
    setCurrentStep(2) // proceed to fetch
  }

  // Fetch State
  const [storyId, setStoryId] = useState('')
  const [contextInput, setContextInput] = useState('')
  const [story, setStory] = useState<any>(null)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')

  const fetchStory = async () => {
    if (!storyId.trim()) return
    setFetching(true); setFetchError(''); setStory(null)
    try {
      const body = {
        almType: alm.type,
        config: alm.type === 'jira'
          ? { url: alm.url, email: alm.email, apiToken: alm.apiToken }
          : { orgUrl: alm.url, project: alm.project, pat: alm.apiToken },
        storyId: storyId.trim()
      }
      const res = await fetch(`${API_BASE}/api/fetch-story`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.success) { 
        setStory(data.story)
        setCurrentStep(3) // Advance to Review Step
      }
      else setFetchError(data.message)
    } catch { setFetchError('Could not reach backend API.') }
    setFetching(false)
  }

  // Generate State
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [testPlan, setTestPlan] = useState('')

  const generate = async () => {
    if (!story) return
    setGenerating(true); setGenError(''); setTestPlan('')
    try {
      const res = await fetch(`${API_BASE}/api/generate-test-plan`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ llmConfig: llm, story, additionalContext: contextInput })
      })
      const data = await res.json()
      if (data.success) { 
        setTestPlan(data.testPlan)
        setCurrentStep(4) // Advance to Test Plan Step
      }
      else setGenError(data.message)
    } catch (e: any) { 
      console.error(e);
      setGenError(`Network/Timeout Error: ${e.message || 'Ensure backend is running.'}`) 
    }
    setGenerating(false)
  }

  return (
    <div className="app-shell">
      <Sidebar active="agent" />
      
      <main className="main-content">
        {/* Top Header Placeholder to match screenshot, sidebar is enough, but adding padding. */}
        <div className="page-container">
          
          {/* Main Title Area */}
          <div className="agent-header">
            <div className="agent-title-section">
              <div className="agent-icon">🎯</div>
              <div className="agent-title">
                <h1>Intelligent Test Planning Agent</h1>
                <p>Generate comprehensive test plans from Jira requirements using AI</p>
              </div>
            </div>
            <button className="history-btn" onClick={() => setShowHistory(true)}>
              <span>🕒</span> View History
            </button>
          </div>

          {/* History Modal */}
          {showHistory && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="card" style={{ width: '600px', maxWidth: '90%' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ margin: 0 }}>🕒 Generation History</h2>
                  <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                </div>
                <div className="card-body" style={{ background: 'var(--bg-color)', minHeight: '150px', padding: 0 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Ticket ID</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Summary</th>
                        <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 500 }}>Date</th>
                        <th style={{ padding: '12px 16px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 'KAN-10', name: 'Add new device types (SBRs)', date: 'Oct 24, 2023 - 14:30' },
                        { id: 'TP-92', name: 'Dark Mode Implementation', date: 'Oct 23, 2023 - 09:15' },
                        { id: 'AUTH-20', name: 'SSO Microsoft Login', date: 'Oct 20, 2023 - 16:45' }
                      ].map(hist => (
                        <tr key={hist.id} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                          <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{hist.id}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>{hist.name}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{hist.date}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={() => setShowHistory(false)}>View Iteration</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card-body" style={{ padding: '16px', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
                  <button className="btn-secondary" onClick={() => setShowHistory(false)}>Close</button>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Pipeline */}
          <div className="stepper">
            {[1, 2, 3, 4].map((stepNumber) => {
              const titles = ['1. Setup', '2. Fetch Issues', '3. Review', '4. Test Plan']
              const isPast = stepNumber < currentStep
              const isActive = stepNumber === currentStep
              let className = 'step-item'
              if (isActive) className += ' active'
              if (isPast) className += ' completed'
              return (
                <div key={stepNumber} className={className} onClick={() => {
                  // Allow backwards navigation, but restrict forward jumping unless steps are met
                  if (stepNumber < currentStep || (stepNumber === 2 && alm.url) || (stepNumber === 3 && story) || (stepNumber === 4 && testPlan)) {
                    setCurrentStep(stepNumber as any)
                  }
                }}>
                  {titles[stepNumber - 1]}
                </div>
              )
            })}
          </div>

          {/* Step 1: Setup Content (TP_001 & TP_002) */}
          {currentStep === 1 && (
            <>
              {/* Interactive Import Sources */}
              <div className="card">
                <div className="card-header">
                  <h2>Select Integration Platform</h2>
                  <p>Choose your test management or ALM platform</p>
                </div>
                <div className="card-body" style={{ background: 'var(--bg-color)', padding: '24px' }}>
                  <div className="tool-grid">
                    <div 
                      className={`tool-card ${alm.type === 'jira' ? 'active' : ''}`} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setAlm({ ...alm, type: 'jira' })}
                    >
                      <div className="tool-header">
                        <div className="tool-title">🔵 Jira</div>
                        {alm.type === 'jira' && <div className="tool-badge success">✓ Selected</div>}
                      </div>
                      <p className="tool-desc">Import requirements and user stories from Atlassian Jira</p>
                    </div>

                    <div 
                      className={`tool-card ${alm.type === 'ado' ? 'active' : ''}`} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setAlm({ ...alm, type: 'ado' })}
                    >
                      <div className="tool-header">
                        <div className="tool-title">🟦 Azure DevOps</div>
                        {alm.type === 'ado' && <div className="tool-badge success">✓ Selected</div>}
                      </div>
                      <p className="tool-desc">Extract work items and stories from Microsoft ADO</p>
                    </div>

                    <div className="tool-card" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                      <div className="tool-header">
                        <div className="tool-title">🟢 TestRail</div>
                        <div className="tool-badge neutral">Coming Soon</div>
                      </div>
                      <p className="tool-desc">Import existing test cases from TestRail</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Connection Form */}
              <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2>{alm.type === 'jira' ? 'Jira' : 'Azure DevOps'} Connection</h2>
                    <p>Enter your configuration to connect to {alm.type === 'jira' ? 'Jira' : 'ADO'}</p>
                  </div>
                  {alm.url && (
                    <button className="btn-secondary" onClick={() => setCurrentStep(2)}>
                      Cancel/Skip
                    </button>
                  )}
                </div>
                <div className="card-body">
                  <div className="field-group">
                    <label>Workspace URL / Organization URL</label>
                    <input className="field-input" placeholder={alm.type === 'jira' ? "https://yourcompany.atlassian.net" : "https://dev.azure.com/your-org"} 
                      value={alm.url} onChange={e => setAlm({...alm, url: e.target.value})}/>
                  </div>
                  {alm.type === 'jira' && (
                    <div className="field-group">
                      <label>Email</label>
                      <input className="field-input" placeholder="your-email@company.com" 
                        value={alm.email} onChange={e => setAlm({...alm, email: e.target.value})}/>
                    </div>
                  )}
                  {alm.type === 'ado' && (
                    <div className="field-group">
                      <label>Project Name</label>
                      <input className="field-input" placeholder="MyProject" 
                        value={alm.project || ''} onChange={e => setAlm({...alm, project: e.target.value})}/>
                    </div>
                  )}
                  <div className="field-group">
                    <label>API Token / PAT</label>
                    <input className="field-input" type="password" placeholder={`Your ${alm.type === 'jira' ? 'API Token' : 'PAT'}`} 
                      value={alm.apiToken} onChange={e => setAlm({...alm, apiToken: e.target.value})}/>
                  </div>
                  
                  <div style={{ marginTop: '16px' }}>
                    <button className="btn-primary" onClick={handleAlmSave}>
                      Save Configuration & Continue to Fetch Issues
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Fetch Issues (TP_003) */}
          {currentStep === 2 && (
            <div className="card">
              <div className="card-header">
                <h2>Fetch {alm.type==='jira'?'Jira':'ADO'} Requirements</h2>
                <p>Enter project details to fetch user stories and requirements</p>
              </div>
              <div className="card-body">
                <div className="connection-banner">
                  <div className="banner-info">
                    <span className="banner-label">Connected to:</span>
                    <span className="banner-value">{alm.url || 'None (Go to Setup)'}</span>
                  </div>
                  <span className="banner-action" onClick={() => setCurrentStep(1)}>Change</span>
                </div>

                <div style={{ display: 'flex', gap: '20px' }}>
                  <div className="field-group" style={{ flex: 1 }}>
                    <label>Issue ID (Required) *</label>
                    <input className="field-input" placeholder="e.g., PROJ-123 or 4591" 
                      value={storyId} onChange={e => setStoryId(e.target.value)} />
                  </div>
                </div>

                {fetchError && <div className="alert-error">{fetchError}</div>}

                <button className="btn-primary" style={{ marginTop: '16px' }} onClick={fetchStory} disabled={fetching || !storyId}>
                  {fetching ? '⏳ Fetching...' : '📥 Fetch Jira Issues'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review (TP_004) */}
          {currentStep === 3 && (
            <>
              {story && (
                <div className="card" style={{ marginBottom: '24px' }}>
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}>🎯 {story.key}: {story.summary}</h3>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span style={{ padding: '2px 8px', background: 'var(--bg-color)', borderRadius: '4px' }}>Type: {story.issueType || 'Story'}</span>
                        <span style={{ padding: '2px 8px', background: 'var(--bg-color)', borderRadius: '4px' }}>Status: {story.status || 'To Do'}</span>
                        <span style={{ padding: '2px 8px', background: 'var(--bg-color)', borderRadius: '4px' }}>Priority: {story.priority || 'Medium'}</span>
                      </div>
                    </div>
                    <span className="banner-action" onClick={fetchStory}>🔄 Refresh</span>
                  </div>
                  <div className="card-body" style={{ background: 'var(--bg-color)', padding: '16px 24px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-soft)', marginBottom: '8px', fontWeight: 600 }}>Extracted Description / Requirements:</p>
                    <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', whiteSpace: 'pre-wrap', padding: '12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      {story.description ? (story.description.length > 500 ? story.description.substring(0, 500) + '...' : story.description) : 'No description found in ALM.'}
                    </div>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="card-header">
                  <h2>Additional Context & Notes</h2>
                  <p>Add any additional context, special requirements, or constraints</p>
                </div>
                <div className="card-body">
                  <textarea className="field-textarea" 
                    placeholder="Add any additional context about the testing approach, special requirements, constraints, team structure, or specific areas of focus..."
                    value={contextInput} onChange={e => setContextInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h2>Review {alm.type==='jira'?'Jira':'ADO'} Issues ({story ? '1' : '0'})</h2>
                  <p>Issues that will be used to generate the test plan</p>
                </div>
                <div className="card-body">
                  {genError && <div className="alert-error" style={{ marginBottom: '16px' }}>{genError}</div>}
                  <button className="btn-primary" onClick={generate} disabled={generating || !story}>
                    {generating ? '⏳ Generating Plan... (This may take 2-3 minutes)' : '🎯 Generate Test Plan'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Step 4: Test Plan Output (TP_005) */}
          {currentStep === 4 && (
            <div className="card">
              {!testPlan ? (
                <div className="empty-state">
                  <div className="icon">📄</div>
                  <h3>No test plan generated yet</h3>
                  <p>Complete the previous steps to generate your test plan</p>
                  <button className="btn-secondary" style={{ marginTop: '20px' }} onClick={() => setCurrentStep(2)}>
                    Go Back
                  </button>
                </div>
              ) : (
                <>
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <h2>Test Plan for {story?.key}</h2>
                      <p>Generated by {llm.provider}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(testPlan)}>Copy</button>
                      <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => {
                        fetch(`${API_BASE}/api/push-test-plan`, {
                          method: 'POST', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            almType: alm.type,
                            config: alm.type === 'jira'
                              ? { url: alm.url, email: alm.email, apiToken: alm.apiToken }
                              : { orgUrl: alm.url, project: alm.project, pat: alm.apiToken },
                            storyId: story.id,
                            testPlan
                          })
                        }).then(r => r.json()).then(res => alert(res.message))
                      }}>
                        ↗️ Push to {alm.type === 'jira' ? 'Jira' : 'ADO'}
                      </button>
                    </div>
                  </div>
                  <div className="card-body" style={{ padding: '32px' }}>
                    <div className="markdown-output">
                      <ReactMarkdown>{testPlan}</ReactMarkdown>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
        </div>
      </main>
    </div>
  )
}
