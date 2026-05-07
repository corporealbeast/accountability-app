// Tool executor: maps Claude tool_use requests to actual API/service calls.
// Each function receives the tool input and returns a string result for Claude.

import { createServerSupabaseClient } from './supabase-server'
import { getMembershipsExpiringSoon } from './gymmaster'
import { listKpiFields, getKpiByFields, listReports, runReport } from './gymmaster-reporting'
import { getTodayEvents, getUpcomingEvents, createEvent, updateEvent, deleteEvent } from './google-calendar'
import { appendNote, getTodayNotePath } from './obsidian'
import { sendEmail, listUnreadEmails } from './google-gmail'
import { getTaskLists, createTask } from './google-tasks'
import { triggerZap } from './zapier'
import { listSpreadsheets, getSheetValues, appendSheetValues, updateSheetValues } from './google-sheets'
import { tavilySearch, tavilyExtract } from './tavily'
import { rememberFact, recallFacts, forgetFact } from './eden-memory'
import { getKnowledgeDoc, searchKnowledge } from './knowledge/index'

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

async function ghlPost(path: string, body: unknown) {
  const res = await fetch(`${GHL_BASE}${path}`, {
    method: 'POST',
    headers: GHL_HEADERS(),
    body: JSON.stringify(body),
  })
  return res.json()
}

// ── Tool definitions for Claude ───────────────────────────────

