import { createServerSupabaseClient } from './supabase-server'
import { sendTelegramMessage, formatDate, formatTime } from './telegram-utils'
import { appendNote, getTodayNotePath } from './obsidian'

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_HEADERS = () => ({
  Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
  Version: '2021-04-15',
  'Content-Type': 'application/json',
})

async function ghlGet(path: string) {
  const res = await fetch(`${GHL_BASE}${path}`, { headers: GHL_HEADERS() })
  return res.json()
}

// ── Command handlers ──────────────────────────────────────────

async function handleStatus(): Promise<string> {
  const supabase = createServerSupabaseClient()

  const [{ count: planned }, { count: inProgress }, { count: done }] = await Promise.all([
    supabase.from('odin_tasks').select('*', { count: 'exact', head: true }).eq('status', 'planned'),
    supabase.from('odin_tasks').select('*', { count: 'exact', head: true }).eq('status', 'in-progress'),
    supabase.from('odin_tasks').select('*', { count: 'exact', head: true }).eq('status', 'done'),
  ])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

  return [
    `*Odin Status — ${today}*`,
    '',
    `📋 Tasks: ${inProgress ?? 0} active, ${planned ?? 0} planned, ${done ?? 0} done`,
    '',
    'Reply /tasks to see full pipeline, /leads for new contacts, /appointments for today\'s schedule.',
  ].join('\n')
}

async function handleTasks(): Promise<string> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('odin_tasks')
    .select('title, status, priority, category')
    .in('status', ['planned', 'in-progress'])
    .order('priority')
    .limit(10)

  if (!data?.length) return 'No active tasks in the pipeline.'

  const lines = data.map((t) => {
    const badge = t.status === 'in-progress' ? '🔄' : '📌'
    const pri = t.priority === 'high' ? '❗' : t.priority === 'medium' ? '·' : '–'
    return `${badge} ${pri} ${t.title}`
  })

  return `*Active Pipeline*\n\n${lines.join('\n')}\n\nUse /done [title] to complete a task.`
}

async function handleLeads(): Promise<string> {
  try {
    const loc = process.env.GHL_LOCATION_ID
    const data = await ghlGet(`/contacts/?locationId=${loc}&limit=8&sortBy=dateAdded&sortOrder=desc`)
    const contacts = data.contacts ?? []

    if (!contacts.length) return 'No recent contacts found in GHL.'

    const lines = contacts.map((c: { firstName?: string; lastName?: string; email?: string; dateAdded?: string }) => {
      const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Unknown'
      const email = c.email ? ` — ${c.email}` : ''
      const date = c.dateAdded ? ` (${formatDate(c.dateAdded)})` : ''
      return `👤 ${name}${email}${date}`
    })

    return `*Recent Leads*\n\n${lines.join('\n')}`
  } catch {
    return 'Could not fetch leads from GHL.'
  }
}

async function handleAppointments(): Promise<string> {
  try {
    const loc = process.env.GHL_LOCATION_ID
    const now = new Date()
    const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59)

    const data = await ghlGet(
      `/calendars/appointments?locationId=${loc}&startTime=${now.toISOString()}&endTime=${endOfDay.toISOString()}&limit=10`
    )
    const appts = data.appointments ?? []

    if (!appts.length) return 'No appointments for the rest of today.'

    const lines = appts.map((a: { title?: string; startTime?: string; contactName?: string }) => {
      const time = a.startTime ? formatTime(a.startTime) : '?'
      const name = a.contactName ?? a.title ?? 'Unknown'
      return `📅 ${time} — ${name}`
    })

    return `*Today\'s Appointments*\n\n${lines.join('\n')}`
  } catch {
    return 'Could not fetch appointments from GHL.'
  }
}

async function handleMembers(): Promise<string> {
  try {
    const res = await fetch(`${getAppUrl()}/api/gymmaster?action=get_expiring&days=14`)
    const data = await res.json()
    const members = data.members ?? []

    if (!members.length) return 'No memberships expiring in the next 14 days.'

    const lines = members.map((m: { firstName?: string; lastName?: string; expiryDate?: string }) => {
      const name = [m.firstName, m.lastName].filter(Boolean).join(' ') || 'Member'
      const expiry = m.expiryDate ? formatDate(m.expiryDate) : 'unknown'
      return `💳 ${name} — expires ${expiry}`
    })

    return `*Expiring Memberships (14 days)*\n\n${lines.join('\n')}`
  } catch {
    return 'GymMaster not configured. Add GYMMASTER_API_KEY to enable.'
  }
}

