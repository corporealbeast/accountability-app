import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// GHL sends webhooks for: ContactCreate, ContactUpdate, AppointmentCreate,
// AppointmentUpdate, OpportunityCreate, FormSubmission, InboundMessage, etc.
// Register this URL in GHL: Settings > Integrations > Webhooks

type GHLWebhookPayload = {
  type: string
  locationId?: string
  contactId?: string
  contact?: { firstName?: string; lastName?: string; email?: string; phone?: string }
  [key: string]: unknown
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.GHL_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

async function sendTelegramNotification(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_ALLOWED_CHAT_ID
  if (!token || !chatId) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  })
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-ghl-signature')

  // Skip signature check if no secret is configured (dev mode)
  if (process.env.GHL_WEBHOOK_SECRET && !verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: GHLWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const eventType = payload.type ?? 'Unknown'

  // Store raw event
  await supabase.from('ghl_events').insert({
    event_type: eventType,
    contact_id: payload.contactId ?? null,
    payload,
    processed: false,
  })

  // High-value events: auto-create Odin task + Telegram ping
  if (eventType === 'ContactCreate' || eventType === 'FormSubmission') {
    const contact = payload.contact
    const name = [contact?.firstName, contact?.lastName].filter(Boolean).join(' ') || 'Unknown'
    const email = contact?.email ?? ''

    // Get the single user's ID (single-user app — grab the first profile)
    const { data: profile } = await supabase.from('profiles').select('id').limit(1).single()

    if (profile) {
      await supabase.from('odin_tasks').insert({
        user_id: profile.id,
        title: `Follow up with ${name}`,
        description: email ? `Email: ${email}` : undefined,
        category: 'leads',
        status: 'planned',
        priority: 'high',
        source: 'ghl_webhook',
        ghl_contact_id: payload.contactId ?? null,
      })

      await supabase.from('notifications').insert({
        user_id: profile.id,
        type: 'new_lead',
        title: `New lead: ${name}`,
        body: email ? `${email} — follow-up task created` : 'Follow-up task created',
        source: 'ghl_webhook',
      })
    }

    const eventLabel = eventType === 'FormSubmission' ? 'Form submission' : 'New lead'
    await sendTelegramNotification(
      `*${eventLabel}: ${name}*\n${email ? `📧 ${email}\n` : ''}⚡ Follow-up task created in Odin pipeline`
    )
  }

  if (eventType === 'AppointmentCreate') {
    const contact = payload.contact
    const name = [contact?.firstName, contact?.lastName].filter(Boolean).join(' ') || 'Unknown'

    await sendTelegramNotification(
      `*New appointment booked*\n👤 ${name}\nCheck GHL calendar for details.`
    )
  }

  // Mark event processed
  await supabase
    .from('ghl_events')
    .update({ processed: true })
    .eq('contact_id', payload.contactId ?? '')
    .eq('processed', false)
    .order('created_at', { ascending: false })
    .limit(1)

  return NextResponse.json({ ok: true })
}
