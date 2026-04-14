import { describe, it, expect } from 'vitest'
import type { ProjectListItem } from '@/lib/api/projects'
import { filterProjectsByVisibility, sortProjectsByCreatedAtDesc } from '@/lib/utils/projects'

const BUILDER_ID = 'user-builder-1'
const OTHER_USER_ID = 'user-other-2'

const projects: ProjectListItem[] = [
  {
    id: 'proj-live',
    slug: 'proyecto-live',
    title: 'Proyecto Live',
    imageUrls: [],
    status: 'live',
    builderId: OTHER_USER_ID,
    createdAt: '2026-03-28T10:00:00Z',
  },
  {
    id: 'proj-inactive',
    slug: 'proyecto-inactivo',
    title: 'Proyecto Inactivo',
    imageUrls: [],
    status: 'inactive',
    builderId: OTHER_USER_ID,
    createdAt: '2026-03-27T10:00:00Z',
  },
  {
    id: 'proj-draft-own',
    slug: 'mi-borrador',
    title: 'Mi Borrador',
    imageUrls: [],
    status: 'draft',
    builderId: BUILDER_ID,
    createdAt: '2026-03-26T10:00:00Z',
  },
  {
    id: 'proj-draft-other',
    slug: 'borrador-de-otro',
    title: 'Borrador de otro',
    imageUrls: [],
    status: 'draft',
    builderId: OTHER_USER_ID,
    createdAt: '2026-03-25T10:00:00Z',
  },
]

describe('projectList — visibilidad', () => {
  it('un usuario NO ve los proyectos draft de otros builders', () => {
    const visible = filterProjectsByVisibility(projects, BUILDER_ID)
    expect(visible.find((p) => p.id === 'proj-draft-other')).toBeUndefined()
  })

  it('el builder SÍ ve sus propios proyectos draft', () => {
    const visible = filterProjectsByVisibility(projects, BUILDER_ID)
    const ownDraft = visible.find((p) => p.id === 'proj-draft-own')
    expect(ownDraft).toBeDefined()
    expect(ownDraft?.status).toBe('draft')
    expect(ownDraft?.builderId).toBe(BUILDER_ID)
  })

  it('todos los miembros ven proyectos live e inactive', () => {
    const visibleAsBuilder = filterProjectsByVisibility(projects, BUILDER_ID)
    const visibleAsOther = filterProjectsByVisibility(projects, OTHER_USER_ID)

    expect(visibleAsBuilder.find((p) => p.id === 'proj-live')).toBeDefined()
    expect(visibleAsBuilder.find((p) => p.id === 'proj-inactive')).toBeDefined()
    expect(visibleAsOther.find((p) => p.id === 'proj-live')).toBeDefined()
    expect(visibleAsOther.find((p) => p.id === 'proj-inactive')).toBeDefined()
  })

  it('un usuario sin proyectos propios no ve ningún draft', () => {
    const thirdUser = 'user-third-3'
    const visible = filterProjectsByVisibility(projects, thirdUser)
    expect(visible.filter((p) => p.status === 'draft')).toHaveLength(0)
  })
})

describe('projectList — ordenación', () => {
  it('los proyectos se ordenan por createdAt descendente (más reciente primero)', () => {
    const sorted = sortProjectsByCreatedAtDesc(projects)
    expect(sorted[0].createdAt > sorted[1].createdAt).toBe(true)
    expect(sorted[1].createdAt > sorted[2].createdAt).toBe(true)
    expect(sorted[2].createdAt > sorted[3].createdAt).toBe(true)
  })

  it('el proyecto más reciente (live) aparece en primera posición', () => {
    const sorted = sortProjectsByCreatedAtDesc(projects)
    expect(sorted[0].id).toBe('proj-live')
  })
})
