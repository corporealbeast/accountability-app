import { google } from 'googleapis'
import { getAuthenticatedClient } from './google-auth'

export interface EmailMessage {
  id: string
  subject: string
  from: string
  date: string
  snippet: string
  body?: string
}

export async function listUnreadEmails(maxResults: number = 10): Promise<EmailMessage[]> {
  const auth = await getAuthenticatedClient()
  const gmail = google.gmail({ version: 'v1', auth })

  const { data } = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread',
    maxResults,
  })

  const messages = data.messages ?? []

  const full = await Promise.all(
    messages.map(async (m: { id?: string | null }) => {
      const { data: msg } = await gmail.users.messages.get({ userId: 'me', id: m.id! })
      const headers = msg.payload?.headers ?? []
      const get = (name: string) => headers.find((h: { name?: string | null; value?: string | null }) => h.name === name)?.value ?? ''
      return {
        id: m.id!,
        subject: get('Subject'),
        from: get('From'),
        date: get('Date'),
        snippet: msg.snippet ?? '',
      }
    })
  )

  return full
}

function makeEmailBody(to: string, subject: string, body: string): string {
  const raw = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    body,
  ].join('\n')
  return Buffer.from(raw).toString('base64url')
}

export async function sendEmail(to: string, subject: string, body: string): Promise<string> {
  const auth = await getAuthenticatedClient()
  const gmail = google.gmail({ version: 'v1', auth })

  const { data } = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: makeEmailBody(to, subject, body) },
  })

  return data.id ?? ''
}
