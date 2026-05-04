import { NextResponse } from 'next/server'
import {
  getActiveMembers, getAllMembers, getMemberById,
  getMembershipsExpiringSoon, getMemberVisits,
} from '@/lib/gymmaster'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { sendTelegramMessage } from '@/lib/telegram-utils'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') ?? 'get_active'

  try {
    switch (action) {
      case 'get_active':
        return NextResponse.json({ members: await getActiveMembers() })

      case 'get_expiring': {
        const days = Number(searchParams.get('days') ?? '14')
        return NextResponse.json({ members: await getMembershipsExpiringSoon(days) })
      }

      case 'get_member': {
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
        return NextResponse.json({ member: await getMemberById(id) })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  const { action } = body

  try {
    switch (action) {
      case 'sync_members': {
        const members = await getAllMembers()
        const supabase = createServerSupabaseClient()
        let synced = 0

        for (const m of members) {
          await supabase.from('gymmaster_members').upsert({
            gymmaster_member_id: m.id,
            first_name: m.firstName,
            last_name: m.lastName,
            email: m.email,
            phone: m.phone,
            membership_type: m.membershipType,
            membership_status: m.membershipStatus,
            expiry_date: m.expiryDate || null,
            last_visit: m.lastVisit || null,
            synced_at: new Date().toISOString(),
          }, { onConflict: 'gymmaster_member_id' })
          synced++
        }

        return NextResponse.json({ ok: true, synced })
      }

      case 'check_in_stats': {
        const { memberId, days = 30 } = body
        if (!memberId) return NextResponse.json({ error: 'memberId required' }, { status: 400 })
        const since = new Date()
        since.setDate(since.getDate() - days)
        const visits = await getMemberVisits(memberId, since)
        return NextResponse.json({ visits: visits.length, days })
      }

      case 'send_followup': {
        const { memberId } = body
        if (!memberId) return NextResponse.json({ error: 'memberId required' }, { status: 400 })
        const supabase = createServerSupabaseClient()
        const { data: member } = await supabase
          .from('gymmaster_members')
          .select('first_name, last_name, expiry_date, membership_type')
          .eq('gymmaster_member_id', memberId)
          .single()
        if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })
        const name = `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim()
        const expiry = member.expiry_date ?? 'unknown'
        const chatId = process.env.TELEGRAM_ALLOWED_CHAT_ID
        if (chatId) {
          await sendTelegramMessage(chatId, `*Follow-up reminder*\n👤 ${name}\n💳 ${member.membership_type ?? 'Member'}\n📅 Expires: ${expiry}`)
        }
        return NextResponse.json({ ok: true })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
