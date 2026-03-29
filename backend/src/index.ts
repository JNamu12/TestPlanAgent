import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
export const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;

// ─── Health ─────────────────────────────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'TestPlanAgent API', port: PORT });
});

// ─── Test Connection ─────────────────────────────────────────────────────────
app.post('/api/test-connection', async (req: Request, res: Response) => {
  const { type, config } = req.body;

  try {
    if (type === 'jira') {
      const { url, email, apiToken } = config;
      const response = await axios.get(`${url}/rest/api/3/myself`, {
        auth: { username: email, password: apiToken },
        timeout: 8000,
      });
      return res.json({ success: true, message: `Connected as: ${response.data.displayName}` });
    }

    if (type === 'ado') {
      const { orgUrl, pat } = config;
      const response = await axios.get(`${orgUrl}/_apis/projects?api-version=7.0`, {
        headers: { Authorization: `Basic ${Buffer.from(`:${pat}`).toString('base64')}` },
        timeout: 8000,
      });
      const count = response.data?.count ?? '?';
      return res.json({ success: true, message: `Connected! Found ${count} project(s).` });
    }

    if (type === 'ollama') {
      const { baseUrl } = config;
      const response = await axios.get(`${baseUrl}/api/tags`, { timeout: 5000 });
      const models = (response.data?.models || []).map((m: any) => m.name).join(', ') || 'none';
      return res.json({ success: true, message: `Ollama reachable. Models: ${models}` });
    }

    if (type === 'groq') {
      const { apiKey } = config;
      await axios.get('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 8000,
      });
      return res.json({ success: true, message: 'GROQ API key is valid.' });
    }

    if (type === 'grok') {
      const { apiKey } = config;
      await axios.get('https://api.x.ai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 8000,
      });
      return res.json({ success: true, message: 'Grok (xAI) API key is valid.' });
    }

    if (type === 'gemini') {
      const { apiKey } = config;
      await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, { timeout: 8000 });
      return res.json({ success: true, message: 'Gemini API key is valid.' });
    }

    return res.status(400).json({ success: false, message: 'Unknown connection type.' });
  } catch (err: any) {
    const msg = err?.response?.data?.errorMessages?.[0] || err?.response?.data?.message || err?.message || 'Connection failed.';
    return res.status(200).json({ success: false, message: msg });
  }
});

// ─── Fetch Jira Story ────────────────────────────────────────────────────────
app.post('/api/fetch-story', async (req: Request, res: Response) => {
  const { almType, config, storyId } = req.body;

  try {
    if (almType === 'jira') {
      const { url, email, apiToken } = config;
      const resp = await axios.get(`${url}/rest/api/3/issue/${storyId}`, {
        auth: { username: email, password: apiToken },
        timeout: 10000,
      });
      const issue = resp.data;
      const description = issue.fields?.description?.content
        ?.map((block: any) => block.content?.map((c: any) => c.text).join('') || '').join('\n') || '';
      const story = {
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        description,
        issueType: issue.fields.issuetype?.name,
        status: issue.fields.status?.name,
        priority: issue.fields.priority?.name,
        project: issue.fields.project?.name,
      };
      return res.json({ success: true, story });
    }

    if (almType === 'ado') {
      const { orgUrl, project, pat } = config;
      const authHeader = `Basic ${Buffer.from(`:${pat}`).toString('base64')}`;
      const resp = await axios.get(
        `${orgUrl}/${project}/_apis/wit/workitems/${storyId}?$expand=all&api-version=7.0`,
        { headers: { Authorization: authHeader }, timeout: 10000 }
      );
      const wi = resp.data;
      const story = {
        id: String(wi.id),
        key: String(wi.id),
        summary: wi.fields['System.Title'],
        description: wi.fields['System.Description']?.replace(/<[^>]+>/g, '') || '',
        issueType: wi.fields['System.WorkItemType'],
        status: wi.fields['System.State'],
        priority: wi.fields['Microsoft.VSTS.Common.Priority'] || 'N/A',
        project: wi.fields['System.TeamProject'],
      };
      return res.json({ success: true, story });
    }

    return res.status(400).json({ success: false, message: 'Unknown ALM type.' });
  } catch (err: any) {
    const msg = err?.response?.data?.errorMessages?.[0] || err?.message || 'Failed to fetch story.';
    return res.status(200).json({ success: false, message: msg });
  }
});

