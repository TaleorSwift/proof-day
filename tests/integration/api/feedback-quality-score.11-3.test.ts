import { describe, it, expect, vi, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// T2 — TDD Outside-In: POST /api/feedback calcula y persiste quality_score
// Story 11.3, AC-2
// ---------------------------------------------------------------------------

const { supabaseMock, requireAuthMock, createFeedbackRepositoryMock } = vi.hoisted(() => {
  const supabaseMock = {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  }

  const requireAuthMock = vi.fn()

  const feedbackRepoInstance = {
    create: vi.fn(),
    findByProject: vi.fn(),
    findByProjectBasic: vi.fn(),
    checkDuplicate: vi.fn(),
    countByReviewerInCommunity: vi.fn(),
    findWeeklyByCommunity: vi.fn(),
  }

  const createFeedbackRepositoryMock = vi.fn().mockReturnValue(feedbackRepoInstance)

  return { supabaseMock, requireAuthMock, createFeedbackRepositoryMock }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(supabaseMock),
}))

vi.mock('@/lib/api/middleware/require-auth', () => ({
  requireAuth: requireAuthMock,
}))

vi.mock('@/lib/services/feedback.service', () => ({
  createFeedbackService: vi.fn().mockReturnValue({
    validateEligibility: vi.fn().mockResolvedValue({ eligible: true }),
  }),
}))

vi.mock('@/lib/repositories/feedback.repository', () => ({
  createFeedbackRepository: createFeedbackRepositoryMock,
}))

import { POST } from '@/app/api/feedback/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001' }

const VALID_BODY = {
  projectId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  communityId: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  scores: { p1: 3, p2: 2, p3: 1 },
  // 200 caracteres en p4 → quality_score = 1.0
  textResponses: { p4: 'a'.repeat(200) },
}

function buildPostRequest(body: unknown) {
  return new Request('http://localhost/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function mockAuthOk() {
  requireAuthMock.mockResolvedValue({ user: MOCK_USER, supabase: supabaseMock, error: null })
}


// ---------------------------------------------------------------------------
// T2.1 — body válido con 200 chars → quality_score calculado = 1.0
// ---------------------------------------------------------------------------

describe('POST /api/feedback (Story 11.3) — T2.1: quality_score se calcula y persiste', () => {
  afterEach(() => vi.clearAllMocks())

  it('repo.create recibe qualityScore calculado a partir de textResponses', async () => {
    mockAuthOk()

    const createSpy = vi.fn().mockResolvedValue({
      data: {
        id: 'fb-001',
        projectId: VALID_BODY.projectId,
        reviewerId: MOCK_USER.id,
        communityId: VALID_BODY.communityId,
        scores: VALID_BODY.scores,
        textResponses: VALID_BODY.textResponses,
        createdAt: '2026-01-01T00:00:00Z',
        customAnswer: null,
        qualityScore: 1.0,
      },
      error: null,
    })

    createFeedbackRepositoryMock.mockReturnValueOnce({
      create: createSpy,
      // Story 12.7 — countCompleteByProject requerido por la route tras el create
      countCompleteByProject: vi.fn().mockResolvedValue(0),
    })

    await POST(buildPostRequest(VALID_BODY))

    // AC-2: repo.create debe recibir qualityScore calculado
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        qualityScore: 1.0,
      })
    )
  })

  // T2.2 — quality_score es un número entre 0 y 1
  it('el qualityScore pasado al repo es un número en [0, 1]', async () => {
    mockAuthOk()

    let capturedQualityScore: number | undefined

    const createSpy = vi.fn().mockImplementation((data) => {
      capturedQualityScore = data.qualityScore
      return Promise.resolve({
        data: {
          id: 'fb-001',
          projectId: data.projectId,
          reviewerId: MOCK_USER.id,
          communityId: data.communityId,
          scores: data.scores,
          textResponses: data.textResponses,
          createdAt: '2026-01-01T00:00:00Z',
          customAnswer: null,
          qualityScore: data.qualityScore,
        },
        error: null,
      })
    })

    createFeedbackRepositoryMock.mockReturnValueOnce({
      create: createSpy,
      // Story 12.7 — countCompleteByProject requerido por la route tras el create
      countCompleteByProject: vi.fn().mockResolvedValue(0),
    })

    await POST(buildPostRequest(VALID_BODY))

    expect(capturedQualityScore).toBeTypeOf('number')
    expect(capturedQualityScore!).toBeGreaterThanOrEqual(0)
    expect(capturedQualityScore!).toBeLessThanOrEqual(1)
  })
})
