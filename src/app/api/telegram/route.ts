import { NextResponse } from 'next/server'
import { dispatchCommand } from '@/lib/telegram-commands'
import { createServerSupabaseClient } from '@/lib/supabase-server'

type TelegramUpdate = {
  message?: {
    message_id: number
    chat: { id: number }
    from: { id: number; first_name?: string }
    text?: string
  }
}

export async function POST(req: Request) {
  const body: TelegramUpdate = await req.json()
  const message = body.message

  // Always return 200 immediately — Telegram retries on non-200
  if (!message?.text) return NextResponse.json({ ok: true })

  const chatId = message.chat.id
  const fromId = String(message.from.id)
  const text = message.text

  // Security gate: only process messages from the authorized chat ID
  const allowedId = process.env.TELEGRAM_ALLOWED_CHAT_ID
  if (allowedId && fromId !== allowedId) {
    return NextResponse.json({ ok: true })
  }

  // Log inbound message (fire and forget)
  const supabase = createServerSupabaseClient()
  supabase.from('telegram_messages').insert({
    chat_id: chatId,
    direction: 'inbound',
    text,
  }).then(() => {})

  // Process command asynchronously so we return 200 quickly
  // The dispatchCommand will call sendTelegramMessage internally
  dispatchCommand(text, chatId).catch(async (err) => {
    const { sendTelegramMessage } = await import('@/lib/telegram-utils')
    await sendTelegramMessage(chatId, `Eden error: ${err instanceof Error ? err.message : String(err)}`)
  })

  return NextResponse.json({ ok: true })
}
