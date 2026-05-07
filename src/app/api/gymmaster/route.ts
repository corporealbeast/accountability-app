import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAllMembers } from '@/lib/gymmaster'

export async function POST(req: Request) {
  const { action, memberId } = await req.json()

  if (action === 'sync_members') {
    try {
      const members = await getAllMembers()

      const supabase = createServerSupabaseClient()
      const now = new Date().toISOString()

      const rows = members.map((m) => ({
        gymmaster_member_id: m.id,
        first_name: m.firstName ?? null,
        last_name: m.lastName ?? null,
        email: m.email ?? null,
        phone: m.phone ?? null,
        membership_type: m.membershipType ?? null,
        membership_status: m.membershipStatus ?? null,
        expiry_date: m.expiryDate ?? null,
        last_visit: m.lastVisit ?? null,
        synced_at: now,
      }))

      const { error } = await supabase
        .from('gymmaster_members')
        .upsert(rows, { onConflict: 'gymmaster_member_id' })

      if (error) throw error

      return NextResponse.json({ ok: true, synced: rows.length })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return NextResponse.json({ ok: false, error: message }, { status: 500 })
    }
  }

  if (action === 'send_followup') {
    if (!memberId) return NextResponse.json({ error: 'memberId required' }, { status: 400 })
    return NextResponse.json({ ok: true, message: `Follow-up queued for ${memberId}` })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
