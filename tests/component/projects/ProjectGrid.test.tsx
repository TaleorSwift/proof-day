// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks — declarados ANTES de los imports del componente bajo test
// ---------------------------------------------------------------------------

vi.mock('@/components/projects/ProjectCard', () => ({
  ProjectCard: ({ project, isLoading }: { project: { id: string; title: string }; isLoading?: boolean }) => (
    <div data-testid="project-card" data-loading={isLoading ? 'true' : 'false'}>
      {project.title}
    </div>
  ),
}))

vi.mock('@/components/projects/ProjectsEmptyState', () => ({
  ProjectsEmptyState: ({ communitySlug, canCreate }: { communitySlug: string; canCreate?: boolean }) => (
    <div data-testid="empty-state" data-slug={communitySlug} data-can-create={String(canCreate ?? false)} />
  ),
}))

import { ProjectGrid } from '@/components/projects/ProjectGrid'

// ---------------------------------------------------------------------------
// Fixture de proyectos
// ---------------------------------------------------------------------------

const makeProject = (id: string) => ({
  id,
  slug: `proyecto-${id}`,
  title: `Proyecto ${id}`,
  imageUrls: [],
  status: 'draft' as const,
  builderId: `builder-${id}`,
})

// ---------------------------------------------------------------------------
// Suite: lista vacía sin carga
// ---------------------------------------------------------------------------

describe('ProjectGrid — lista vacía', () => {
  it('renderiza ProjectsEmptyState cuando no hay proyectos y no está cargando', () => {
    render(<ProjectGrid projects={[]} communitySlug="mi-slug" />)
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
  })

  it('pasa el communitySlug correcto a ProjectsEmptyState', () => {
    render(<ProjectGrid projects={[]} communitySlug="mi-slug" />)
    expect(screen.getByTestId('empty-state')).toHaveAttribute('data-slug', 'mi-slug')
  })

  it('pasa canCreate=false a ProjectsEmptyState por defecto', () => {
    render(<ProjectGrid projects={[]} communitySlug="mi-slug" />)
    expect(screen.getByTestId('empty-state')).toHaveAttribute('data-can-create', 'false')
  })

  it('pasa canCreate=true a ProjectsEmptyState cuando se indica', () => {
    render(<ProjectGrid projects={[]} communitySlug="mi-slug" canCreate />)
    expect(screen.getByTestId('empty-state')).toHaveAttribute('data-can-create', 'true')
  })
})

// ---------------------------------------------------------------------------
// Suite: lista con proyectos
// ---------------------------------------------------------------------------

describe('ProjectGrid — con proyectos', () => {
  it('renderiza una ProjectCard por cada proyecto', () => {
    const projects = [makeProject('1'), makeProject('2'), makeProject('3')]
    render(<ProjectGrid projects={projects} communitySlug="mi-slug" />)
    expect(screen.getAllByTestId('project-card')).toHaveLength(3)
  })

  it('muestra el título de cada proyecto', () => {
    const projects = [makeProject('1'), makeProject('2')]
    render(<ProjectGrid projects={projects} communitySlug="mi-slug" />)
    expect(screen.getByText('Proyecto 1')).toBeInTheDocument()
    expect(screen.getByText('Proyecto 2')).toBeInTheDocument()
  })

  it('no renderiza ProjectsEmptyState cuando hay proyectos', () => {
    const projects = [makeProject('1')]
    render(<ProjectGrid projects={projects} communitySlug="mi-slug" />)
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: estado de carga (isLoading=true)
// ---------------------------------------------------------------------------

describe('ProjectGrid — estado de carga', () => {
  it('renderiza 6 skeletons cuando isLoading es true', () => {
    render(<ProjectGrid projects={[]} communitySlug="mi-slug" isLoading />)
    expect(screen.getAllByTestId('project-card')).toHaveLength(6)
  })

  it('no renderiza ProjectsEmptyState mientras está cargando aunque projects esté vacío', () => {
    render(<ProjectGrid projects={[]} communitySlug="mi-slug" isLoading />)
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument()
  })

  it('todos los skeletons tienen data-loading="true"', () => {
    render(<ProjectGrid projects={[]} communitySlug="mi-slug" isLoading />)
    const cards = screen.getAllByTestId('project-card')
    cards.forEach((card) => {
      expect(card).toHaveAttribute('data-loading', 'true')
    })
  })
})
