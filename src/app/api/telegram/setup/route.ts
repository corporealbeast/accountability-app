import { NextResponse } from 'next/server'
import { registerWebhook } from '@/lib/telegram-utils'

// One-time setup: registers the Telegram webhook with this app's URL.
// Visit: GET /api/telegram/setup?secret=YOUR_CRON_SECRET
// After running once successfully, you don't need to run it again.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')

  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not set in environment variables' }, { status: 500 })
  }

  const host = req.headers.get('host') ?? ''
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const webhookUrl = `${protocol}://${host}/api/telegram`

  try {
    await registerWebhook(webhookUrl)
    return NextResponse.json({ ok: true, webhookUrl, message: 'Telegram webhook registered successfully. Eden is live.' })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
