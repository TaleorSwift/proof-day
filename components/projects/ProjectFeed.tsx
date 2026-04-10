import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectsEmptyState } from '@/components/projects/ProjectsEmptyState'
import type { ProjectListItem } from '@/lib/api/projects'

// ProjectFeed es Server Component — no usa hooks propios.
// ProjectCard es 'use client' y puede renderizarse dentro de un Server Component.

export interface ProjectFeedProps {
  projects: ProjectListItem[]
  communitySlug: string
}

export function ProjectFeed({ projects, communitySlug }: ProjectFeedProps) {
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
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              Ideas en validación
            </h2>
            <p
              data-testid="live-section-subtitle"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                margin: 'var(--space-1) 0 0 0',
              }}
            >
              Proyectos que buscan feedback activo de la comunidad
            </p>
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
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
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
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
