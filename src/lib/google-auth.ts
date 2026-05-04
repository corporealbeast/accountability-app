import { google } from 'googleapis'
import { createServerSupabaseClient } from './supabase-server'

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
}

export function getAuthUrl() {
  const client = getOAuthClient()
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/tasks',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
    ],
  })
}

export async function storeTokens(userId: string, tokens: {
  access_token?: string | null
  refresh_token?: string | null
  expiry_date?: number | null
}) {
  const supabase = createServerSupabaseClient()
  await supabase.from('google_tokens').upsert({
    user_id: userId,
    access_token: tokens.access_token ?? '',
    refresh_token: tokens.refresh_token ?? null,
    expiry_date: tokens.expiry_date ?? null,
    updated_at: new Date().toISOString(),
  })
}

export async function getAuthenticatedClient() {
  const supabase = createServerSupabaseClient()
  // Single-user app: grab the first token row
  const { data } = await supabase
    .from('google_tokens')
    .select('*')
    .limit(1)
    .single()

  if (!data) throw new Error('Google not connected. Visit /api/auth/google to authorize.')

  const client = getOAuthClient()
  client.setCredentials({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: data.expiry_date,
  })

  // Auto-refresh if expired
  client.on('tokens', async (newTokens: { access_token?: string | null; expiry_date?: number | null }) => {
    await supabase.from('google_tokens').update({
      access_token: newTokens.access_token ?? data.access_token,
      expiry_date: newTokens.expiry_date ?? data.expiry_date,
      updated_at: new Date().toISOString(),
    }).eq('user_id', data.user_id)
  })

  return client
}
