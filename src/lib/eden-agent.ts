import { ODIN_TOOLS, executeTool } from './odin-tools'
import { EDEN_SYSTEM_PROMPT } from './eden-system-prompt'

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const ANTHROPIC_BASE = 'https://api.anthropic.com/v1'

export type AnthropicMessage = { role: 'user' | 'assistant'; content: string | AnthropicContent[] }
export type AnthropicContent =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string }

function buildSystemPrompt(context?: string): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const dateHeader = `CURRENT DATE & TIME: ${dateStr}, ${timeStr}`

  const base = `${dateHeader}\n\n${EDEN_SYSTEM_PROMPT}`
  return context ? `${base}\n\nRecent GHL/CRM context:\n${context}` : base
}

export async function runEden(
  messages: AnthropicMessage[],
  context?: string
): Promise<string> {
  if (!ANTHROPIC_KEY) throw new Error('ANTHROPIC_API_KEY not configured')

  const system = buildSystemPrompt(context)
  const conversationMessages: AnthropicMessage[] = [...messages]
  let iterations = 0
  const MAX_ITERATIONS = 10

  while (iterations < MAX_ITERATIONS) {
    iterations++

    const res = await fetch(`${ANTHROPIC_BASE}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system,
        tools: ODIN_TOOLS,
        messages: conversationMessages,
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message ?? 'Anthropic API error')

    const { content, stop_reason } = data

    if (stop_reason === 'end_turn') {
      return content.find((c: AnthropicContent) => c.type === 'text')?.text ?? ''
    }

    if (stop_reason === 'tool_use') {
      conversationMessages.push({ role: 'assistant', content })

      const toolUseBlocks = content.filter((c: AnthropicContent) => c.type === 'tool_use') as {
        type: 'tool_use'; id: string; name: string; input: Record<string, unknown>
      }[]

      const toolResults = await Promise.all(
        toolUseBlocks.map(async (block) => ({
          type: 'tool_result' as const,
          tool_use_id: block.id,
          content: await executeTool(block.name, block.input),
        }))
      )

      conversationMessages.push({ role: 'user', content: toolResults })
      continue
    }

    return content.find((c: AnthropicContent) => c.type === 'text')?.text ?? ''
  }

  return 'Eden hit the iteration limit. Please try a more specific request.'
}
