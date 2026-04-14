import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectsEmptyState } from '@/components/projects/ProjectsEmptyState'
import type { ProjectListItem } from '@/lib/api/projects'

// ProjectFeed es Server Component — no usa hooks propios.
// ProjectCard es 'use client' y puede renderizarse dentro de un Server Component.

export interface ProjectFeedProps {
  projects: ProjectListItem[]
  communitySlug: string
  currentUserId?: string
}

export function ProjectFeed({ projects, communitySlug, currentUserId }: ProjectFeedProps) {
  const liveProjects = projects.filter((p) => p.status === 'live')
  const closedProjects = projects.filter((p) => p.status === 'inactive')

  if (liveProjects.length === 0 && closedProjects.length === 0) {
    return <ProjectsEmptyState communitySlug={communitySlug} canCreate={false} />
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-8)',
      }}
    >
      {liveProjects.length > 0 && (
        <section aria-labelledby="live-section-heading">
          <div
            style={{
              marginBottom: 'var(--space-4)',
            }}
          >
            <h2
              id="live-section-heading"
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: 0,
              }}
            >
              🔴 Live — aceptando feedback
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            {liveProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                communitySlug={communitySlug}
                isOwner={currentUserId === project.builderId}
              />
            ))}
          </div>
        </section>
      )}

      {closedProjects.length > 0 && (
        <section aria-labelledby="closed-section-heading">
          <div
            style={{
              marginBottom: 'var(--space-4)',
            }}
          >
            <h2
              id="closed-section-heading"
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: 0,
              }}
            >
              Cerrados
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            {closedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                communitySlug={communitySlug}
                isOwner={currentUserId === project.builderId}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
