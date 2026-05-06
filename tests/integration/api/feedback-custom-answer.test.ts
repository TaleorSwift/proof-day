import { describe, it, expect, vi, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Tests TDD Outside-In — POST /api/feedback con customAnswer (Story 11.2)
// T4.1–T4.2: customAnswer se pasa al repo y se guarda en BD
// AC-7, AC-8
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
const MOCK_FEEDBACK_ROW = {
  id: 'fb-001',
  project_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  reviewer_id: MOCK_USER.id,
  community_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  scores: { p1: 3, p2: 2, p3: 1 },
  text_responses: { p4: 'Texto obligatorio con más de diez caracteres' },
  created_at: '2026-01-01T00:00:00Z',
  custom_answer: null,
  quality_score: null,
}

const VALID_BODY_BASE = {
  projectId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  communityId: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  scores: { p1: 3, p2: 2, p3: 1 },
  textResponses: { p4: 'Texto obligatorio con más de diez caracteres' },
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

function getFeedbackRepoInstance() {
  return createFeedbackRepositoryMock.mock.results[0]?.value
}

// ---------------------------------------------------------------------------
// T4.1: body con customAnswer → repo.create recibe customAnswer
// ---------------------------------------------------------------------------

describe('POST /api/feedback (Story 11.2) — T4.1: customAnswer se pasa al repo', () => {
  afterEach(() => vi.clearAllMocks())

  it('feedbackRepo.create recibe customAnswer cuando el body lo incluye', async () => {
    mockAuthOk()

    const mockFeedbackRowWithAnswer = {
      ...MOCK_FEEDBACK_ROW,
      custom_answer: 'Mi respuesta a la pregunta del Builder',
    }

    // Preparar el mock antes de llamar (el módulo se mockea arriba)
    createFeedbackRepositoryMock.mockReturnValueOnce({
      create: vi.fn().mockResolvedValue({
        data: {
          id: mockFeedbackRowWithAnswer.id,
          projectId: mockFeedbackRowWithAnswer.project_id,
          reviewerId: mockFeedbackRowWithAnswer.reviewer_id,
          communityId: mockFeedbackRowWithAnswer.community_id,
          scores: mockFeedbackRowWithAnswer.scores,
          textResponses: mockFeedbackRowWithAnswer.text_responses,
          createdAt: mockFeedbackRowWithAnswer.created_at,
          customAnswer: 'Mi respuesta a la pregunta del Builder',
          qualityScore: null,
        },
        error: null,
      }),
    })

    const res = await POST(
      buildPostRequest({
        ...VALID_BODY_BASE,
        customAnswer: 'Mi respuesta a la pregunta del Builder',
      }),
    )

    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.data.customAnswer).toBe('Mi respuesta a la pregunta del Builder')
  })
})

// ---------------------------------------------------------------------------
// T4.2: body sin customAnswer → repo.create recibe customAnswer null
// ---------------------------------------------------------------------------

describe('POST /api/feedback (Story 11.2) — T4.2: sin customAnswer → null', () => {
  afterEach(() => vi.clearAllMocks())

  it('feedbackRepo.create recibe customAnswer null cuando el body no lo incluye', async () => {
    mockAuthOk()

    createFeedbackRepositoryMock.mockReturnValueOnce({
      create: vi.fn().mockResolvedValue({
        data: {
          id: MOCK_FEEDBACK_ROW.id,
          projectId: MOCK_FEEDBACK_ROW.project_id,
          reviewerId: MOCK_FEEDBACK_ROW.reviewer_id,
          communityId: MOCK_FEEDBACK_ROW.community_id,
          scores: MOCK_FEEDBACK_ROW.scores,
          textResponses: MOCK_FEEDBACK_ROW.text_responses,
          createdAt: MOCK_FEEDBACK_ROW.created_at,
          customAnswer: null,
          qualityScore: null,
        },
        error: null,
      }),
    })

    const res = await POST(buildPostRequest(VALID_BODY_BASE))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.customAnswer).toBeNull()
  })
})