export const ODIN_TOOLS = [
  {
    name: 'get_ghl_contacts',
    description: 'Fetch recent contacts from GoHighLevel CRM. Returns name, email, phone, and date added.',
    input_schema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max contacts to return (default 10)' },
        query: { type: 'string', description: 'Optional search query' },
      },
    },
  },
  {
    name: 'send_ghl_message',
    description: 'Send an SMS or email to a GHL contact.',
    input_schema: {
      type: 'object',
      properties: {
        contactId: { type: 'string', description: 'GHL contact ID' },
        type: { type: 'string', enum: ['SMS', 'Email'], description: 'Message channel' },
        message: { type: 'string', description: 'Message body' },
      },
      required: ['contactId', 'type', 'message'],
    },
  },
  {
    name: 'get_ghl_opportunities',
    description: 'Fetch pipeline opportunities from GoHighLevel.',
    input_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter by status: open, won, lost, abandoned' },
        limit: { type: 'number', description: 'Max results (default 10)' },
      },
    },
  },
  {
    name: 'create_odin_task',
    description: 'Create a new task in the Odin pipeline.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        category: { type: 'string', enum: ['leads', 'appointments', 'campaigns', 'follow-up', 'payments', 'pipeline'] },
        priority: { type: 'string', enum: ['high', 'medium', 'low'] },
      },
      required: ['title', 'category', 'priority'],
    },
  },
  {
    name: 'get_odin_tasks',
    description: 'Get current tasks from the Odin pipeline.',
    input_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['planned', 'in-progress', 'done', 'all'], description: 'Filter by status (default: planned + in-progress)' },
      },
    },
  },
  {
    name: 'get_gymmaster_expiring',
    description: 'Get GymMaster members whose membership expires within N days.',
    input_schema: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'Days until expiry (default 14)' },
      },
    },
  },
  {
    name: 'get_google_calendar',
    description: 'Get upcoming calendar events from Google Calendar.',
    input_schema: {
      type: 'object',
      properties: {
        days: { type: 'number', description: 'How many days ahead to look (1 = today only, default 7)' },
        todayOnly: { type: 'boolean', description: 'If true, only return today\'s events' },
      },
    },
  },
  {
    name: 'add_obsidian_note',
    description: 'Append text to a note in the Obsidian vault.',
    input_schema: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Text to append' },
        path: { type: 'string', description: 'Vault path (default: today\'s daily note)' },
      },
      required: ['content'],
    },
  },
  {
    name: 'create_calendar_event',
    description: 'Create a new event in Google Calendar.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Event title' },
        startISO: { type: 'string', description: 'Start time in ISO 8601 format' },
        endISO: { type: 'string', description: 'End time in ISO 8601 format' },
        description: { type: 'string', description: 'Optional event description' },
        location: { type: 'string', description: 'Optional location' },
      },
      required: ['title', 'startISO', 'endISO'],
    },
  },
  {
    name: 'send_email',
    description: 'Send an email via Gmail.',
    input_schema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email address' },
        subject: { type: 'string', description: 'Email subject' },
        body: { type: 'string', description: 'Email body (plain text)' },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  {
    name: 'create_google_task',
    description: 'Create a task in Google Tasks.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        notes: { type: 'string', description: 'Optional task notes' },
        dueISO: { type: 'string', description: 'Optional due date in ISO 8601 format' },
      },
      required: ['title'],
    },
  },
  {
    name: 'get_goals',
    description: 'Get goals from the accountability dashboard.',
    input_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'paused', 'completed', 'all'], description: 'Filter by status (default: active)' },
      },
    },
  },
  {
    name: 'update_goal',
    description: 'Update a goal\'s progress or status.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Goal ID' },
        progress: { type: 'number', description: 'Progress 0-100' },
        status: { type: 'string', enum: ['active', 'paused', 'completed'], description: 'New status' },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_checkins',
    description: 'Get recent daily check-ins.',
    input_schema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of check-ins to return (default 7)' },
      },
    },
  },
  {
    name: 'get_gymmaster_kpis',
    description: 'Fetch KPI metrics from GymMaster for a date range. Use list first to discover available field IDs.',
    input_schema: {
      type: 'object',
      properties: {
        fieldIds: { type: 'array', items: { type: 'string' }, description: 'KPI field IDs to fetch. Leave empty to list all available fields.' },
        startDate: { type: 'string', description: 'Start date YYYY-MM-DD (default: first of current month)' },
        endDate: { type: 'string', description: 'End date YYYY-MM-DD (default: today)' },
      },
    },
  },
  {
    name: 'get_gymmaster_report',
    description: 'Run a standard GymMaster report. Use without reportId to list available reports.',
    input_schema: {
      type: 'object',
      properties: {
        reportId: { type: 'string', description: 'Report ID to run. Omit to list available reports.' },
        startDate: { type: 'string', description: 'Start date YYYY-MM-DD' },
        endDate: { type: 'string', description: 'End date YYYY-MM-DD' },
      },
    },
  },
  {
    name: 'list_google_sheets',
    description: 'List spreadsheets in Google Drive. Optionally search by name.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Optional name search (e.g. "revenue", "tracker")' },
      },
    },
  },
  {
    name: 'read_sheet',
    description: 'Read cell values from a Google Sheet. Use list_google_sheets first to find the spreadsheet ID.',
    input_schema: {
      type: 'object',
      properties: {
        spreadsheetId: { type: 'string', description: 'The spreadsheet ID from Google Drive' },
        range: { type: 'string', description: 'A1 notation range, e.g. "Sheet1!A1:D20" or just "A1:D20" for first sheet' },
      },
      required: ['spreadsheetId', 'range'],
    },
  },
  {
    name: 'write_sheet',
    description: 'Write or append rows to a Google Sheet. Use append=true to add rows, false to overwrite a range.',
    input_schema: {
      type: 'object',
      properties: {
        spreadsheetId: { type: 'string', description: 'The spreadsheet ID' },
        range: { type: 'string', description: 'A1 notation range, e.g. "Sheet1!A1"' },
        values: {
          type: 'array',
          items: { type: 'array', items: { type: 'string' } },
          description: '2D array of values, e.g. [["Name", "Amount"], ["Chris", "500"]]',
        },
        append: { type: 'boolean', description: 'If true, append rows after existing data. If false, overwrite the range.' },
      },
      required: ['spreadsheetId', 'range', 'values'],
    },
  },
  {
    name: 'trigger_zapier',
    description: 'Trigger a Zapier webhook to automate a workflow.',
    input_schema: {
      type: 'object',
      properties: {
        zapUrl: { type: 'string', description: 'The Zapier catch-hook webhook URL' },
        payload: { type: 'object', description: 'Data to send to the Zap' },
      },
      required: ['zapUrl', 'payload'],
    },
  },
  // ── Internet Access ───────────────────────────────────────────
  {
    name: 'web_search',
    description: 'Search the internet for current information — news, prices, research, people, companies, anything. Use this instead of saying you don\'t know something that could be looked up.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The search query' },
        maxResults: { type: 'number', description: 'Number of results to return (default 5)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'read_webpage',
    description: 'Read the full text content of any webpage or URL. Use after web_search to get full details from a result.',
    input_schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'The full URL to read' },
      },
      required: ['url'],
    },
  },
  // ── Persistent Memory ─────────────────────────────────────────
  {
    name: 'remember_fact',
    description: 'Store an important fact to remember across all future conversations. Use proactively when Boss shares goals, numbers, decisions, preferences, or anything worth knowing later.',
    input_schema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Short unique identifier for this memory (e.g. "revenue_goal", "wifes_due_date", "gym_name")' },
        value: { type: 'string', description: 'The full value to remember' },
        category: { type: 'string', enum: ['personal', 'business', 'goals', 'context', 'general'], description: 'Category for organization (default: general)' },
      },
      required: ['key', 'value'],
    },
  },
  {
    name: 'recall_facts',
    description: 'Retrieve stored memories from past conversations. Call this at the start of any new conversation to load context about Boss.',
    input_schema: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['personal', 'business', 'goals', 'context', 'general'], description: 'Optional filter by category. Omit to get all memories.' },
      },
    },
  },
  {
    name: 'forget_fact',
    description: 'Delete a stored memory that is no longer accurate or relevant.',
    input_schema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'The memory key to delete' },
      },
      required: ['key'],
    },
  },
  // ── Task Actions ──────────────────────────────────────────────
  {
    name: 'complete_task',
    description: 'Mark an Odin task as done by fuzzy title match.',
    input_schema: {
      type: 'object',
      properties: {
        titleSearch: { type: 'string', description: 'Part of the task title to match (case-insensitive)' },
      },
      required: ['titleSearch'],
    },
  },
  {
    name: 'update_task',
    description: 'Update the status or priority of an Odin task.',
    input_schema: {
      type: 'object',
      properties: {
        titleSearch: { type: 'string', description: 'Part of the task title to match' },
        status: { type: 'string', enum: ['planned', 'in-progress', 'done'], description: 'New status' },
        priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'New priority' },
      },
      required: ['titleSearch'],
    },
  },
  // ── Calendar Actions ──────────────────────────────────────────
  {
    name: 'update_calendar_event',
    description: 'Update an existing Google Calendar event by eventId.',
    input_schema: {
      type: 'object',
      properties: {
        eventId: { type: 'string', description: 'The Google Calendar event ID' },
        title: { type: 'string', description: 'New event title' },
        startISO: { type: 'string', description: 'New start time in ISO 8601 format' },
        endISO: { type: 'string', description: 'New end time in ISO 8601 format' },
        description: { type: 'string', description: 'New description' },
        location: { type: 'string', description: 'New location' },
      },
      required: ['eventId'],
    },
  },
  {
    name: 'delete_calendar_event',
    description: 'Delete a Google Calendar event by eventId.',
    input_schema: {
      type: 'object',
      properties: {
        eventId: { type: 'string', description: 'The Google Calendar event ID to delete' },
      },
      required: ['eventId'],
    },
  },
  // ── Email Inbox ───────────────────────────────────────────────
  {
    name: 'get_email_inbox',
    description: 'Read recent unread emails from Gmail inbox.',
    input_schema: {
      type: 'object',
      properties: {
        maxResults: { type: 'number', description: 'Number of emails to return (default 10)' },
      },
    },
  },
  // ── Knowledge Base ────────────────────────────────────────────
  {
    name: 'get_knowledge_doc',
    description: 'Retrieve a House of Power knowledge document. Use when you need full sales scripts, texting templates, service details, brand guidelines, or pipeline stage definitions. Specify doc_id for the full document, or add section to get a specific section only.',
    input_schema: {
      type: 'object',
      properties: {
        doc_id: {
          type: 'string',
          enum: [
            '01-mission-brand',
            '02-products-services',
            '03-business-models',
            '04-sales-scripts',
            '05-texting-rules',
          ],
          description: 'Which knowledge document to retrieve',
        },
        section: {
          type: 'string',
          description: 'Optional: partial name of a specific section (e.g. "price objection", "first message", "TCPA", "tour booking"). Omit to get the full document.',
        },
      },
      required: ['doc_id'],
    },
  },
  {
    name: 'search_knowledge',
    description: 'Search across all House of Power knowledge documents for relevant sections. Use when you are not sure which document contains what you need, or when searching for a specific topic like an objection type, a scenario, a rule, or a script.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'What to search for. Examples: "price objection", "follow-up cadence", "what to say after tour", "TCPA Sunday rule", "cold lead re-engagement"',
        },
      },
      required: ['query'],
    },
  },
] as const

