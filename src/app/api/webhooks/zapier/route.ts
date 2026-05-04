import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

type ZapierPayload = {
  event: string
  data: Record<string, unknown>
}

export async function POST(req: Request) {
  const secret = req.headers.get('x-zapier-secret')
  if (process.env.ZAPIER_WEBHOOK_SECRET && secret !== process.env.ZAPIER_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: ZapierPayload
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const { event, data } = payload

  if (event === 'create_task') {
    const { data: profile } = await supabase.from('profiles').select('id').limit(1).single()
    if (profile) {
      await supabase.from('odin_tasks').insert({
        user_id: profile.id,
        title: (data.title as string) ?? 'Task from Zapier',
        description: (data.description as string) ?? null,
        category: (data.category as string) ?? 'pipeline',
        status: 'planned',
        priority: (data.priority as string) ?? 'medium',
        source: 'zapier',
      })
    }
  } else if (event === 'create_notification') {
    const { data: profile } = await supabase.from('profiles').select('id').limit(1).single()
    if (profile) {
      await supabase.from('notifications').insert({
        user_id: profile.id,
        type: (data.type as string) ?? 'task_auto_created',
        title: (data.title as string) ?? 'Zapier notification',
        body: (data.body as string) ?? null,
        source: 'zapier',
      })
    }
  }

  return NextResponse.json({ ok: true })
}
