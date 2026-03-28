import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { API_BASE, loadConfig, saveConfig, DEFAULT_ALM, DEFAULT_LLM } from './shared'
import type { ALMConfig, LLMConfig } from './shared'

type TestResult = { success: boolean; message: string } | null

export default function Settings() {
  const [alm, setAlm] = useState<ALMConfig>(loadConfig('tpa_alm', DEFAULT_ALM))
  const [llm, setLlm] = useState<LLMConfig>(loadConfig('tpa_llm', DEFAULT_LLM))
  const [almResult, setAlmResult] = useState<TestResult>(null)
  const [llmResult, setLlmResult] = useState<TestResult>(null)
  const [almTesting, setAlmTesting] = useState(false)
  const [llmTesting, setLlmTesting] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = () => {
    saveConfig('tpa_alm', alm)
    saveConfig('tpa_llm', llm)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const testALM = async () => {
    setAlmTesting(true)
    setAlmResult(null)
    try {
      const body = alm.type === 'jira'
        ? { type: 'jira', config: { url: alm.url, email: alm.email, apiToken: alm.apiToken } }
        : { type: 'ado', config: { orgUrl: alm.url, pat: alm.apiToken } }
      const res = await fetch(`${API_BASE}/api/test-connection`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      })
      setAlmResult(await res.json())
    } catch {
      setAlmResult({ success: false, message: 'Could not reach backend.' })
    }
    setAlmTesting(false)
  }

  const testLLM = async () => {
    setLlmTesting(true)
    setLlmResult(null)
    try {
      const body = { type: llm.provider, config: { apiKey: llm.apiKey, baseUrl: llm.baseUrl } }
      const res = await fetch(`${API_BASE}/api/test-connection`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      })
      setLlmResult(await res.json())
    } catch {
      setLlmResult({ success: false, message: 'Could not reach backend.' })
    }
    setLlmTesting(false)
  }

  return (
    <div className="app-shell">
      <Sidebar active="settings" />
      <main className="main-content">
        <div className="page-container">
          
          <div className="agent-header" style={{ marginBottom: '24px' }}>
            <div className="agent-title-section">
              <div className="agent-icon" style={{ fontSize: '1.5rem' }}>⚙️</div>
              <div className="agent-title">
                <h1>Platform Settings</h1>
                <p>Configure and verify your integrations</p>
              </div>
            </div>
            <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={save}>
              {saved ? '✅ Configuration Saved!' : '💾 Save Settings'}
            </button>
          </div>

          {/* ── ALM Connection ─────────────────────────────────── */}
          <div className="card">
            <div className="card-header">
              <h2>🔗 Application Lifecycle Management</h2>
              <p>Connect your Jira or Azure DevOps instance below</p>
            </div>
            
            <div className="card-body">
              {/* Type Selection */}
              <div className="tool-grid" style={{ marginBottom: '20px' }}>
                {(['jira', 'ado'] as const).map(t => (
                  <div 
                    key={t}
                    className={`tool-card ${alm.type === t ? 'active' : ''}`} 
                    style={{ cursor: 'pointer', padding: '12px' }}
                    onClick={() => setAlm({ ...alm, type: t })}
                  >
                    <div className="tool-header" style={{ marginBottom: 0 }}>
                      <div className="tool-title" style={{ fontSize: '0.95rem' }}>
                        {t === 'jira' ? '🔵 Jira' : '🟦 Azure DevOps'}
                      </div>
                      {alm.type === t && <div className="tool-badge success">✓</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Fields */}
              <div className="field-group">
                <label>{alm.type === 'jira' ? 'Workspace / Instance URL' : 'Organization URL'}</label>
                <input className="field-input"
                  placeholder={alm.type === 'jira' ? 'https://yourorg.atlassian.net' : 'https://dev.azure.com/yourorg'}
                  value={alm.url} onChange={e => setAlm({ ...alm, url: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {alm.type === 'jira' && (
                  <div className="field-group">
                    <label>Email Address</label>
                    <input className="field-input" placeholder="you@company.com"
                      value={alm.email} onChange={e => setAlm({ ...alm, email: e.target.value })} />
                  </div>
                )}
                {alm.type === 'ado' && (
                  <div className="field-group">
                    <label>Project Name</label>
                    <input className="field-input" placeholder="MyProject"
                      value={alm.project || ''} onChange={e => setAlm({ ...alm, project: e.target.value })} />
                  </div>
                )}
                
                <div className="field-group">
                  <label>{alm.type === 'jira' ? 'API Token' : 'Personal Access Token'}</label>
                  <input className="field-input" type="password" placeholder="••••••••••••"
                    value={alm.apiToken} onChange={e => setAlm({ ...alm, apiToken: e.target.value })} />
                </div>
              </div>

              {/* Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <button className="btn-secondary" style={{ width: '200px' }} onClick={testALM} disabled={almTesting}>
                  {almTesting ? '⏳ Testing...' : '⚡ Test Connection'}
                </button>
                {almResult && (
                  <div className={almResult.success ? 'alert-success' : 'alert-error'} style={{ marginTop: 0, padding: '8px 12px', flex: 1 }}>
                    {almResult.success ? '✅ ' : '❌ '} {almResult.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── LLM Connection ─────────────────────────────────── */}
          <div className="card">
            <div className="card-header">
              <h2>🤖 Language Model Engine</h2>
              <p>Select and configure the AI that will power your test plan generations</p>
            </div>
            
            <div className="card-body">
              {/* Type Selection */}
              <div className="tool-grid" style={{ marginBottom: '20px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {(['ollama', 'groq', 'grok', 'gemini'] as const).map(p => (
                  <div 
                    key={p}
                    className={`tool-card ${llm.provider === p ? 'active' : ''}`} 
                    style={{ cursor: 'pointer', padding: '12px' }}
                    onClick={() => setLlm({ ...llm, provider: p })}
                  >
                    <div className="tool-header" style={{ marginBottom: 0 }}>
                      <div className="tool-title" style={{ fontSize: '0.9rem' }}>
                        {p === 'ollama' ? '🦙 Ollama' : p === 'groq' ? '⚡ GROQ' : p === 'grok' ? '𝕏 Grok' : '✦ Gemini'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {llm.provider === 'ollama' ? (
                  <div className="field-group">
                    <label>Local Ollama URL</label>
                    <input className="field-input" placeholder="http://localhost:11434"
                      value={llm.baseUrl || ''} onChange={e => setLlm({ ...llm, baseUrl: e.target.value })} />
                  </div>
                ) : (
                  <div className="field-group">
                    <label>{llm.provider.toUpperCase()} API Key</label>
                    <input className="field-input" type="password" placeholder="••••••••••••"
                      value={llm.apiKey || ''} onChange={e => setLlm({ ...llm, apiKey: e.target.value })} />
                  </div>
                )}
                
                <div className="field-group">
                  <label>Model Parameter</label>
                  <input className="field-input"
                    placeholder={
                      llm.provider === 'ollama' ? 'llama3:8b'
                      : llm.provider === 'groq' ? 'llama-3.1-8b-instant'
                      : llm.provider === 'grok' ? 'grok-3-mini'
                      : 'gemini-1.5-flash'
                    }
                    value={llm.model} onChange={e => setLlm({ ...llm, model: e.target.value })} />
                </div>
              </div>

              {/* Action */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                <button className="btn-secondary" style={{ width: '200px' }} onClick={testLLM} disabled={llmTesting}>
                  {llmTesting ? '⏳ Testing...' : '⚡ Test Engine'}
                </button>
                {llmResult && (
                  <div className={llmResult.success ? 'alert-success' : 'alert-error'} style={{ marginTop: 0, padding: '8px 12px', flex: 1 }}>
                    {llmResult.success ? '✅ ' : '❌ '} {llmResult.message}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
