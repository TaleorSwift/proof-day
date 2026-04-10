import { ProjectCard, type ProjectCardProps } from '@/components/projects/ProjectCard'
import { ProjectsEmptyState } from '@/components/projects/ProjectsEmptyState'

interface ProjectGridProps {
  projects: ProjectCardProps['project'][]
  communitySlug: string
  isLoading?: boolean
  canCreate?: boolean
}

const SKELETON_COUNT = 6

export function ProjectGrid({
  projects,
  communitySlug,
  isLoading = false,
  canCreate = false,
}: ProjectGridProps) {
  if (!isLoading && projects.length === 0) {
    return (
      <ProjectsEmptyState
        communitySlug={communitySlug}
        canCreate={canCreate}
      />
    )
  }

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
    >
      {isLoading
        ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <ProjectCard
              key={i}
              project={{ id: '', title: '', imageUrls: [], status: 'draft', builderId: '' }}
              communitySlug={communitySlug}
              isLoading
            />
          ))
        : projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              communitySlug={communitySlug}
            />
          ))}
    </div>
  )
}
