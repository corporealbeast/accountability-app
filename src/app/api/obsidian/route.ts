import { NextResponse } from 'next/server'
import { readNote, writeNote, appendNote, searchVault, getTodayNotePath } from '@/lib/obsidian'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') ?? 'read'
  const path = searchParams.get('path') ?? getTodayNotePath()

  try {
    switch (action) {
      case 'read': {
        const content = await readNote(path)
        return NextResponse.json({ content, path })
      }

      case 'search': {
        const query = searchParams.get('q') ?? ''
        if (!query) return NextResponse.json({ error: 'q required' }, { status: 400 })
        const results = await searchVault(query)
        return NextResponse.json({ results })
      }

      case 'today': {
        const todayPath = getTodayNotePath()
        try {
          const content = await readNote(todayPath)
          return NextResponse.json({ content, path: todayPath })
        } catch {
          return NextResponse.json({ content: '', path: todayPath })
        }
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
  const { action, path, content } = body

  if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 })

  const notePath = path ?? getTodayNotePath()

  try {
    switch (action) {
      case 'write':
        await writeNote(notePath, content)
        return NextResponse.json({ ok: true, path: notePath })

      case 'append':
        await appendNote(notePath, `\n${content}`)
        return NextResponse.json({ ok: true, path: notePath })

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
