const GM_BASE = 'https://houseofpower.gymmasteronline.com/portal/api/v1'

function gmHeaders() {
  return {
    'Authorization': process.env.GYMMASTER_API_KEY!,
    'Content-Type': 'application/json',
  }
}

export interface GMMember {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  membershipType: string
  membershipStatus: 'active' | 'expired' | 'suspended'
  expiryDate: string // ISO date
  lastVisit: string  // ISO date
}

async function gmFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${GM_BASE}${path}`, { headers: gmHeaders() })
  if (!res.ok) throw new Error(`GymMaster ${path}: ${res.status} ${res.statusText}`)
  return res.json()
}

export async function getActiveMembers(): Promise<GMMember[]> {
  const data = await gmFetch<{ members: GMMember[] }>('/members?status=active')
  return data.members ?? []
}

export async function getAllMembers(): Promise<GMMember[]> {
  const data = await gmFetch<{ members: GMMember[] }>('/members')
  return data.members ?? []
}

export async function getMemberById(id: string): Promise<GMMember> {
  const data = await gmFetch<{ member: GMMember }>(`/members/${id}`)
  return data.member
}

export async function getMembershipsExpiringSoon(days: number = 14): Promise<GMMember[]> {
  const members = await getAllMembers()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + days)
  return members.filter((m) => {
    if (!m.expiryDate) return false
    const expiry = new Date(m.expiryDate)
    return expiry <= cutoff && expiry >= new Date()
  })
}

export async function getMemberVisits(id: string, since?: Date): Promise<{ date: string }[]> {
  const sinceParam = since ? `?since=${since.toISOString().split('T')[0]}` : ''
  const data = await gmFetch<{ visits: { date: string }[] }>(`/members/${id}/visits${sinceParam}`)
  return data.visits ?? []
}

export async function getMembershipTypes(): Promise<{ id: string; name: string }[]> {
  const data = await gmFetch<{ memberships: { id: string; name: string }[] }>('/memberships')
  return data.memberships ?? []
}
