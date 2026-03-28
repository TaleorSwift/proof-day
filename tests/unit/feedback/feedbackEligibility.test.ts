/**
 * Integration tests — FeedbackService.validateEligibility
 * Tests the 7 sequential business rules without hitting Supabase.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createFeedbackService } from '@/lib/services/feedback.service'

// ── Mocks ───────────────────────────────────────────────────────────────────

const mockFindById = vi.fn()
const mockCheckMembership = vi.fn()
const mockCheckDuplicate = vi.fn()

vi.mock('@/lib/repositories/projects.repository', () => ({
  createProjectsRepository: () => ({ findById: mockFindById }),
}))

vi.mock('@/lib/repositories/communities.repository', () => ({
  createCommunitiesRepository: () => ({ checkMembership: mockCheckMembership }),
}))

vi.mock('@/lib/repositories/feedback.repository', () => ({
  createFeedbackRepository: () => ({ checkDuplicate: mockCheckDuplicate }),
}))

// ── Fixtures ─────────────────────────────────────────────────────────────────

const COMMUNITY_ID = 'community-uuid-1'
const PROJECT_ID = 'project-uuid-1'
const BUILDER_ID = 'builder-uuid-1'
const REVIEWER_ID = 'reviewer-uuid-2'

const liveProject = {
  id: PROJECT_ID,
  community_id: COMMUNITY_ID,
  builder_id: BUILDER_ID,
  status: 'live',
  decision: null,
}

const params = { projectId: PROJECT_ID, communityId: COMMUNITY_ID, reviewerId: REVIEWER_ID }

// ── Setup ────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const service = createFeedbackService({} as any)

beforeEach(() => {
  vi.clearAllMocks()
  // Default: happy path
  mockFindById.mockResolvedValue({ data: liveProject, error: null })
  mockCheckMembership.mockResolvedValue({ data: { user_id: REVIEWER_ID }, error: null })
  mockCheckDuplicate.mockResolvedValue({ data: null, error: null })
})

// ── Tests ────────────────────────────────────────────────────────────────────

describe('FeedbackService.validateEligibility — happy path', () => {
  it('retorna eligible:true cuando todas las reglas pasan', async () => {
    const result = await service.validateEligibility(params)
    expect(result).toEqual({ eligible: true })
  })
})

describe('FeedbackService.validateEligibility — regla 1: proyecto existe', () => {
  it('retorna PROJECT_NOT_FOUND (404) si el proyecto no existe', async () => {
    mockFindById.mockResolvedValue({ data: null, error: null })
    const result = await service.validateEligibility(params)
    expect(result).toMatchObject({ eligible: false, code: 'PROJECT_NOT_FOUND', status: 404 })
  })
})

describe('FeedbackService.validateEligibility — regla 2: sin decisión tomada', () => {
  it('retorna FEEDBACK_LOCKED (409) si el builder ya decidió', async () => {
    mockFindById.mockResolvedValue({ data: { ...liveProject, decision: 'scale' }, error: null })
    const result = await service.validateEligibility(params)
    expect(result).toMatchObject({ eligible: false, code: 'FEEDBACK_LOCKED', status: 409 })
  })
})

describe('FeedbackService.validateEligibility — regla 3: proyecto live', () => {
  it('retorna PROJECT_NOT_LIVE (422) si el proyecto está en draft', async () => {
    mockFindById.mockResolvedValue({ data: { ...liveProject, status: 'draft' }, error: null })
    const result = await service.validateEligibility(params)
    expect(result).toMatchObject({ eligible: false, code: 'PROJECT_NOT_LIVE', status: 422 })
  })

  it('retorna PROJECT_NOT_LIVE (422) si el proyecto está inactive', async () => {
    mockFindById.mockResolvedValue({ data: { ...liveProject, status: 'inactive' }, error: null })
    const result = await service.validateEligibility(params)
    expect(result).toMatchObject({ eligible: false, code: 'PROJECT_NOT_LIVE', status: 422 })
  })
})

describe('FeedbackService.validateEligibility — regla 4: no feedback propio', () => {
  it('retorna FEEDBACK_SELF_NOT_ALLOWED (422) si el reviewer es el builder', async () => {
    const result = await service.validateEligibility({ ...params, reviewerId: BUILDER_ID })
    expect(result).toMatchObject({ eligible: false, code: 'FEEDBACK_SELF_NOT_ALLOWED', status: 422 })
  })
})

describe('FeedbackService.validateEligibility — regla 5: communityId coincide', () => {
  it('retorna COMMUNITY_MISMATCH (422) si communityId no corresponde al proyecto', async () => {
    const result = await service.validateEligibility({ ...params, communityId: 'other-community' })
    expect(result).toMatchObject({ eligible: false, code: 'COMMUNITY_MISMATCH', status: 422 })
  })
})

describe('FeedbackService.validateEligibility — regla 6: reviewer es miembro', () => {
  it('retorna COMMUNITY_ACCESS_DENIED (403) si no es miembro', async () => {
    mockCheckMembership.mockResolvedValue({ data: null, error: null })
    const result = await service.validateEligibility(params)
    expect(result).toMatchObject({ eligible: false, code: 'COMMUNITY_ACCESS_DENIED', status: 403 })
  })
})

describe('FeedbackService.validateEligibility — regla 7: sin feedback duplicado', () => {
  it('retorna FEEDBACK_ALREADY_SUBMITTED (409) si ya dio feedback', async () => {
    mockCheckDuplicate.mockResolvedValue({ data: { id: 'existing-feedback' }, error: null })
    const result = await service.validateEligibility(params)
    expect(result).toMatchObject({ eligible: false, code: 'FEEDBACK_ALREADY_SUBMITTED', status: 409 })
  })
})

describe('FeedbackService.validateEligibility — orden de evaluación', () => {
  it('corta en regla 1 sin llegar a checkMembership', async () => {
    mockFindById.mockResolvedValue({ data: null, error: null })
    await service.validateEligibility(params)
    expect(mockCheckMembership).not.toHaveBeenCalled()
  })

  it('corta en regla 3 sin llegar a checkMembership', async () => {
    mockFindById.mockResolvedValue({ data: { ...liveProject, status: 'draft' }, error: null })
    await service.validateEligibility(params)
    expect(mockCheckMembership).not.toHaveBeenCalled()
  })
})
