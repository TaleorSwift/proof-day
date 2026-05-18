import { describe, it, expect, vi, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock de Supabase server
// ---------------------------------------------------------------------------

const { supabaseMock } = vi.hoisted(() => {
  const supabaseMock = {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  }
  return { supabaseMock }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(supabaseMock),
}))

// ---------------------------------------------------------------------------
// Imports tras mocks
// ---------------------------------------------------------------------------

import { GET as getFeedbackCount } from '@/app/api/gamification/feedback-count/route'
import { GET as getTopReviewer } from '@/app/api/gamification/top-reviewer/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001' }
const COMMUNITY_ID = 'community-uuid-001'

function buildRequest(endpoint: string, communityId?: string): Request {
  const url = communityId
    ? `http://localhost${endpoint}?communityId=${communityId}`
    : `http://localhost${endpoint}`
  return new Request(url)
}

function mockNoAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null } })
}

function mockAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
}

function mockMembershipOk() {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'membership-001' }, error: null }),
        }),
      }),
    }),
  }
}

function mockMembershipFail() {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  }
}

// ---------------------------------------------------------------------------
// Suite: GET /api/gamification/feedback-count
// ---------------------------------------------------------------------------

describe('GET /api/gamification/feedback-count', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 401 cuando el usuario no está autenticado', async () => {
    mockNoAuth()

    const res = await getFeedbackCount(buildRequest('/api/gamification/feedback-count'))
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.code).toBe('AUTH_REQUIRED')
  })

  it('retorna 400 cuando falta communityId', async () => {
    mockAuth()

    const res = await getFeedbackCount(buildRequest('/api/gamification/feedback-count'))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 403 cuando el usuario no pertenece a la comunidad', async () => {
    mockAuth()

    supabaseMock.from.mockReturnValue(mockMembershipFail())

    const res = await getFeedbackCount(buildRequest('/api/gamification/feedback-count', COMMUNITY_ID))
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.code).toBe('COMMUNITY_ACCESS_DENIED')
  })

  it('retorna 200 con el conteo de feedbacks del usuario', async () => {
    mockAuth()

    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // Primera llamada: verificación de membresía
        return mockMembershipOk()
      }
      // Segunda llamada: conteo de feedbacks
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
          }),
        }),
      }
    })

    const res = await getFeedbackCount(buildRequest('/api/gamification/feedback-count', COMMUNITY_ID))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toEqual({ count: 3, communityId: COMMUNITY_ID })
  })

  it('retorna count 0 cuando el usuario no ha dado feedbacks', async () => {
    mockAuth()

    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) return mockMembershipOk()
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: null, error: null }),
          }),
        }),
      }
    })

    const res = await getFeedbackCount(buildRequest('/api/gamification/feedback-count', COMMUNITY_ID))
    const body = await res.json()

    expect(body.data.count).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Suite: GET /api/gamification/top-reviewer
// ---------------------------------------------------------------------------

describe('GET /api/gamification/top-reviewer', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 401 cuando el usuario no está autenticado', async () => {
    mockNoAuth()

    const res = await getTopReviewer(buildRequest('/api/gamification/top-reviewer'))
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.code).toBe('AUTH_REQUIRED')
  })

  it('retorna 400 cuando falta communityId', async () => {
    mockAuth()

    const res = await getTopReviewer(buildRequest('/api/gamification/top-reviewer'))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 403 cuando el usuario no pertenece a la comunidad', async () => {
    mockAuth()

    supabaseMock.from.mockReturnValue(mockMembershipFail())

    const res = await getTopReviewer(buildRequest('/api/gamification/top-reviewer', COMMUNITY_ID))
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.code).toBe('COMMUNITY_ACCESS_DENIED')
  })

  it('retorna 200 con data null cuando no hay feedbacks esta semana', async () => {
    mockAuth()

    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) return mockMembershipOk()
      // feedbacks: array vacío
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }
    })

    const res = await getTopReviewer(buildRequest('/api/gamification/top-reviewer', COMMUNITY_ID))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toBeNull()
  })

  it('retorna 200 con el top reviewer cuando hay feedbacks', async () => {
    mockAuth()

    const feedbacks = [
      { reviewer_id: 'user-A', created_at: '2024-01-01T00:00:00Z' },
      { reviewer_id: 'user-A', created_at: '2024-01-01T01:00:00Z' },
      { reviewer_id: 'user-B', created_at: '2024-01-01T02:00:00Z' },
    ]

    const mockProfile = { id: 'user-A', name: 'Ana García', avatar_url: null }

    let callCount = 0
    supabaseMock.from.mockImplementation((_table: string) => {
      callCount++
      if (callCount === 1) return mockMembershipOk()
      if (_table === 'feedbacks') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockResolvedValue({ data: feedbacks, error: null }),
            }),
          }),
        }
      }
      if (_table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
            }),
          }),
        }
      }
      return {}
    })

    const res = await getTopReviewer(buildRequest('/api/gamification/top-reviewer', COMMUNITY_ID))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toMatchObject({
      userId: 'user-A',
      name: 'Ana García',
      feedbackCount: 2,
    })
  })
})
