export async function triggerZap(zapUrl: string, payload: Record<string, unknown>): Promise<string> {
  try {
    const res = await fetch(zapUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return `Zapier error: ${res.status} ${res.statusText}`
    return `Zap triggered successfully at ${zapUrl}`
  } catch (err) {
    return `Zap failed: ${err instanceof Error ? err.message : String(err)}`
  }
}