// ─── Generate Test Plan ──────────────────────────────────────────────────────
app.post('/api/generate-test-plan', async (req: Request, res: Response) => {
  const { llmConfig, story, additionalContext } = req.body;

  const prompt = buildPrompt(story, additionalContext);
  console.log(`[ALM] Starting Test Plan generation via ${llmConfig.provider} (Model: ${llmConfig.model})...`);
  const t0 = Date.now();

  try {
    let result = '';

    if (llmConfig.provider === 'ollama') {
      const resp = await axios.post(`${llmConfig.baseUrl}/api/generate`, {
        model: llmConfig.model,
        prompt,
        stream: false,
      }, { timeout: 600000 }); // 10 minutes for slow local models
      result = resp.data.response;
      console.log(`[ALM] Ollama generation finished in ${(Date.now() - t0)/1000}s`);
    } else if (llmConfig.provider === 'groq') {
      const resp = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: llmConfig.model || 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }, { headers: { Authorization: `Bearer ${llmConfig.apiKey}` }, timeout: 600000 });
      result = resp.data.choices[0]?.message?.content || '';
    } else if (llmConfig.provider === 'grok') {
      const resp = await axios.post('https://api.x.ai/v1/chat/completions', {
        model: llmConfig.model || 'grok-3-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }, { headers: { Authorization: `Bearer ${llmConfig.apiKey}` }, timeout: 600000 });
      result = resp.data.choices[0]?.message?.content || '';
    } else if (llmConfig.provider === 'gemini') {
      const resp = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${llmConfig.model || 'gemini-1.5-flash'}:generateContent?key=${llmConfig.apiKey}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { timeout: 600000 }
      );
      result = resp.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      return res.status(400).json({ success: false, message: 'Unknown LLM provider.' });
    }

    return res.json({ success: true, testPlan: result });
  } catch (err: any) {
    const msg = err?.response?.data?.error?.message || err?.message || 'LLM generation failed.';
    return res.status(200).json({ success: false, message: msg });
  }
});

// ─── Push Test Plan ─────────────────────────────────────────────────────────
app.post('/api/push-test-plan', async (req: Request, res: Response) => {
  const { almType, config, storyId, testPlan } = req.body;

  try {
    if (almType === 'jira') {
      const { url, email, apiToken } = config;
      // Jira V3 Comment API expects ADF (Atlassian Document Format)
      await axios.post(`${url}/rest/api/3/issue/${storyId}/comment`, {
        body: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "🤖 AI-Generated Test Plan:\n\n" + testPlan.substring(0, 30000) // Jira comment limit safeguard
                }
              ]
            }
          ]
        }
      }, {
        auth: { username: email, password: apiToken },
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return res.json({ success: true, message: 'Success! Test Plan pushed as a comment to Jira.' });
    }

    if (almType === 'ado') {
      const { orgUrl, project, pat } = config;
      const authHeader = `Basic ${Buffer.from(`:${pat}`).toString('base64')}`;
      // ADO Comment API
      await axios.post(
        `${orgUrl}/${project}/_apis/wit/workItems/${storyId}/comments?api-version=7.0-preview.3`,
        { text: `🤖 AI-Generated Test Plan:\n\n${testPlan}` },
        { headers: { Authorization: authHeader, 'Content-Type': 'application/json' }, timeout: 15000 }
      );
      return res.json({ success: true, message: 'Success! Test Plan pushed as a comment to Azure DevOps.' });
    }

    return res.status(400).json({ success: false, message: 'Unknown ALM type.' });
  } catch (err: any) {
    console.error('Push Error:', err?.response?.data || err.message);
    const msg = err?.response?.data?.message || err?.message || 'Failed to push to ALM tool.';
    return res.status(200).json({ success: false, message: msg });
  }
});

function buildPrompt(story: any, additionalContext: string): string {
  return `You are an expert QA Engineer. Generate a comprehensive, structured Test Plan based on the following user story.

## USER STORY
- **ID**: ${story.key}
- **Title**: ${story.summary}
- **Type**: ${story.issueType}
- **Status**: ${story.status}
- **Priority**: ${story.priority}
- **Project**: ${story.project}
- **Description**:
${story.description || 'No description provided.'}

${additionalContext ? `## ADDITIONAL CONTEXT\n${additionalContext}` : ''}

## INSTRUCTIONS
Generate a detailed Test Plan with the following sections in Markdown format:

1. **Test Plan Overview** - Objective, scope, and summary
2. **Test Strategy** - Approach, types of testing (functional, regression, edge cases)
3. **Test Cases** - At least 8-12 detailed test cases in a Markdown table with columns: | TC ID | Title | Preconditions | Test Steps | Expected Result | Priority |
4. **Entry & Exit Criteria** - When to start and stop testing
5. **Risk Analysis** - Potential risks and mitigations
6. **Test Environment** - Required tools, browsers, environments

Be exhaustive, professional, and thorough. Start directly with the Markdown output.`;
}

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`[TestPlanAgent API] Server listening at http://localhost:${PORT}`);
  });
  server.setTimeout(600000);
}

export default app;