// ── Tool executor ─────────────────────────────────────────────

export async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case 'get_ghl_contacts': {
        const loc = process.env.GHL_LOCATION_ID
        const limit = (input.limit as number) ?? 10
        const query = input.query ? `&query=${encodeURIComponent(input.query as string)}` : ''
        const data = await ghlGet(`/contacts/?locationId=${loc}&limit=${limit}&sortBy=dateAdded&sortOrder=desc${query}`)
        const contacts = (data.contacts ?? []).map((c: Record<string, string>) =>
          `${c.firstName ?? ''} ${c.lastName ?? ''} | ${c.email ?? ''} | ${c.phone ?? ''} | Added: ${c.dateAdded ?? ''}`
        )
        return contacts.length ? contacts.join('\n') : 'No contacts found.'
      }

      case 'send_ghl_message': {
        const { contactId, type, message } = input as { contactId: string; type: string; message: string }
        await ghlPost('/conversations/messages', {
          type: type === 'SMS' ? 'SMS' : 'Email',
          contactId,
          message,
        })
        return `Message sent via ${type} to contact ${contactId}.`
      }

      case 'get_ghl_opportunities': {
        const loc = process.env.GHL_LOCATION_ID
        const limit = (input.limit as number) ?? 10
        const statusFilter = input.status ? `&status=${input.status}` : ''
        const data = await ghlGet(`/opportunities/search?location_id=${loc}&limit=${limit}${statusFilter}`)
        const opps = (data.opportunities ?? []).map((o: Record<string, string>) =>
          `${o.name ?? 'Unknown'} | Stage: ${o.pipelineStageId ?? '?'} | $${o.monetaryValue ?? 0} | ${o.status ?? ''}`
        )
        return opps.length ? opps.join('\n') : 'No opportunities found.'
      }

      case 'create_odin_task': {
        const supabase = createServerSupabaseClient()
        const { data: profile } = await supabase.from('profiles').select('id').limit(1).single()
        if (!profile) return 'Error: no user profile found.'

        const { data: row } = await supabase.from('odin_tasks').insert({
          user_id: profile.id,
          title: input.title as string,
          description: (input.description as string) ?? null,
          category: input.category as string,
          status: 'planned',
          priority: input.priority as string,
          source: 'odin_agent',
        }).select().single()

        return `Task created: "${input.title}" (ID: ${row?.id ?? 'unknown'})`
      }

      case 'get_odin_tasks': {
        const supabase = createServerSupabaseClient()
        const statusFilter = (input.status as string) ?? 'active'
        let query = supabase.from('odin_tasks').select('title, status, priority, category')

        if (statusFilter === 'all') {
          // no filter
        } else if (statusFilter === 'done') {
          query = query.eq('status', 'done')
        } else {
          query = query.in('status', ['planned', 'in-progress'])
        }

        const { data } = await query.order('priority').limit(15)
        if (!data?.length) return 'No tasks found.'
        return data.map((t) => `[${t.status}] ${t.priority}: ${t.title} (${t.category})`).join('\n')
      }

      case 'get_gymmaster_expiring': {
        const days = (input.days as number) ?? 14
        const members = await getMembershipsExpiringSoon(days)
        if (!members.length) return `No memberships expiring in ${days} days.`
        return members.map((m) =>
          `${m.firstName} ${m.lastName} | ${m.email} | Expires: ${m.expiryDate} | ${m.membershipType}`
        ).join('\n')
      }

      case 'get_google_calendar': {
        const days = (input.days as number) ?? 7
        const todayOnly = input.todayOnly as boolean
        const events = todayOnly ? await getTodayEvents() : await getUpcomingEvents(days)
        if (!events.length) return 'No events found.'
        return events.map((e) => `${e.start} — ${e.summary}${e.location ? ` @ ${e.location}` : ''}`).join('\n')
      }

      case 'add_obsidian_note': {
        const content = input.content as string
        const path = (input.path as string) ?? getTodayNotePath()
        await appendNote(path, `\n${content}`)
        return `Appended to ${path}`
      }

      case 'create_calendar_event': {
        const { title, startISO, endISO, description: desc, location } = input as {
          title: string; startISO: string; endISO: string; description?: string; location?: string
        }
        await createEvent(title, new Date(startISO), new Date(endISO), desc, location)
        return `Calendar event created: "${title}" from ${startISO} to ${endISO}`
      }

      case 'send_email': {
        const { to, subject, body } = input as { to: string; subject: string; body: string }
        const messageId = await sendEmail(to, subject, body)
        return `Email sent to ${to} (subject: "${subject}", id: ${messageId})`
      }

      case 'create_google_task': {
        const { title, notes, dueISO } = input as { title: string; notes?: string; dueISO?: string }
        const lists = await getTaskLists()
        const listId = lists[0]?.id
        if (!listId) return 'No Google Task lists found. Connect Google Tasks first.'
        const task = await createTask(listId, title, notes, dueISO ? new Date(dueISO) : undefined)
        return `Google Task created: "${task.title}" (list: ${lists[0].title})`
      }

      case 'get_goals': {
        const supabase = createServerSupabaseClient()
        const statusFilter = (input.status as string) ?? 'active'
        let query = supabase.from('goals').select('id, title, status, progress, category, due_date')
        if (statusFilter !== 'all') query = query.eq('status', statusFilter)
        const { data } = await query.order('progress').limit(20)
        if (!data?.length) return `No ${statusFilter} goals found.`
        return data.map((g) => `[${g.progress ?? 0}%] ${g.title} (${g.status})${g.due_date ? ` — due ${g.due_date}` : ''}`).join('\n')
      }

      case 'update_goal': {
        const supabase = createServerSupabaseClient()
        const { id, progress, status } = input as { id: string; progress?: number; status?: string }
        const updates: Record<string, unknown> = {}
        if (progress !== undefined) updates.progress = progress
        if (status) updates.status = status
        await supabase.from('goals').update(updates).eq('id', id)
        return `Goal ${id} updated: ${JSON.stringify(updates)}`
      }

      case 'get_checkins': {
        const supabase = createServerSupabaseClient()
        const limit = (input.limit as number) ?? 7
        const { data } = await supabase
          .from('check_ins')
          .select('date, mood, wins, struggles, tomorrow')
          .order('date', { ascending: false })
          .limit(limit)
        if (!data?.length) return 'No check-ins found.'
        return data.map((c) =>
          `${c.date} [${c.mood}] Wins: ${c.wins}${c.struggles ? ` | Struggles: ${c.struggles}` : ''}`
        ).join('\n')
      }

      case 'get_gymmaster_kpis': {
        const { fieldIds, startDate, endDate } = input as { fieldIds?: string[]; startDate?: string; endDate?: string }
        const today = new Date().toISOString().split('T')[0]
        const firstOfMonth = new Date(new Date().setDate(1)).toISOString().split('T')[0]

        if (!fieldIds?.length) {
          const fields = await listKpiFields()
          if (!fields.length) return 'No KPI fields found.'
          return 'Available KPI fields:\n' + fields.map((f) => `${f.id}: ${f.name} (${f.category})`).join('\n')
        }

        const results = await getKpiByFields(fieldIds, startDate ?? firstOfMonth, endDate ?? today)
        if (!results.length) return 'No KPI data returned for those fields.'
        return results.map((r) => `${r.field}: ${r.value}${r.date ? ` (${r.date})` : ''}`).join('\n')
      }

      case 'get_gymmaster_report': {
        const { reportId, startDate, endDate } = input as { reportId?: string; startDate?: string; endDate?: string }
        const today = new Date().toISOString().split('T')[0]
        const firstOfMonth = new Date(new Date().setDate(1)).toISOString().split('T')[0]

        if (!reportId) {
          const reports = await listReports()
          if (!reports.length) return 'No reports found.'
          return 'Available reports:\n' + reports.map((r) => `${r.id}: ${r.name} (${r.category})`).join('\n')
        }

        const rows = await runReport(reportId, startDate ?? firstOfMonth, endDate ?? today)
        if (!rows.length) return 'Report returned no data.'
        const headers = Object.keys(rows[0]).join('\t')
        const data = rows.slice(0, 20).map((r) => Object.values(r).join('\t')).join('\n')
        return `${headers}\n${data}`
      }

      case 'list_google_sheets': {
        const sheets = await listSpreadsheets(input.query as string | undefined)
        if (!sheets.length) return 'No spreadsheets found.'
        return sheets.map((s) => `${s.name} | ID: ${s.id}`).join('\n')
      }

      case 'read_sheet': {
        const { spreadsheetId, range } = input as { spreadsheetId: string; range: string }
        const rows = await getSheetValues(spreadsheetId, range)
        if (!rows.length) return 'No data found in that range.'
        return rows.map((row) => row.join('\t')).join('\n')
      }

      case 'write_sheet': {
        const { spreadsheetId, range, values, append } = input as {
          spreadsheetId: string; range: string; values: string[][]; append?: boolean
        }
        if (append) {
          const rowsAdded = await appendSheetValues(spreadsheetId, range, values)
          return `Appended ${rowsAdded} row(s) to ${range}.`
        } else {
          const cellsUpdated = await updateSheetValues(spreadsheetId, range, values)
          return `Updated ${cellsUpdated} cell(s) in ${range}.`
        }
      }

      case 'trigger_zapier': {
        const { zapUrl, payload: zapPayload } = input as { zapUrl: string; payload: Record<string, unknown> }
        return await triggerZap(zapUrl, zapPayload)
      }

      case 'web_search': {
        const { query, maxResults } = input as { query: string; maxResults?: number }
        const results = await tavilySearch(query, maxResults ?? 5)
        if (!results.length) return 'No results found.'
        return results.map((r, i) =>
          `[${i + 1}] ${r.title}${r.url ? ` (${r.url})` : ''}\n${r.content}`
        ).join('\n\n')
      }

      case 'read_webpage': {
        const { url } = input as { url: string }
        const content = await tavilyExtract(url)
        return content.slice(0, 4000) // cap at 4k chars to stay within token budget
      }

      case 'remember_fact': {
        const { key, value, category } = input as { key: string; value: string; category?: 'personal' | 'business' | 'goals' | 'context' | 'general' }
        await rememberFact(key, value, category ?? 'general')
        return `Remembered: "${key}" = "${value}"`
      }

      case 'recall_facts': {
        const { category } = input as { category?: 'personal' | 'business' | 'goals' | 'context' | 'general' }
        const facts = await recallFacts(category)
        if (!facts.length) return category ? `No memories in category "${category}".` : 'No memories stored yet.'
        return facts.map((f) => `[${f.category}] ${f.key}: ${f.value}`).join('\n')
      }

      case 'forget_fact': {
        const { key } = input as { key: string }
        await forgetFact(key)
        return `Forgotten: "${key}"`
      }

      case 'complete_task': {
        const supabase = createServerSupabaseClient()
        const { titleSearch } = input as { titleSearch: string }
        const { data } = await supabase
          .from('odin_tasks')
          .select('id, title')
          .in('status', ['planned', 'in-progress'])
        if (!data?.length) return 'No active tasks found.'
        const match = data.find((t) => t.title.toLowerCase().includes(titleSearch.toLowerCase()))
        if (!match) return `No task found matching "${titleSearch}".`
        await supabase.from('odin_tasks').update({ status: 'done', updated_at: new Date().toISOString() }).eq('id', match.id)
        return `Marked done: "${match.title}"`
      }

      case 'update_task': {
        const supabase = createServerSupabaseClient()
        const { titleSearch, status, priority } = input as { titleSearch: string; status?: string; priority?: string }
        const { data } = await supabase.from('odin_tasks').select('id, title').in('status', ['planned', 'in-progress'])
        if (!data?.length) return 'No active tasks found.'
        const match = data.find((t) => t.title.toLowerCase().includes(titleSearch.toLowerCase()))
        if (!match) return `No task found matching "${titleSearch}".`
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
        if (status) updates.status = status
        if (priority) updates.priority = priority
        await supabase.from('odin_tasks').update(updates).eq('id', match.id)
        return `Updated "${match.title}": ${JSON.stringify({ status, priority })}`
      }

      case 'update_calendar_event': {
        const { eventId, ...updates } = input as { eventId: string; title?: string; startISO?: string; endISO?: string; description?: string; location?: string }
        const event = await updateEvent(eventId, updates)
        return `Event updated: "${event.summary}" (${event.start})`
      }

      case 'delete_calendar_event': {
        const { eventId } = input as { eventId: string }
        await deleteEvent(eventId)
        return `Calendar event ${eventId} deleted.`
      }

      case 'get_email_inbox': {
        const maxResults = (input.maxResults as number) ?? 10
        const emails = await listUnreadEmails(maxResults)
        if (!emails.length) return 'No unread emails.'
        return emails.map((e) =>
          `From: ${e.from}\nSubject: ${e.subject}\nDate: ${e.date}\n${e.snippet}`
        ).join('\n\n---\n\n')
      }

      case 'get_knowledge_doc': {
        const { doc_id, section } = input as { doc_id: string; section?: string }
        return getKnowledgeDoc(doc_id, section)
      }

      case 'search_knowledge': {
        const { query } = input as { query: string }
        return searchKnowledge(query)
      }

      default:
        return `Unknown tool: ${name}`
    }
  } catch (err) {
    return `Tool error: ${err instanceof Error ? err.message : String(err)}`
  }
}
