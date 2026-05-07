const GM_BASE = 'https://houseofpower.gymmasteronline.com/portal/api/v1'

function withKey(path: string) {
  const sep = path.includes('?') ? '&' : '?'
  return `${GM_BASE}${path}${sep}api_key=${process.env.GYMMASTER_API_KEY}`
}

// Raw shape returned by GymMaster API v1
interface GMRawMember {
  id: number
  firstname: string
  surname: string
  email: string | null
  phonecell: string | null
  phonehome: string | null
  phonework: string | null
  status: string // "Active" | "Expired" | "Suspended" etc.
  joindate: string | null
  dob: string | null
  isprospect: boolean
  companyid: number
  company_name: string
}

export interface GMMember {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  membershipType: string | null
  membershipStatus: string
  expiryDate: string | null
  lastVisit: string | null
}

function mapMember(raw: GMRawMember): GMMember {
  return {
    id: String(raw.id),
    firstName: raw.firstname ?? '',
    lastName: raw.surname ?? '',
    email: raw.email ?? null,
    phone: raw.phonecell ?? raw.phonehome ?? raw.phonework ?? null,
    membershipType: null,
    membershipStatus: (raw.status ?? 'unknown').toLowerCase(),
    expiryDate: null,
    lastVisit: null,
  }
}

async function gmFetch<T>(path: string): Promise<T> {
  const res = await fetch(withKey(path))
  if (!res.ok) throw new Error(`GymMaster ${path}: ${res.status} ${res.statusText}`)
  return res.json()
}

export async function getAllMembers(): Promise<GMMember[]> {
  const data = await gmFetch<{ result: GMRawMember[] }>('/members')
  return (data.result ?? []).map(mapMember)
}

export async function getActiveMembers(): Promise<GMMember[]> {
  const all = await getAllMembers()
  return all.filter((m) => m.membershipStatus === 'active')
}

export async function getMemberById(id: string): Promise<GMMember | null> {
  const data = await gmFetch<{ result: GMRawMember[] }>(`/members/${id}`)
  const raw = data.result?.[0]
  return raw ? mapMember(raw) : null
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
  const data = await gmFetch<{ result: { date: string }[] }>(`/members/${id}/visits${sinceParam}`)
  return data.result ?? []
}
