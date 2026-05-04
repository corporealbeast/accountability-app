import { NextResponse } from 'next/server'

type TelegramUpdate = {
  message?: {
    message_id: number
    chat: { id: number }
    from: { id: number; first_name?: string }
    text?: string
  }
}

export async function POST(req: Request) {
  let chatId: number | undefined

  try {
    const body: TelegramUpdate = await req.json()
    const message = body.message

    if (!message?.text) return NextResponse.json({ ok: true })

    chatId = message.chat.id
    const fromId = String(message.from.id)
    const text = message.text

    // Security gate: only process messages from the authorized chat ID
    const allowedId = process.env.TELEGRAM_ALLOWED_CHAT_ID
    if (allowedId && fromId !== allowedId) {
      return NextResponse.json({ ok: true })
    }

    const { dispatchCommand } = await import('@/lib/telegram-commands')
    await dispatchCommand(text, chatId)

  } catch (err) {
    // Always return 200 — if we return 500, Telegram will retry forever
    // Instead, report the error back via Telegram if we know the chat ID
    if (chatId) {
      try {
        const { sendTelegramMessage } = await import('@/lib/telegram-utils')
        await sendTelegramMessage(chatId, `Eden error: ${err instanceof Error ? err.message : String(err)}`)
      } catch {
        // If even sending the error fails, just swallow it
      }
    }
  }

  return NextResponse.json({ ok: true })
}
