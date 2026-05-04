import { NextResponse } from 'next/server'
import { getOAuthClient, storeTokens } from '@/lib/google-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/settings?error=google_auth_failed', req.url))
  }

  try {
    const client = getOAuthClient()
    const { tokens } = await client.getToken(code)

    // Get the logged-in user's ID from Supabase
    const supabase = createServerSupabaseClient()
    const { data: profile } = await supabase.from('profiles').select('id').limit(1).single()

    if (profile) {
      await storeTokens(profile.id, tokens)
    }

    return NextResponse.redirect(new URL('/?google=connected', req.url))
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    return NextResponse.redirect(new URL('/?error=google_auth_failed', req.url))
  }
}
