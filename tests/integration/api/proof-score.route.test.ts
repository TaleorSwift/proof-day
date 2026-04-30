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

import { GET } from '@/app/api/proof-score/[projectId]/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001' }
const PROJECT_ID = 'project-uuid-001'

function buildParams(projectId: string = PROJECT_ID) {
  return { params: Promise.resolve({ projectId }) }
}

function buildRequest(): Request {
  return new Request(`http://localhost/api/proof-score/${PROJECT_ID}`)
}

function mockNoAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null } })
}

function mockAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
}

// ---------------------------------------------------------------------------
// Suite: GET /api/proof-score/[projectId]
// ---------------------------------------------------------------------------

describe('GET /api/proof-score/[projectId]', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 401 cuando el usuario no está autenticado', async () => {
    mockNoAuth()

    const res = await GET(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.code).toBe('AUTH_REQUIRED')
  })

  it('retorna 404 cuando el proyecto no existe', async () => {
    mockAuth()

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    })

    const res = await GET(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.code).toBe('PROJECT_NOT_FOUND')
  })

  it('retorna 403 cuando el usuario no es el builder del proyecto', async () => {
    mockAuth()

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: PROJECT_ID, builder_id: 'otro-user' },
            error: null,
          }),
        }),
      }),
    })

    const res = await GET(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.code).toBe('PROOF_SCORE_FORBIDDEN')
  })

  it('retorna 500 cuando Supabase falla al obtener los feedbacks', async () => {
    mockAuth()

    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: PROJECT_ID, builder_id: MOCK_USER.id },
                error: null,
              }),
            }),
          }),
        }
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
        }),
      }
    })

    const res = await GET(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.code).toBe('FEEDBACKS_FETCH_ERROR')
  })

  it('retorna 200 con el proof score calculado cuando hay feedbacks', async () => {
    mockAuth()

    const mockFeedbacks = [
      { scores: { p1: 3, p2: 2, p3: 3 } },
      { scores: { p1: 2, p2: 3, p3: 2 } },
    ]

    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: PROJECT_ID, builder_id: MOCK_USER.id },
                error: null,
              }),
            }),
          }),
        }
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockFeedbacks, error: null }),
        }),
      }
    })

    const res = await GET(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toBeDefined()
  })

  it('retorna 200 con score calculado para proyecto sin feedbacks', async () => {
    mockAuth()

    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: PROJECT_ID, builder_id: MOCK_USER.id },
                error: null,
              }),
            }),
          }),
        }
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }
    })

    const res = await GET(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toBeDefined()
  })
})
