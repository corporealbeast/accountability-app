import { google } from 'googleapis'
import { getAuthenticatedClient } from './google-auth'

export interface CalendarEvent {
  id: string
  summary: string
  start: string
  end: string
  description?: string
  location?: string
}

export async function getTodayEvents(): Promise<CalendarEvent[]> {
  const auth = await getAuthenticatedClient()
  const calendar = google.calendar({ version: 'v3', auth })

  const now = new Date()
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now);   endOfDay.setHours(23, 59, 59, 999)

  const { data } = await calendar.events.list({
    calendarId: 'primary',
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  })

  return (data.items ?? []).map((e) => ({
    id: e.id ?? '',
    summary: e.summary ?? '(No title)',
    start: e.start?.dateTime ?? e.start?.date ?? '',
    end: e.end?.dateTime ?? e.end?.date ?? '',
    description: e.description ?? undefined,
    location: e.location ?? undefined,
  }))
}

export async function getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
  const auth = await getAuthenticatedClient()
  const calendar = google.calendar({ version: 'v3', auth })

  const now = new Date()
  const future = new Date(now)
  future.setDate(future.getDate() + days)

  const { data } = await calendar.events.list({
    calendarId: 'primary',
    timeMin: now.toISOString(),
    timeMax: future.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 20,
  })

  return (data.items ?? []).map((e) => ({
    id: e.id ?? '',
    summary: e.summary ?? '(No title)',
    start: e.start?.dateTime ?? e.start?.date ?? '',
    end: e.end?.dateTime ?? e.end?.date ?? '',
    description: e.description ?? undefined,
    location: e.location ?? undefined,
  }))
}

export async function createEvent(
  title: string,
  start: Date,
  end: Date,
  description?: string,
  location?: string
): Promise<CalendarEvent> {
  const auth = await getAuthenticatedClient()
  const calendar = google.calendar({ version: 'v3', auth })

  const { data } = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: title,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
      description,
      location,
    },
  })

  return {
    id: data.id ?? '',
    summary: data.summary ?? '',
    start: data.start?.dateTime ?? '',
    end: data.end?.dateTime ?? '',
    description: data.description ?? undefined,
    location: data.location ?? undefined,
  }
}
