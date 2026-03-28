# Project Constitution — TestPlanAgent
_This file is law. Only update when schema changes, a rule is added, or architecture is modified._

---

## 🎯 North Star
Build an **Intelligent Test Plan Creator** that:
1. Accepts a Jira/ADO connection configured on-the-fly by the user.
2. Fetches a Jira Story/Issue based on a user-provided Jira ID.
3. Optionally accepts additional user-provided context.
4. Uses a configured LLM (Ollama, GROQ, or Grok) to generate a structured test plan.
5. Formats the output using the `Test_plan_template/Test Plan - Template.docx`.
6. Delivers the final test plan to the user.

---

## 📐 Data Schemas

### Input Schema (User Config Payload)
```json
{
  "alm_connection": {
    "type": "jira | ado",
    "jira_url": "string",
    "email": "string",
    "api_token": "string"
  },
  "llm_connection": {
    "provider": "ollama | groq | grok | gemini",
    "model": "string",
    "api_key": "string (optional for ollama)",
    "base_url": "string (required for ollama)"
  },
  "jira_id": "string (e.g. PROJ-123)",
  "additional_context": "string (optional)"
}
```

### Jira Fetched Story Schema
```json
{
  "id": "string",
  "key": "string",
  "summary": "string",
  "description": "string",
  "issue_type": "string",
  "status": "string",
  "priority": "string",
  "acceptance_criteria": "string (parsed from description)"
}
```

### Output Schema (Generated Test Plan)
```json
{
  "jira_id": "string",
  "generated_at": "ISO timestamp",
  "test_plan_sections": {
    "objective": "string",
    "scope": "string",
    "test_strategy": "string",
    "test_cases": [ { "id": "TC-001", "title": "string", "steps": [], "expected": "string" } ],
    "entry_exit_criteria": "string",
    "risks": "string"
  }
}
```

---

## 🔗 Integrations
| Service    | Type    | Status  |
|------------|---------|---------|
| Jira Cloud | ALM API | Pending |
| Azure DevOps | ALM API | Pending |
| Ollama     | LLM     | Pending |
| GROQ       | LLM     | Pending |
| Grok (xAI) | LLM     | Pending |

---

## 🛡️ Behavioral Rules
1. **Never guess** at business logic — all decisions are deterministic.
2. The **LLM is used only for generation** — not for routing or decision-making.
3. **Test Connection must pass** before any generation is triggered.
4. Template (`Test Plan - Template.docx`) structure must be respected in all outputs.
5. Additional context is always appended, never overrides the fetched story.
6. If Jira fetch fails → surface clear error; do NOT proceed to generation.
7. Output push to Jira/ADO limits payloads to conform to ALM comment caps.

---

## 🏗️ Architectural Invariants
- **Frontend**: React/TypeScript (Vite), standalone.
- **Backend**: Node.js/Express — handles ALM fetches, LLM calls, and Webhook Pushes.
- **Tools layer**: Deterministic integrations.
- **No hardcoded keys** — all credentials via UI settings → persisted to localStorage.

---

## 📋 Maintenance Log
- 2026-03-28: Project Constitution initialized.
- 2026-03-28: Discovery answers received. Blueprint drafted.
- 2026-03-28: Implemented ALM Connectors and multi-LLM engine.
- 2026-03-28: Added 'Push to ALM' action to trigger webhook posting securely.
- 2026-03-28: System Pilot concludes; System is Ready.