async function handleDone(taskTitle: string): Promise<string> {
  if (!taskTitle.trim()) return 'Usage: /done [task title]'

  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('odin_tasks')
    .select('id, title')
    .in('status', ['planned', 'in-progress'])

  if (!data?.length) return 'No active tasks found.'

  // Fuzzy match: find task where title includes the search string (case-insensitive)
  const search = taskTitle.toLowerCase()
  const match = data.find((t) => t.title.toLowerCase().includes(search))

  if (!match) return `No task found matching "${taskTitle}". Use /tasks to see active tasks.`

  await supabase
    .from('odin_tasks')
    .update({ status: 'done', updated_at: new Date().toISOString() })
    .eq('id', match.id)

  return `Done: "${match.title}"`
}

async function handleAdd(taskDesc: string): Promise<string> {
  if (!taskDesc.trim()) return 'Usage: /add [task description]'

  const supabase = createServerSupabaseClient()
  const { data: profile } = await supabase.from('profiles').select('id').limit(1).single()

  if (!profile) return 'Could not find user profile.'

  await supabase.from('odin_tasks').insert({
    user_id: profile.id,
    title: taskDesc.trim(),
    category: 'pipeline',
    status: 'planned',
    priority: 'medium',
    source: 'telegram',
  })

  return `Task added: "${taskDesc.trim()}"`
}

async function handleNote(text: string): Promise<string> {
  if (!text.trim()) return 'Usage: /note [text to add to today\'s note]'

  const timestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  const content = `\n- ${timestamp}: ${text.trim()}`

  try {
    await appendNote(getTodayNotePath(), content)
    return `Note added to today's Obsidian note.`
  } catch {
    return 'Obsidian not reachable. Is the Local REST API plugin running?'
  }
}

function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

async function handleEdenChat(text: string): Promise<string> {
  try {
    const { runEden } = await import('./eden-agent')
    const reply = await runEden([{ role: 'user', content: text }])
    return reply || 'No response from Eden.'
  } catch (err) {
    return `Eden error: ${err instanceof Error ? err.message : String(err)}`
  }
}

// ── Main dispatcher ────────────────────────────────────────────

export async function dispatchCommand(text: string, chatId: string | number): Promise<void> {
  const trimmed = text.trim()

  let reply: string

  if (trimmed === '/status' || trimmed === '/start') {
    reply = await handleStatus()
  } else if (trimmed === '/tasks') {
    reply = await handleTasks()
  } else if (trimmed === '/leads') {
    reply = await handleLeads()
  } else if (trimmed === '/appointments' || trimmed === '/appt') {
    reply = await handleAppointments()
  } else if (trimmed === '/members') {
    reply = await handleMembers()
  } else if (trimmed.startsWith('/done ')) {
    reply = await handleDone(trimmed.slice(6))
  } else if (trimmed.startsWith('/add ')) {
    reply = await handleAdd(trimmed.slice(5))
  } else if (trimmed.startsWith('/note ')) {
    reply = await handleNote(trimmed.slice(6))
  } else if (trimmed === '/brief') {
    // Trigger full briefing inline
    const [status, tasks, appts, members] = await Promise.all([
      handleStatus(), handleTasks(), handleAppointments(), handleMembers(),
    ])
    reply = [status, '', '─────', '', tasks, '', '─────', '', appts, '', '─────', '', members].join('\n')
  } else if (trimmed === '/help') {
    reply = [
      '*Eden Commands*',
      '',
      '/status — quick overview',
      '/tasks — active pipeline',
      '/leads — recent GHL contacts',
      '/appointments — today\'s schedule',
      '/members — expiring memberships',
      '/brief — full morning briefing',
      '/done [title] — mark task complete',
      '/add [description] — create new task',
      '/note [text] — append to Obsidian',
      '',
      'Or just type anything to talk to Eden.',
    ].join('\n')
  } else {
    // Free-text → Eden AI
    reply = await handleEdenChat(trimmed)
  }

  await sendTelegramMessage(chatId, reply)
}
