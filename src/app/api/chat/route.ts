import { NextResponse } from 'next/server'
import { runEden, type AnthropicMessage } from '@/lib/eden-agent'

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured in .env.local' },
      { status: 500 }
    )
  }

  const { messages, context } = await req.json()

  // Anthropic requires the first message to be from the user
  const trimmed = (messages as AnthropicMessage[]).filter((_, i) =>
    !(i === 0 && (messages as AnthropicMessage[])[0].role === 'assistant')
  )

  try {
    const reply = await runEden(trimmed, context)
    return NextResponse.json({ reply })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Eden error' },
      { status: 500 }
    )
  }
}
