/**
 * Integration tests — ProjectsService (validateOwnership + validateMembership)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createProjectsService } from '@/lib/services/projects.service'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockFindById = vi.fn()
const mockCheckMembership = vi.fn()

vi.mock('@/lib/repositories/projects.repository', () => ({
  createProjectsRepository: () => ({ findById: mockFindById }),
}))

vi.mock('@/lib/repositories/communities.repository', () => ({
  createCommunitiesRepository: () => ({ checkMembership: mockCheckMembership }),
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const PROJECT_ID = 'project-uuid-1'
const COMMUNITY_ID = 'community-uuid-1'
const BUILDER_ID = 'builder-uuid-1'
const OTHER_USER_ID = 'other-uuid-2'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const service = createProjectsService({} as any)

beforeEach(() => vi.clearAllMocks())

// ── validateOwnership ─────────────────────────────────────────────────────────

describe('ProjectsService.validateOwnership', () => {
  it('retorna ok:true si el usuario es el builder', async () => {
    mockFindById.mockResolvedValue({ data: { id: PROJECT_ID, builder_id: BUILDER_ID } })
    expect(await service.validateOwnership(PROJECT_ID, BUILDER_ID)).toEqual({ ok: true })
  })

  it('retorna PROJECT_NOT_FOUND (404) si el proyecto no existe', async () => {
    mockFindById.mockResolvedValue({ data: null })
    const result = await service.validateOwnership(PROJECT_ID, BUILDER_ID)
    expect(result).toMatchObject({ ok: false, code: 'PROJECT_NOT_FOUND', status: 404 })
  })

  it('retorna FORBIDDEN (403) si el usuario no es el builder', async () => {
    mockFindById.mockResolvedValue({ data: { id: PROJECT_ID, builder_id: BUILDER_ID } })
    const result = await service.validateOwnership(PROJECT_ID, OTHER_USER_ID)
    expect(result).toMatchObject({ ok: false, code: 'FORBIDDEN', status: 403 })
  })
})

// ── validateMembership ────────────────────────────────────────────────────────

describe('ProjectsService.validateMembership', () => {
  it('retorna ok:true si el usuario es miembro', async () => {
    mockCheckMembership.mockResolvedValue({ data: { user_id: BUILDER_ID } })
    expect(await service.validateMembership(COMMUNITY_ID, BUILDER_ID)).toEqual({ ok: true })
  })

  it('retorna COMMUNITY_ACCESS_DENIED (403) si no es miembro', async () => {
    mockCheckMembership.mockResolvedValue({ data: null })
    const result = await service.validateMembership(COMMUNITY_ID, OTHER_USER_ID)
    expect(result).toMatchObject({ ok: false, code: 'COMMUNITY_ACCESS_DENIED', status: 403 })
  })
})
