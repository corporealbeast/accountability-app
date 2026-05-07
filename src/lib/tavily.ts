const TAVILY_BASE = 'https://api.tavily.com'

interface TavilyResult {
  title: string
  url: string
  content: string
}

export async function tavilySearch(query: string, maxResults: number = 5): Promise<TavilyResult[]> {
  const key = process.env.TAVILY_API_KEY
  if (!key) throw new Error('TAVILY_API_KEY not configured')

  const res = await fetch(`${TAVILY_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: key,
      query,
      search_depth: 'basic',
      max_results: maxResults,
      include_answer: true,
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Tavily search failed')

  const results: TavilyResult[] = []

  if (data.answer) {
    results.push({ title: 'Direct Answer', url: '', content: data.answer })
  }

  for (const r of data.results ?? []) {
    results.push({ title: r.title, url: r.url, content: r.content })
  }

  return results
}

export async function tavilyExtract(url: string): Promise<string> {
  const key = process.env.TAVILY_API_KEY
  if (!key) throw new Error('TAVILY_API_KEY not configured')

  const res = await fetch(`${TAVILY_BASE}/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: key, urls: [url] }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Tavily extract failed')

  const result = data.results?.[0]
  return result?.raw_content ?? result?.content ?? 'No content extracted.'
}
