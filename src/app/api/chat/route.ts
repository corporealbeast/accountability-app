import { NextResponse } from 'next/server'
import { ODIN_TOOLS, executeTool } from '@/lib/odin-tools'

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const ANTHROPIC_BASE = 'https://api.anthropic.com/v1'

const SYSTEM_PROMPT = `You are Eden — Christian's executive assistant working across all Odin projects (Odin is his marketing and gym business). You have access to tools that let you take real actions: reading leads from GoHighLevel, sending messages, checking the calendar, managing the task pipeline, writing to Obsidian, checking goals and check-ins, managing GymMaster members, and triggering Zapier automations.

When the user asks you to do something, use your tools to actually do it. Don't just describe what you would do — do it.

Operating principles:
- Act first, report after. Use tools before answering.
- Be concise. 2-4 sentences unless asked for detail.
- Speak in first person as an active agent: "I found 3 leads...", "I've created a task...", "I'm sending the follow-up..."
- When multiple things need doing, batch tool calls efficiently.
- If a tool fails, explain what happened and suggest the next step.

Christian's context:
- Gym manager at House of Power (strongman / powerlifting gym)
- Runs GoHighLevel for all lead management and client communication
- Uses GymMaster for memberships and payments
- Competes in strongman — prioritize training and recovery data when asked
- Main goals: hit $10k MRR, grow member base, automate everything`

type AnthropicMessage = { role: 'user' | 'assistant'; content: string | AnthropicContent[] }
type AnthropicContent =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
  | { type: 'tool_result'; tool_use_id: string; content: string }

async function callClaude(messages: AnthropicMessage[], context?: string) {
  const systemWithContext = context
    ? `${SYSTEM_PROMPT}\n\nRecent GHL/CRM context:\n${context}`
    : SYSTEM_PROMPT

  return fetch(`${ANTHROPIC_BASE}/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemWithContext,
      tools: ODIN_TOOLS,
      messages,
    }),
  })
}

export async function POST(req: Request) {
  if (!ANTHROPIC_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured in .env.local' },
      { status: 500 }
    )
  }

  const { messages, context } = await req.json()

  // Agentic loop: run until Claude stops using tools
  const conversationMessages: AnthropicMessage[] = [...messages]
  let iterations = 0
  const MAX_ITERATIONS = 10 // safety limit

  while (iterations < MAX_ITERATIONS) {
    iterations++

    const res = await callClaude(conversationMessages, context)
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.error?.message ?? 'Anthropic API error' },
        { status: res.status }
      )
    }

    const { content, stop_reason } = data

    // If Claude is done (no tools used), return the final text
    if (stop_reason === 'end_turn') {
      const text = content.find((c: AnthropicContent) => c.type === 'text')?.text ?? ''
      return NextResponse.json({ reply: text })
    }

    // Claude wants to use tools
    if (stop_reason === 'tool_use') {
      // Add Claude's assistant turn (which contains the tool_use blocks)
      conversationMessages.push({ role: 'assistant', content })

      // Execute all tool calls in parallel
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

      // Feed tool results back to Claude
      conversationMessages.push({ role: 'user', content: toolResults })
      continue
    }

    // Unexpected stop reason — return whatever text is there
    const text = content.find((c: AnthropicContent) => c.type === 'text')?.text ?? ''
    return NextResponse.json({ reply: text })
  }

  return NextResponse.json({ reply: 'Eden hit the iteration limit. Please try a more specific request.' })
}
