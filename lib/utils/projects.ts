import type { ProjectListItem } from '@/lib/api/projects'

export function filterProjectsByVisibility(
  projects: ProjectListItem[],
  currentUserId: string
): ProjectListItem[] {
  return projects.filter((p) => {
    if (p.status === 'draft') return p.builderId === currentUserId
    return true
  })
}

export function sortProjectsByCreatedAtDesc(projects: ProjectListItem[]): ProjectListItem[] {
  return [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}
