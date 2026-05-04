import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { sendTelegramMessage } from '@/lib/telegram-utils'

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_HEADERS = () => ({
  Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
  Version: '2021-04-15',
  'Content-Type': 'application/json',
})

// Vercel cron: runs daily at noon Pacific (19:00 UTC)
// Scans GHL for contacts with no activity in 48h+ and creates follow-up tasks
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const chatId = process.env.TELEGRAM_ALLOWED_CHAT_ID
  const loc = process.env.GHL_LOCATION_ID
  const supabase = createServerSupabaseClient()

  try {
    // Fetch recent contacts from GHL (last 7 days, no activity in 48h+)
    const twoDaysAgo = new Date()
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const res = await fetch(
      `${GHL_BASE}/contacts/?locationId=${loc}&limit=50&sortBy=dateAdded&sortOrder=desc`,
      { headers: GHL_HEADERS() }
    )
    const data = await res.json()
    const contacts = data.contacts ?? []

    // Filter: added between 2 and 7 days ago (stale leads)
    const staleLeads = contacts.filter((c: { dateAdded?: string }) => {
      if (!c.dateAdded) return false
      const added = new Date(c.dateAdded)
      return added <= twoDaysAgo && added >= sevenDaysAgo
    })

    const { data: profile } = await supabase.from('profiles').select('id').limit(1).single()
    if (!profile) return NextResponse.json({ error: 'No profile found' }, { status: 500 })

    let created = 0

    for (const contact of staleLeads) {
      const contactId = contact.id as string
      const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Unknown'

      // Check if a follow-up task already exists for this contact
      const { data: existing } = await supabase
        .from('odin_tasks')
        .select('id')
        .eq('ghl_contact_id', contactId)
        .in('status', ['planned', 'in-progress'])
        .limit(1)

      if (existing?.length) continue // already has an active task

      // Create the follow-up task
      await supabase.from('odin_tasks').insert({
        user_id: profile.id,
        title: `Follow up with ${name}`,
        description: contact.email ? `Email: ${contact.email} | Phone: ${contact.phone ?? 'N/A'}` : undefined,
        category: 'follow-up',
        status: 'planned',
        priority: 'high',
        source: 'cron',
        ghl_contact_id: contactId,
      })

      // Notification
      await supabase.from('notifications').insert({
        user_id: profile.id,
        type: 'task_auto_created',
        title: `Follow-up task: ${name}`,
        body: 'No activity in 48h — task created automatically',
        source: 'cron',
      })

      created++
    }

    if (created > 0 && chatId) {
      await sendTelegramMessage(
        chatId,
        `*Lead Follow-Up Check*\n\n${created} follow-up task${created === 1 ? '' : 's'} auto-created for stale leads (48h+ no activity).\n\nReply /tasks to review.`
      )
    }

    return NextResponse.json({ ok: true, staleLeads: staleLeads.length, tasksCreated: created })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
