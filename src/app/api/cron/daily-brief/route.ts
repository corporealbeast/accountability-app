import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { sendTelegramMessage } from '@/lib/telegram-utils'

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_HEADERS = () => ({
  Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
  Version: '2021-04-15',
  'Content-Type': 'application/json',
})

// Vercel cron: runs daily at 7:00 AM Pacific (14:00 UTC)
// vercel.json: { "path": "/api/cron/daily-brief", "schedule": "0 14 * * *" }
export async function GET(req: Request) {
  // Verify Vercel cron secret in production
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const chatId = process.env.TELEGRAM_ALLOWED_CHAT_ID
  if (!chatId) return NextResponse.json({ error: 'TELEGRAM_ALLOWED_CHAT_ID not set' }, { status: 500 })

  const supabase = createServerSupabaseClient()
  const loc = process.env.GHL_LOCATION_ID
  const today = new Date()
  const todayStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  try {
    // Fetch all data in parallel
    const [tasksResult, ghlContacts, ghlAppointments] = await Promise.allSettled([
      supabase.from('odin_tasks').select('title, status, priority').in('status', ['planned', 'in-progress']).order('priority').limit(5),
      fetch(`${GHL_BASE}/contacts/?locationId=${loc}&limit=5&sortBy=dateAdded&sortOrder=desc`, { headers: GHL_HEADERS() }).then((r) => r.json()),
      fetch(
        `${GHL_BASE}/calendars/appointments?locationId=${loc}&startTime=${today.toISOString()}&endTime=${new Date(today.getTime() + 86400000).toISOString()}&limit=10`,
        { headers: GHL_HEADERS() }
      ).then((r) => r.json()),
    ])

    // Try Google Calendar
    let calendarSection = ''
    try {
      const calRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/google?action=today_events`)
      const calData = await calRes.json()
      const events = calData.events ?? []
      if (events.length) {
        const eventLines = events.map((e: { start: string; summary: string }) => {
          const time = new Date(e.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          return `  • ${time} — ${e.summary}`
        })
        calendarSection = `\n📅 *Calendar*\n${eventLines.join('\n')}`
      }
    } catch {}

    // Try GymMaster expiring memberships
    let membersSection = ''
    try {
      const gmRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/gymmaster?action=get_expiring&days=7`)
      const gmData = await gmRes.json()
      const expiring = gmData.members ?? []
      if (expiring.length) {
        const memberLines = expiring.map((m: { firstName?: string; lastName?: string; expiryDate?: string }) =>
          `  • ${m.firstName} ${m.lastName} — expires ${m.expiryDate}`
        )
        membersSection = `\n💳 *Expiring Memberships (7 days)*\n${memberLines.join('\n')}`
      }
    } catch {}

    // Build sections
    const sections: string[] = [`*Good morning. Here's your brief for ${todayStr}.*`]

    // Tasks
    const tasks = tasksResult.status === 'fulfilled' ? tasksResult.value.data ?? [] : []
    if (tasks.length) {
      const taskLines = tasks.map((t) => {
        const badge = t.status === 'in-progress' ? '🔄' : '📌'
        const pri = t.priority === 'high' ? '❗' : '·'
        return `  ${badge} ${pri} ${t.title}`
      })
      sections.push(`\n📋 *Active Tasks (${tasks.length})*\n${taskLines.join('\n')}`)
    } else {
      sections.push('\n📋 *Tasks* — Pipeline clear.')
    }

    // New leads
    const contacts = ghlContacts.status === 'fulfilled' ? ghlContacts.value.contacts ?? [] : []
    if (contacts.length) {
      const leadLines = contacts.slice(0, 3).map((c: { firstName?: string; lastName?: string; email?: string }) =>
        `  • ${c.firstName ?? ''} ${c.lastName ?? ''} ${c.email ? `(${c.email})` : ''}`
      )
      sections.push(`\n👥 *Recent Leads*\n${leadLines.join('\n')}`)
    }

    // Appointments
    const appts = ghlAppointments.status === 'fulfilled' ? ghlAppointments.value.appointments ?? [] : []
    if (appts.length) {
      const apptLines = appts.map((a: { startTime?: string; contactName?: string; title?: string }) => {
        const time = a.startTime ? new Date(a.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '?'
        return `  • ${time} — ${a.contactName ?? a.title ?? 'Unknown'}`
      })
      sections.push(`\n📅 *GHL Appointments Today*\n${apptLines.join('\n')}`)
    }

    if (calendarSection)  sections.push(calendarSection)
    if (membersSection)   sections.push(membersSection)

    sections.push('\n─────\nReply /tasks, /leads, or /members for more detail.')

    const briefText = sections.join('')
    await sendTelegramMessage(chatId, briefText)

    // Log to Supabase
    const { data: profile } = await supabase.from('profiles').select('id').limit(1).single()
    if (profile) {
      await supabase.from('notifications').insert({
        user_id: profile.id,
        type: 'brief_sent',
        title: 'Morning brief sent',
        body: `Daily briefing delivered at ${new Date().toISOString()}`,
        source: 'cron',
      })
    }

    return NextResponse.json({ ok: true, sent: true })
  } catch (err) {
    await sendTelegramMessage(chatId, `Odin: morning brief failed — ${err instanceof Error ? err.message : String(err)}`)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
