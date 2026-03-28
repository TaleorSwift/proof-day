import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ProjectsEmptyStateProps {
  communitySlug: string
  canCreate?: boolean
}

export function ProjectsEmptyState({ communitySlug, canCreate = false }: ProjectsEmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-16) var(--space-8)',
        textAlign: 'center',
        gap: 'var(--space-4)',
      }}
    >
      <p
        style={{
          fontSize: 'var(--text-lg)',
          color: 'var(--color-text-secondary)',
          fontWeight: 'var(--font-medium)',
        }}
      >
        Esta comunidad no tiene proyectos aún
      </p>
      {canCreate && (
        <Link href={`/communities/${communitySlug}/projects/new`}>
          <Button variant="default">Crear el primero</Button>
        </Link>
      )}
    </div>
  )
}
