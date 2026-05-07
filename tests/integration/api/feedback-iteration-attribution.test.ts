import { describe, it, expect, vi, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Story 13.4 — Atribución de feedback en iteración
// Tests de integración: POST /api/feedback atribuye iteration_id correctamente
// ---------------------------------------------------------------------------

const {
  supabaseMock,
  requireAuthMock,
  createFeedbackRepositoryMock,
  createProjectIterationsRepositoryMock,
} = vi.hoisted(() => {
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
    countByReviewerInCommunityRecent: vi.fn(),
    findWeeklyByCommunity: vi.fn(),
    countCompleteByProject: vi.fn().mockResolvedValue(0),
  }

  const createFeedbackRepositoryMock = vi.fn().mockReturnValue(feedbackRepoInstance)

  const iterationsRepoInstance = {
    getLatestIteration: vi.fn(),
    getLatestVersionNumber: vi.fn(),
    create: vi.fn(),
  }

  const createProjectIterationsRepositoryMock = vi.fn().mockReturnValue(iterationsRepoInstance)

  return {
    supabaseMock,
    requireAuthMock,
    createFeedbackRepositoryMock,
    createProjectIterationsRepositoryMock,
  }
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

vi.mock('@/lib/repositories/project-iterations.repository', () => ({
  createProjectIterationsRepository: createProjectIterationsRepositoryMock,
}))

// Story 12.7 — mock fire-and-forget
vi.mock('@/lib/ai/triggerSynthesisWebhook', () => ({
  triggerSynthesisWebhook: vi.fn(),
}))

import { POST } from '@/app/api/feedback/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001' }
const PROJECT_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const COMMUNITY_ID = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'
const ITERATION_ID = 'iter-uuid-001'

const VALID_BODY = {
  projectId: PROJECT_ID,
  communityId: COMMUNITY_ID,
  scores: { p1: 3, p2: 2, p3: 1 },
  textResponses: { p4: 'a'.repeat(200) },
}

const MOCK_ITERATION = {
  id: ITERATION_ID,
  projectId: PROJECT_ID,
  versionNumber: 2,
  title: 'Segunda versión',
  description: null,
  hypothesis: null,
  publishedAt: '2026-05-07T10:00:00Z',
  createdAt: '2026-05-07T10:00:00Z',
}

const MOCK_FEEDBACK = {
  id: 'fb-001',
  projectId: PROJECT_ID,
  reviewerId: MOCK_USER.id,
  communityId: COMMUNITY_ID,
  scores: VALID_BODY.scores,
  textResponses: VALID_BODY.textResponses,
  createdAt: '2026-05-07T12:00:00Z',
  customAnswer: null,
  qualityScore: 1.0,
  iterationId: ITERATION_ID,
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
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/feedback (Story 13.4) — atribución de iteration_id', () => {
  afterEach(() => vi.clearAllMocks())

  // AC1 — Proyecto CON iteración: repo.create recibe iterationId de la iteración más reciente
  it('repo.create recibe iterationId de la iteración más reciente cuando el proyecto tiene iteraciones', async () => {
    mockAuthOk()

    const iterationsRepo = createProjectIterationsRepositoryMock()
    iterationsRepo.getLatestIteration.mockResolvedValue(MOCK_ITERATION)

    const createSpy = vi.fn().mockResolvedValue({ data: MOCK_FEEDBACK, error: null })
    createFeedbackRepositoryMock.mockReturnValueOnce({
      create: createSpy,
      countCompleteByProject: vi.fn().mockResolvedValue(0),
    })

    await POST(buildPostRequest(VALID_BODY))

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        iterationId: ITERATION_ID,
      })
    )
  })

  // AC2 — Proyecto SIN iteración: repo.create recibe iterationId null
  it('repo.create recibe iterationId null cuando el proyecto no tiene iteraciones', async () => {
    mockAuthOk()

    const iterationsRepo = createProjectIterationsRepositoryMock()
    iterationsRepo.getLatestIteration.mockResolvedValue(null)

    const createSpy = vi.fn().mockResolvedValue({ data: { ...MOCK_FEEDBACK, iterationId: null }, error: null })
    createFeedbackRepositoryMock.mockReturnValueOnce({
      create: createSpy,
      countCompleteByProject: vi.fn().mockResolvedValue(0),
    })

    await POST(buildPostRequest(VALID_BODY))

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        iterationId: null,
      })
    )
  })

  // Manejo graceful — si getLatestIteration lanza excepción, feedback se crea con iterationId null
  it('crea el feedback con iterationId null y no bloquea el 201 si getLatestIteration falla', async () => {
    mockAuthOk()

    const iterationsRepo = createProjectIterationsRepositoryMock()
    iterationsRepo.getLatestIteration.mockRejectedValue(new Error('DB connection error'))

    const createSpy = vi.fn().mockResolvedValue({ data: { ...MOCK_FEEDBACK, iterationId: null }, error: null })
    createFeedbackRepositoryMock.mockReturnValueOnce({
      create: createSpy,
      countCompleteByProject: vi.fn().mockResolvedValue(0),
    })

    const response = await POST(buildPostRequest(VALID_BODY))

    expect(response.status).toBe(201)
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        iterationId: null,
      })
    )
  })
})
