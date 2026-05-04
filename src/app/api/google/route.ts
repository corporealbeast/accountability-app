import { NextResponse } from 'next/server'
import { getTodayEvents, getUpcomingEvents, createEvent } from '@/lib/google-calendar'
import { listUnreadEmails, sendEmail } from '@/lib/google-gmail'
import { getTaskLists, getTasks, createTask, completeTask } from '@/lib/google-tasks'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') ?? 'today_events'

  try {
    switch (action) {
      case 'today_events':
        return NextResponse.json({ events: await getTodayEvents() })

      case 'upcoming_events': {
        const days = Number(searchParams.get('days') ?? '7')
        return NextResponse.json({ events: await getUpcomingEvents(days) })
      }

      case 'list_emails': {
        const max = Number(searchParams.get('max') ?? '10')
        return NextResponse.json({ emails: await listUnreadEmails(max) })
      }

      case 'get_task_lists':
        return NextResponse.json({ lists: await getTaskLists() })

      case 'get_tasks': {
        const listId = searchParams.get('listId')
        if (!listId) return NextResponse.json({ error: 'listId required' }, { status: 400 })
        return NextResponse.json({ tasks: await getTasks(listId) })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('Google not connected')) {
      return NextResponse.json({ error: msg, authUrl: '/api/auth/google' }, { status: 401 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  const { action } = body

  try {
    switch (action) {
      case 'send_email': {
        const { to, subject, message } = body
        if (!to || !subject || !message)
          return NextResponse.json({ error: 'to, subject, message required' }, { status: 400 })
        const id = await sendEmail(to, subject, message)
        return NextResponse.json({ ok: true, id })
      }

      case 'create_event': {
        const { title, start, end, description, location } = body
        if (!title || !start || !end)
          return NextResponse.json({ error: 'title, start, end required' }, { status: 400 })
        const event = await createEvent(title, new Date(start), new Date(end), description, location)
        return NextResponse.json({ ok: true, event })
      }

      case 'create_task': {
        const { listId, title, notes, due } = body
        if (!listId || !title)
          return NextResponse.json({ error: 'listId, title required' }, { status: 400 })
        const task = await createTask(listId, title, notes, due ? new Date(due) : undefined)
        return NextResponse.json({ ok: true, task })
      }

      case 'complete_task': {
        const { listId, taskId } = body
        if (!listId || !taskId)
          return NextResponse.json({ error: 'listId, taskId required' }, { status: 400 })
        await completeTask(listId, taskId)
        return NextResponse.json({ ok: true })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
