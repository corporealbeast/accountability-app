import { google } from 'googleapis'
import { getAuthenticatedClient } from './google-auth'

export interface TaskList {
  id: string
  title: string
}

export interface GoogleTask {
  id: string
  title: string
  notes?: string
  due?: string
  status: 'needsAction' | 'completed'
  listId: string
}

export async function getTaskLists(): Promise<TaskList[]> {
  const auth = await getAuthenticatedClient()
  const tasks = google.tasks({ version: 'v1', auth })

  const { data } = await tasks.tasklists.list({ maxResults: 20 })
  return (data.items ?? []).map((l: { id?: string | null; title?: string | null }) => ({ id: l.id!, title: l.title! }))
}

export async function getTasks(listId: string): Promise<GoogleTask[]> {
  const auth = await getAuthenticatedClient()
  const tasks = google.tasks({ version: 'v1', auth })

  const { data } = await tasks.tasks.list({
    tasklist: listId,
    showCompleted: false,
    maxResults: 50,
  })

  return (data.items ?? []).map((t: { id?: string | null; title?: string | null; notes?: string | null; due?: string | null; status?: string | null }) => ({
    id: t.id!,
    title: t.title!,
    notes: t.notes ?? undefined,
    due: t.due ?? undefined,
    status: (t.status as 'needsAction' | 'completed') ?? 'needsAction',
    listId,
  }))
}

export async function createTask(
  listId: string,
  title: string,
  notes?: string,
  due?: Date
): Promise<GoogleTask> {
  const auth = await getAuthenticatedClient()
  const tasks = google.tasks({ version: 'v1', auth })

  const { data } = await tasks.tasks.insert({
    tasklist: listId,
    requestBody: {
      title,
      notes,
      due: due?.toISOString(),
    },
  })

  return {
    id: data.id!,
    title: data.title!,
    notes: data.notes ?? undefined,
    due: data.due ?? undefined,
    status: 'needsAction',
    listId,
  }
}

export async function completeTask(listId: string, taskId: string): Promise<void> {
  const auth = await getAuthenticatedClient()
  const tasks = google.tasks({ version: 'v1', auth })

  await tasks.tasks.patch({
    tasklist: listId,
    task: taskId,
    requestBody: { status: 'completed' },
  })
}
