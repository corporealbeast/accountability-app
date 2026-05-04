import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAllMembers } from '@/lib/gymmaster'
import { sendTelegramMessage } from '@/lib/telegram-utils'

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_HEADERS = () => ({
  Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
  Version: '2021-04-15',
  'Content-Type': 'application/json',
})

// Vercel cron: runs daily at 3:00 AM Pacific (10:00 UTC)
// 1. Syncs GymMaster members into Supabase
// 2. Matches members to GHL contacts by email
// 3. Creates GHL renewal opportunities for expiring members
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerSupabaseClient()
  const loc = process.env.GHL_LOCATION_ID
  const chatId = process.env.TELEGRAM_ALLOWED_CHAT_ID

  try {
    const members = await getAllMembers()
    const syncedAt = new Date().toISOString()
    let synced = 0
    let ghlLinked = 0
    let renewalOppsCreated = 0

    for (const member of members) {
      // 1. Upsert into gymmaster_members
      await supabase.from('gymmaster_members').upsert({
        gymmaster_member_id: member.id,
        first_name: member.firstName,
        last_name: member.lastName,
        email: member.email,
        phone: member.phone,
        membership_type: member.membershipType,
        membership_status: member.membershipStatus,
        expiry_date: member.expiryDate || null,
        last_visit: member.lastVisit || null,
        synced_at: syncedAt,
      }, { onConflict: 'gymmaster_member_id' })
      synced++

      // 2. Try to match to a GHL contact by email
      const { data: existingMember } = await supabase
        .from('gymmaster_members')
        .select('ghl_contact_id')
        .eq('gymmaster_member_id', member.id)
        .single()

      if (!existingMember?.ghl_contact_id && member.email) {
        try {
          const searchRes = await fetch(
            `${GHL_BASE}/contacts/?locationId=${loc}&email=${encodeURIComponent(member.email)}&limit=1`,
            { headers: GHL_HEADERS() }
          )
          const searchData = await searchRes.json()
          const ghlContact = searchData.contacts?.[0]

          if (ghlContact) {
            await supabase
              .from('gymmaster_members')
              .update({ ghl_contact_id: ghlContact.id })
              .eq('gymmaster_member_id', member.id)
            ghlLinked++
          } else if (member.email) {
            // Create GHL contact for this member
            const createRes = await fetch(`${GHL_BASE}/contacts/`, {
              method: 'POST',
              headers: GHL_HEADERS(),
              body: JSON.stringify({
                locationId: loc,
                firstName: member.firstName,
                lastName: member.lastName,
                email: member.email,
                phone: member.phone,
                tags: ['gymmaster-member', member.membershipType].filter(Boolean),
              }),
            })
            const created = await createRes.json()
            if (created.contact?.id) {
              await supabase
                .from('gymmaster_members')
                .update({ ghl_contact_id: created.contact.id })
                .eq('gymmaster_member_id', member.id)
              ghlLinked++
            }
          }
        } catch {}
      }

      // 3. Create GHL renewal opportunity for members expiring within 7 days
      if (member.expiryDate && member.membershipStatus === 'active') {
        const expiry = new Date(member.expiryDate)
        const daysUntilExpiry = Math.ceil((expiry.getTime() - Date.now()) / 86400000)

        if (daysUntilExpiry > 0 && daysUntilExpiry <= 7) {
          const name = [member.firstName, member.lastName].filter(Boolean).join(' ')

          // Check if a renewal opportunity already exists
          const searchRes = await fetch(
            `${GHL_BASE}/opportunities/search?location_id=${loc}&query=${encodeURIComponent(name + ' renewal')}&limit=5`,
            { headers: GHL_HEADERS() }
          )
          const searchData = await searchRes.json()
          const hasRenewal = (searchData.opportunities ?? []).some(
            (o: { name?: string }) => o.name?.toLowerCase().includes('renewal')
          )

          if (!hasRenewal) {
            // Get the ghl_contact_id
            const { data: gmMember } = await supabase
              .from('gymmaster_members')
              .select('ghl_contact_id')
              .eq('gymmaster_member_id', member.id)
              .single()

            if (gmMember?.ghl_contact_id) {
              await fetch(`${GHL_BASE}/opportunities/`, {
                method: 'POST',
                headers: GHL_HEADERS(),
                body: JSON.stringify({
                  locationId: loc,
                  name: `${name} — Membership Renewal`,
                  contactId: gmMember.ghl_contact_id,
                  status: 'open',
                  monetaryValue: 0,
                }),
              })
              renewalOppsCreated++
            }
          }
        }
      }
    }

    const summary = `GymMaster sync: ${synced} members, ${ghlLinked} GHL links, ${renewalOppsCreated} renewal opps created`

    if (renewalOppsCreated > 0 && chatId) {
      await sendTelegramMessage(
        chatId,
        `*GymMaster Sync Complete*\n\n${renewalOppsCreated} renewal opportunit${renewalOppsCreated === 1 ? 'y' : 'ies'} created in GHL pipeline.\n\nCheck GHL for members expiring this week.`
      )
    }

    return NextResponse.json({ ok: true, summary, synced, ghlLinked, renewalOppsCreated })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
