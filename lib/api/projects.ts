import type { ProjectRow } from '@/lib/types/projects'
import type { CreateProjectInput, UpdateProjectInput } from '@/lib/validations/projects'

export async function createProject(data: CreateProjectInput): Promise<ProjectRow> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error((await res.json()).error)
  return (await res.json()).data
}

export async function updateProject(id: string, data: UpdateProjectInput): Promise<ProjectRow> {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error((await res.json()).error)
  return (await res.json()).data
}

export async function getProject(id: string): Promise<ProjectRow> {
  const res = await fetch(`/api/projects/${id}`)
  if (!res.ok) throw new Error((await res.json()).error)
  return (await res.json()).data
}
