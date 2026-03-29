// Shared types (type-only, not runtime values)
export type ALMType = 'jira' | 'ado'
export type LLMProvider = 'ollama' | 'groq' | 'grok' | 'gemini'

export interface ALMConfig {
  type: ALMType
  url: string
  email: string
  apiToken: string
  project?: string
}

export interface LLMConfig {
  provider: LLMProvider
  model: string
  apiKey?: string
  baseUrl?: string
}

// Shared constants
export const API_BASE = '/api'

export const DEFAULT_ALM: ALMConfig = {
  type: 'jira', url: '', email: '', apiToken: '', project: ''
}

export const DEFAULT_LLM: LLMConfig = {
  provider: 'ollama', model: 'llama3', baseUrl: 'http://localhost:11434', apiKey: ''
}

// Storage helpers
export function loadConfig<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key)
    return s ? JSON.parse(s) : fallback
  } catch {
    return fallback
  }
}

export function saveConfig(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}
