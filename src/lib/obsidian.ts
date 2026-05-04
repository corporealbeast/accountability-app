const BASE_URL = process.env.OBSIDIAN_API_URL ?? 'http://localhost:27124'

function obsidianHeaders() {
  return {
    'Authorization': `Bearer ${process.env.OBSIDIAN_API_KEY ?? ''}`,
    'Content-Type': 'text/markdown',
  }
}

export async function readNote(path: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/vault/${encodeURIComponent(path)}`, {
    headers: obsidianHeaders(),
  })
  if (!res.ok) throw new Error(`Obsidian readNote ${path}: ${res.status}`)
  return res.text()
}

export async function writeNote(path: string, content: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/vault/${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: obsidianHeaders(),
    body: content,
  })
  if (!res.ok) throw new Error(`Obsidian writeNote ${path}: ${res.status}`)
}

export async function appendNote(path: string, content: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/vault/${encodeURIComponent(path)}`, {
    method: 'PATCH',
    headers: obsidianHeaders(),
    body: content,
  })
  if (!res.ok) throw new Error(`Obsidian appendNote ${path}: ${res.status}`)
}

export async function searchVault(query: string): Promise<{ filename: string; score: number }[]> {
  const res = await fetch(`${BASE_URL}/search/simple/?query=${encodeURIComponent(query)}`, {
    headers: { ...obsidianHeaders(), 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`Obsidian search: ${res.status}`)
  return res.json()
}

export function getTodayNotePath(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `Daily/${y}-${m}-${day}.md`
}
