export interface KnowledgeSection {
  heading: string
  content: string
}

export interface KnowledgeDoc {
  id: string
  title: string
  sections: KnowledgeSection[]
}

import { missionBrandDoc } from './01-mission-brand'
import { productsServicesDoc } from './02-products-services'
import { businessModelsDoc } from './03-business-models'
import { salesScriptsDoc } from './04-sales-scripts'
import { textingRulesDoc } from './05-texting-rules'

export const KNOWLEDGE_BASE: Record<string, KnowledgeDoc> = {
  '01-mission-brand': missionBrandDoc,
  '02-products-services': productsServicesDoc,
  '03-business-models': businessModelsDoc,
  '04-sales-scripts': salesScriptsDoc,
  '05-texting-rules': textingRulesDoc,
}

export function getKnowledgeDoc(id: string, section?: string): string {
  const doc = KNOWLEDGE_BASE[id]
  if (!doc) return `No knowledge document found with id "${id}".`

  if (section) {
    const match = doc.sections.find((s) =>
      s.heading.toLowerCase().includes(section.toLowerCase())
    )
    if (!match) return `Section matching "${section}" not found in "${doc.title}".`
    return `[${doc.title}] — ${match.heading}\n\n${match.content}`
  }

  const formatted = doc.sections
    .map((s) => `## ${s.heading}\n\n${s.content}`)
    .join('\n\n---\n\n')
  return `# ${doc.title}\n\n${formatted}`
}

export function searchKnowledge(query: string): string {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const results: { docTitle: string; heading: string; content: string; score: number }[] = []

  for (const doc of Object.values(KNOWLEDGE_BASE)) {
    for (const section of doc.sections) {
      const text = `${section.heading} ${section.content}`.toLowerCase()
      const score = terms.filter((t) => text.includes(t)).length
      if (score > 0) {
        results.push({ docTitle: doc.title, heading: section.heading, content: section.content, score })
      }
    }
  }

  if (!results.length) return `No knowledge found matching "${query}".`

  results.sort((a, b) => b.score - a.score)
  const top = results.slice(0, 5)

  return top
    .map((r) => `[${r.docTitle}] — ${r.heading}\n\n${r.content}`)
    .join('\n\n---\n\n')
}

export const knowledgeBase = [];

export default knowledgeBase;
