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

import { POST } from '@/app/api/projects/[id]/decision/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001' }
const PROJECT_ID = 'project-uuid-001'

const MOCK_PROJECT = {
  id: PROJECT_ID, builder_id: MOCK_USER.id, decision: null,
}

function buildParams(id: string = PROJECT_ID) {
  return { params: Promise.resolve({ id }) }
}

function buildRequest(body: unknown): Request {
  return new Request(`http://localhost/api/projects/${PROJECT_ID}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function mockNoAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null } })
}

function mockAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
}

// ---------------------------------------------------------------------------
// Suite: POST /api/projects/[id]/decision
// ---------------------------------------------------------------------------

describe('POST /api/projects/[id]/decision', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 401 cuando el usuario no está autenticado', async () => {
    mockNoAuth()

    const res = await POST(buildRequest({ decision: 'iterate' }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.code).toBe('AUTH_REQUIRED')
  })

  it('retorna 400 cuando el body es JSON inválido', async () => {
    mockAuth()

    const req = new Request(`http://localhost/api/projects/${PROJECT_ID}/decision`, {
      method: 'POST',
      body: 'no-es-json',
    })
    const res = await POST(req, buildParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('INVALID_BODY')
  })

  it('retorna 400 cuando la decisión no es válida', async () => {
    mockAuth()

    const res = await POST(buildRequest({ decision: 'valor-invalido' }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
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

    const res = await POST(buildRequest({ decision: 'iterate' }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.code).toBe('PROJECT_NOT_FOUND')
  })

  it('retorna 403 cuando el usuario no es el builder', async () => {
    mockAuth()

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ...MOCK_PROJECT, builder_id: 'otro-user' }, error: null,
          }),
        }),
      }),
    })

    const res = await POST(buildRequest({ decision: 'scale' }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.code).toBe('PROJECT_FORBIDDEN')
  })

  it('retorna 409 cuando ya existe una decisión registrada', async () => {
    mockAuth()

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ...MOCK_PROJECT, decision: 'iterate' }, error: null,
          }),
        }),
      }),
    })

    const res = await POST(buildRequest({ decision: 'scale' }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body.code).toBe('DECISION_ALREADY_REGISTERED')
  })

  it('retorna 200 con el proyecto actualizado cuando la decisión es válida', async () => {
    mockAuth()

    const updatedProject = { ...MOCK_PROJECT, decision: 'iterate', decided_at: '2024-01-02T00:00:00Z' }

    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: MOCK_PROJECT, error: null }),
            }),
          }),
        }
      }
      return {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updatedProject, error: null }),
            }),
          }),
        }),
      }
    })

    const res = await POST(buildRequest({ decision: 'iterate' }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.decision).toBe('iterate')
  })

  it('acepta las tres decisiones válidas: iterate, scale, abandon', async () => {
    for (const decision of ['iterate', 'scale', 'abandon'] as const) {
      mockAuth()

      let callCount = 0
      supabaseMock.from.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: MOCK_PROJECT, error: null }),
              }),
            }),
          }
        }
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { ...MOCK_PROJECT, decision }, error: null,
                }),
              }),
            }),
          }),
        }
      })

      const res = await POST(buildRequest({ decision }), buildParams())
      expect(res.status).toBe(200)
    }
  })
})
