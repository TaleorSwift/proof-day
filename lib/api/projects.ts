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

// ── Story 3.2: Image Gallery ─────────────────────────────────────────────────

/**
 * Upload a single image to a project.
 * Returns the public URL and the relative storage path.
 */
export async function uploadProjectImage(
  projectId: string,
  file: File
): Promise<{ url: string; path: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`/api/projects/${projectId}/images`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Error al subir la imagen')
  }
  return (await res.json()).data
}

/**
 * Delete an image from a project.
 * @param path — relative storage path: {userId}/{projectId}/{filename}
 */
export async function deleteProjectImage(
  projectId: string,
  path: string
): Promise<void> {
  const res = await fetch(`/api/projects/${projectId}/images`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Error al eliminar la imagen')
  }
}

/**
 * Persist a new image order for a project.
 * @param imagePaths — array of relative storage paths in the desired order
 */
export async function reorderProjectImages(
  projectId: string,
  imagePaths: string[]
): Promise<void> {
  const res = await fetch(`/api/projects/${projectId}/images/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imagePaths }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Error al reordenar las imágenes')
  }
}

// ── Story 3.4: Project List ───────────────────────────────────────────────────

export interface ProjectListItem {
  id: string
  title: string
  imageUrls: string[]
  status: 'draft' | 'live' | 'inactive'
  builderId: string
  createdAt: string
}

export async function getProjects(communityId: string): Promise<ProjectListItem[]> {
  const res = await fetch(`/api/projects?communityId=${communityId}`)
  if (!res.ok) throw new Error((await res.json()).error)
  const rows = (await res.json()).data as Array<{
    id: string
    title: string
    image_urls: string[]
    status: ProjectListItem['status']
    builder_id: string
    created_at: string
  }>
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    imageUrls: r.image_urls,
    status: r.status,
    builderId: r.builder_id,
    createdAt: r.created_at,
  }))
}
