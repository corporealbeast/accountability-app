import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not set' }, { status: 500 })

  const [webhookRes, meRes] = await Promise.all([
    fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`),
    fetch(`https://api.telegram.org/bot${token}/getMe`),
  ])

  const [webhook, me] = await Promise.all([webhookRes.json(), meRes.json()])

  return NextResponse.json({ webhook, me, allowedChatId: process.env.TELEGRAM_ALLOWED_CHAT_ID })
}
