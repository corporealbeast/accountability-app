const GM_REPORT_BASE = 'https://houseofpower.gymmasteronline.com/api/v2/report'

function withKey(path: string) {
  const sep = path.includes('?') ? '&' : '?'
  return `${GM_REPORT_BASE}${path}${sep}api_key=${process.env.GYMMASTER_API_KEY}`
}

async function gmGet<T>(path: string): Promise<T> {
  const res = await fetch(withKey(path))
  if (!res.ok) throw new Error(`GymMaster reporting ${path}: ${res.status} ${res.statusText}`)
  return res.json()
}

async function gmPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(withKey(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`GymMaster reporting ${path}: ${res.status} ${res.statusText}`)
  return res.json()
}

export interface KpiField {
  id: string
  name: string
  category: string
}

export interface KpiResult {
  field: string
  value: number | string
  date?: string
}

export async function listKpiFields(): Promise<KpiField[]> {
  const data = await gmGet<{ fields: KpiField[] }>('/kpi/fields/list')
  return data.fields ?? []
}

export async function listKpiCategories(): Promise<{ id: string; name: string }[]> {
  const data = await gmGet<{ categories: { id: string; name: string }[] }>('/kpi/categories/list')
  return data.categories ?? []
}

export async function getKpiByFields(
  fieldIds: string[],
  startDate: string,
  endDate: string
): Promise<KpiResult[]> {
  const data = await gmPost<{ results: KpiResult[] }>('/kpi/fields', {
    fields: fieldIds,
    start_date: startDate,
    end_date: endDate,
  })
  return data.results ?? []
}

export async function getKpiByCategory(
  categoryIds: string[],
  startDate: string,
  endDate: string
): Promise<KpiResult[]> {
  const data = await gmPost<{ results: KpiResult[] }>('/kpi/categories', {
    categories: categoryIds,
    start_date: startDate,
    end_date: endDate,
  })
  return data.results ?? []
}

export async function listReports(): Promise<{ id: string; name: string; category: string }[]> {
  const data = await gmGet<{ reports: { id: string; name: string; category: string }[] }>('/standard_report/list')
  return data.reports ?? []
}

export async function runReport(
  reportId: string,
  startDate: string,
  endDate: string
): Promise<Record<string, unknown>[]> {
  const data = await gmPost<{ data: Record<string, unknown>[] }>('/standard_report', {
    report_id: reportId,
    start_date: startDate,
    end_date: endDate,
  })
  return data.data ?? []
}
