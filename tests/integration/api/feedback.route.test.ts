import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Mocks hoisted
// ---------------------------------------------------------------------------

const { supabaseMock, requireAuthMock } = vi.hoisted(() => {
  const supabaseMock = {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  }

  const requireAuthMock = vi.fn()

  return { supabaseMock, requireAuthMock }
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

// ---------------------------------------------------------------------------
// Imports tras mocks
// ---------------------------------------------------------------------------

import { GET, POST } from '@/app/api/feedback/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001' }
const PROJECT_ID = 'project-uuid-001'

function buildRequest(method: string, body?: unknown, url = `http://localhost/api/feedback?projectId=${PROJECT_ID}`): Request {
  if (method === 'GET') {
    return new Request(url)
  }
  return new Request('http://localhost/api/feedback', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

function mockAuthOk() {
  requireAuthMock.mockResolvedValue({ user: MOCK_USER, supabase: supabaseMock, error: null })
}

function mockAuthFail() {
  const errorResponse = NextResponse.json({ error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 })
  requireAuthMock.mockResolvedValue({ user: null, supabase: null, error: errorResponse })
}

// ---------------------------------------------------------------------------
// Suite: GET /api/feedback
// ---------------------------------------------------------------------------

describe('GET /api/feedback', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 401 cuando el usuario no está autenticado', async () => {
    mockAuthFail()

    const res = await GET(buildRequest('GET'))

    expect(res.status).toBe(401)
  })

  it('retorna 400 cuando falta projectId', async () => {
    mockAuthOk()

    const res = await GET(new Request('http://localhost/api/feedback'))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 403 cuando el usuario no es el builder del proyecto', async () => {
    mockAuthOk()

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'projects') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: PROJECT_ID, builder_id: 'otro-user' },
                error: null,
              }),
            }),
          }),
        }
      }
      return {}
    })

    const res = await GET(buildRequest('GET'))
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.code).toBe('FEEDBACK_FORBIDDEN')
  })

  it('retorna 200 con los feedbacks cuando el builder consulta su proyecto', async () => {
    mockAuthOk()

    const mockFeedbacks = [{ id: 'f1', text_responses: {}, created_at: '2024-01-01', profiles: null }]

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'projects') {
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
      if (table === 'feedbacks') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockFeedbacks, error: null }),
            }),
          }),
        }
      }
      return {}
    })

    const res = await GET(buildRequest('GET'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toEqual(mockFeedbacks)
  })
})

// ---------------------------------------------------------------------------
// Suite: POST /api/feedback
// ---------------------------------------------------------------------------

describe('POST /api/feedback', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 401 cuando el usuario no está autenticado', async () => {
    mockAuthFail()

    const res = await POST(buildRequest('POST', {}))

    expect(res.status).toBe(401)
  })

  it('retorna 400 cuando el body no es JSON válido', async () => {
    mockAuthOk()

    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      body: 'no-es-json',
    })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('INVALID_BODY')
  })

  it('retorna 400 cuando el body falla la validación Zod', async () => {
    mockAuthOk()

    const res = await POST(buildRequest('POST', { campoInvalido: 'x' }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 201 con el feedback creado cuando todo es correcto', async () => {
    mockAuthOk()

    const { createFeedbackService } = await import('@/lib/services/feedback.service')
    vi.mocked(createFeedbackService).mockReturnValue({
      validateEligibility: vi.fn().mockResolvedValue({ eligible: true }),
    } as never)

    // Mock row que devuelve Supabase (snake_case) — feedbackFromRow lo mapea a camelCase
    const mockFeedbackRow = {
      id: 'f1',
      project_id: PROJECT_ID,
      reviewer_id: MOCK_USER.id,
      community_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      scores: { p1: 3, p2: 2, p3: 1 },
      text_responses: { p4: 'Texto obligatorio con más de diez caracteres' },
      created_at: '2026-01-01T00:00:00Z',
      custom_answer: null,
      quality_score: null,
    }
    supabaseMock.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockFeedbackRow, error: null }),
        }),
      }),
      // Story 12.7 — countCompleteByProject: select('id', { count: 'exact', head: true })
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ count: 0, error: null }),
        }),
      }),
    })

    const validBody = {
      projectId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      communityId: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      scores: { p1: 3, p2: 2, p3: 1 },
      textResponses: { p4: 'Texto obligatorio con más de diez caracteres' },
    }
    const res = await POST(buildRequest('POST', validBody))
    const body = await res.json()

    expect(res.status).toBe(201)
    // feedbackFromRow mapea snake_case → camelCase — la respuesta API devuelve camelCase
    expect(body.data).toMatchObject({
      id: 'f1',
      projectId: PROJECT_ID,
    })
  })
})
