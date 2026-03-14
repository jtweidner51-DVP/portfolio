import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ---------------------------------------------------------------------------
// Load all /docs files once at cold start
// ---------------------------------------------------------------------------

const DOC_FILES = [
  { label: 'CV (condensed)',         path: 'cv/cv-condensed.md' },
  { label: 'CV (full)',              path: 'cv/cv-full.md' },
  { label: 'Leadership philosophy',  path: 'context/leadership-philosophy.md' },
  { label: 'Frameworks',             path: 'context/frameworks.md' },
  { label: 'Research & interests',   path: 'context/thoughtworks-research.md' },
  { label: 'CASOL narratives',       path: 'stories/casol-narratives.md' },
  { label: 'Interview answers',      path: 'stories/interview-answers.md' },
]

function loadDocs() {
  const docsRoot = join(__dirname, '../../docs')
  return DOC_FILES
    .map(({ label, path }) => {
      const fullPath = join(docsRoot, path)
      if (!existsSync(fullPath)) return ''
      const content = readFileSync(fullPath, 'utf-8').trim()
      return `### ${label}\n\n${content}`
    })
    .filter(Boolean)
    .join('\n\n---\n\n')
}

const docsContent = loadDocs()

const SYSTEM_PROMPT = `You are a helpful career chatbot embedded in a personal portfolio site. \
Your role is to answer questions about the portfolio owner's professional background, skills, \
experience, and career story — clearly, confidently, and in first person on their behalf.

Guidelines:
- Answer as if you are the portfolio owner speaking ("I worked at...", "My approach is...")
- Be specific and draw on the information provided below; don't make things up
- Keep answers concise unless the question clearly calls for detail
- If asked something not covered in your knowledge base, say so honestly rather than guessing
- Do not discuss politics, personal opinions unrelated to professional topics, or anything \
  outside the scope of career and professional background
- Stay warm, professional, and human in tone

---

## Knowledge Base

${docsContent}
`

// ---------------------------------------------------------------------------
// Netlify function handler
// ---------------------------------------------------------------------------

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY?.trim() })

export const handler = async (event) => {
  const key = process.env.ANTHROPIC_API_KEY
  console.log('DEBUG key:', key ? `"${key.slice(0,12)}..." (len=${key.length})` : 'UNDEFINED')

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let message, history
  try {
    ;({ message, history = [] } = JSON.parse(event.body))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  if (!message || typeof message !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'message is required' }) }
  }

  // Sanitise history — only keep role/content pairs, cap at last 20 turns
  const safeHistory = history
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-20)
    .map(m => ({ role: m.role, content: m.content }))

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        ...safeHistory,
        { role: 'user', content: message },
      ],
    })

    const reply = response.content.find(b => b.type === 'text')?.text ?? ''

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ reply }),
    }
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}:`, error.message)
      return {
        statusCode: error.status ?? 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: error.message }),
      }
    }
    console.error('Unexpected error:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
