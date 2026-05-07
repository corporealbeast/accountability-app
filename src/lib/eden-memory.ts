import { createServerSupabaseClient } from './supabase-server'

export type MemoryCategory = 'personal' | 'business' | 'goals' | 'context' | 'general'

export async function rememberFact(
  key: string,
  value: string,
  category: MemoryCategory = 'general'
): Promise<void> {
  const supabase = createServerSupabaseClient()
  await supabase.from('eden_memory').upsert(
    { key, value, category, updated_at: new Date().toISOString() },
    { onConflict: 'key' }
  )
}

export async function recallFacts(
  category?: MemoryCategory
): Promise<{ key: string; value: string; category: string }[]> {
  const supabase = createServerSupabaseClient()
  let query = supabase
    .from('eden_memory')
    .select('key, value, category')
    .order('updated_at', { ascending: false })

  if (category) query = query.eq('category', category)

  const { data } = await query
  return data ?? []
}

export async function forgetFact(key: string): Promise<void> {
  const supabase = createServerSupabaseClient()
  await supabase.from('eden_memory').delete().eq('key', key)
}
