// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks — declarados ANTES de los imports del componente bajo test
// ---------------------------------------------------------------------------

vi.mock('@/components/projects/ProjectCard', () => ({
  ProjectCard: ({ project }: { project: { id: string; title: string } }) => (
    <div data-testid="project-card">{project.title}</div>
  ),
}))

vi.mock('@/components/projects/ProjectsEmptyState', () => ({
  ProjectsEmptyState: () => <div data-testid="empty-state" />,
}))

// ---------------------------------------------------------------------------
// Import del componente bajo test
// ---------------------------------------------------------------------------

import { ProjectFeed } from '@/components/projects/ProjectFeed'
import type { ProjectListItem } from '@/lib/api/projects'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const liveProject: ProjectListItem = {
  id: 'proj-live-1',
  title: 'Proyecto Live Uno',
  imageUrls: [],
  status: 'live',
  builderId: 'user-1',
  createdAt: '2026-01-01T00:00:00Z',
}

const liveProject2: ProjectListItem = {
  id: 'proj-live-2',
  title: 'Proyecto Live Dos',
  imageUrls: [],
  status: 'live',
  builderId: 'user-2',
  createdAt: '2026-01-02T00:00:00Z',
}

const inactiveProject: ProjectListItem = {
  id: 'proj-inactive-1',
  title: 'Proyecto Cerrado',
  imageUrls: [],
  status: 'inactive',
  builderId: 'user-3',
  createdAt: '2026-01-03T00:00:00Z',
}

const draftProject: ProjectListItem = {
  id: 'proj-draft-1',
  title: 'Proyecto Borrador',
  imageUrls: [],
  status: 'draft',
  builderId: 'user-4',
  createdAt: '2026-01-04T00:00:00Z',
}

const COMMUNITY_SLUG = 'startup-madrid'

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('ProjectFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza heading "Ideas en validación" cuando hay proyectos live', () => {
    render(<ProjectFeed projects={[liveProject]} communitySlug={COMMUNITY_SLUG} />)
    expect(screen.getByRole('heading', { name: 'Ideas en validación' })).toBeInTheDocument()
  })

  it('renderiza heading "Cerrados" cuando hay proyectos inactive', () => {
    render(<ProjectFeed projects={[inactiveProject]} communitySlug={COMMUNITY_SLUG} />)
    expect(screen.getByRole('heading', { name: 'Cerrados' })).toBeInTheDocument()
  })

  it('no renderiza sección "En validación" cuando liveProjects es vacío', () => {
    render(<ProjectFeed projects={[inactiveProject]} communitySlug={COMMUNITY_SLUG} />)
    expect(screen.queryByRole('heading', { name: 'Ideas en validación' })).not.toBeInTheDocument()
  })

  it('no renderiza sección "Cerrados" cuando closedProjects es vacío', () => {
    render(<ProjectFeed projects={[liveProject]} communitySlug={COMMUNITY_SLUG} />)
    expect(screen.queryByRole('heading', { name: 'Cerrados' })).not.toBeInTheDocument()
  })

  it('renderiza ProjectsEmptyState cuando no hay ni live ni inactive', () => {
    render(<ProjectFeed projects={[]} communitySlug={COMMUNITY_SLUG} />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('no renderiza proyectos draft', () => {
    render(<ProjectFeed projects={[draftProject]} communitySlug={COMMUNITY_SLUG} />)
    // Draft solo → empty state, no ProjectCard con título del draft
    expect(screen.queryByText('Proyecto Borrador')).not.toBeInTheDocument()
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('proyectos live aparecen antes que los closed en el DOM', () => {
    render(
      <ProjectFeed
        projects={[inactiveProject, liveProject]}
        communitySlug={COMMUNITY_SLUG}
      />
    )
    const cards = screen.getAllByTestId('project-card')
    // Primera card debe ser la live
    expect(cards[0]).toHaveTextContent('Proyecto Live Uno')
    // Segunda card debe ser la inactive
    expect(cards[1]).toHaveTextContent('Proyecto Cerrado')
  })

  it('muestra subtítulo bajo el heading "Ideas en validación"', () => {
    render(<ProjectFeed projects={[liveProject]} communitySlug={COMMUNITY_SLUG} />)
    // El subtítulo debe estar presente en el DOM
    const subtitle = screen.getByTestId('live-section-subtitle')
    expect(subtitle).toBeInTheDocument()
    expect(subtitle.textContent?.length).toBeGreaterThan(0)
  })

  it('renderiza múltiples ProjectCard para múltiples proyectos live', () => {
    render(
      <ProjectFeed projects={[liveProject, liveProject2]} communitySlug={COMMUNITY_SLUG} />
    )
    const cards = screen.getAllByTestId('project-card')
    expect(cards).toHaveLength(2)
  })

  it('no renderiza ProjectsEmptyState cuando hay proyectos live', () => {
    render(<ProjectFeed projects={[liveProject]} communitySlug={COMMUNITY_SLUG} />)
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
  })

  it('no renderiza ProjectsEmptyState cuando hay proyectos inactive', () => {
    render(<ProjectFeed projects={[inactiveProject]} communitySlug={COMMUNITY_SLUG} />)
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
  })
})
