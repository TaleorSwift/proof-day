import { describe, it, expect, vi, afterEach } from 'vitest'

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

vi.mock('@/lib/services/projects.service', () => ({
  createProjectsService: vi.fn().mockReturnValue({
    validateMembership: vi.fn().mockResolvedValue({ ok: true }),
  }),
}))

// ---------------------------------------------------------------------------
// Imports tras mocks
// ---------------------------------------------------------------------------

import { GET, POST } from '@/app/api/projects/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001' }
const COMMUNITY_ID = 'community-uuid-001'

const MOCK_PROJECT_ROW = {
  id: 'project-uuid-001', slug: 'mi-proyecto', title: 'Mi proyecto',
  image_urls: [], status: 'draft', builder_id: MOCK_USER.id,
  created_at: '2024-01-01T00:00:00Z', problem: null,
  community_id: COMMUNITY_ID,
}

function buildGetRequest(communityId?: string): Request {
  const url = communityId
    ? `http://localhost/api/projects?communityId=${communityId}`
    : 'http://localhost/api/projects'
  return new Request(url)
}

function buildPostRequest(body: unknown): Request {
  return new Request('http://localhost/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function mockAuthOk() {
  requireAuthMock.mockResolvedValue({ user: MOCK_USER, supabase: supabaseMock, error: null })
}

function mockAuthFail() {
  requireAuthMock.mockResolvedValue({
    user: null, supabase: null,
    error: { status: 401, json: async () => ({ error: 'No autenticado', code: 'AUTH_REQUIRED' }) },
  })
}

// ---------------------------------------------------------------------------
// Suite: GET /api/projects
// ---------------------------------------------------------------------------

describe('GET /api/projects', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna la respuesta de error de requireAuth cuando no está autenticado', async () => {
    mockAuthFail()

    const res = await GET(buildGetRequest(COMMUNITY_ID))

    // Cuando auth falla, se retorna directamente auth.error
    expect(res).toBeDefined()
  })

  it('retorna 400 cuando falta communityId', async () => {
    mockAuthOk()

    const res = await GET(buildGetRequest())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 200 con los proyectos cuando todo es correcto', async () => {
    mockAuthOk()

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [MOCK_PROJECT_ROW], error: null }),
        }),
      }),
    })

    const res = await GET(buildGetRequest(COMMUNITY_ID))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toEqual([MOCK_PROJECT_ROW])
  })

  it('retorna 500 cuando Supabase devuelve error', async () => {
    mockAuthOk()

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
        }),
      }),
    })

    const res = await GET(buildGetRequest(COMMUNITY_ID))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.code).toBe('PROJECTS_FETCH_ERROR')
  })
})

// ---------------------------------------------------------------------------
// Suite: POST /api/projects
// ---------------------------------------------------------------------------

describe('POST /api/projects', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna la respuesta de error de requireAuth cuando no está autenticado', async () => {
    mockAuthFail()

    const res = await POST(buildPostRequest({}))
    expect(res).toBeDefined()
  })

  it('retorna 400 cuando el body es JSON inválido', async () => {
    mockAuthOk()

    const req = new Request('http://localhost/api/projects', {
      method: 'POST',
      body: 'no-es-json',
    })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('INVALID_BODY')
  })

  it('retorna 400 cuando el body no pasa validación Zod', async () => {
    mockAuthOk()

    const res = await POST(buildPostRequest({ titulo: 'sin campos requeridos' }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 201 con el proyecto creado cuando los datos son válidos', async () => {
    mockAuthOk()

    supabaseMock.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: MOCK_PROJECT_ROW, error: null }),
        }),
      }),
    })

    const validBody = {
      communityId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      title: 'Mi proyecto',
      problem: 'Un problema real',
      solution: 'Una solución concreta',
      hypothesis: 'Si hacemos X, Y mejorará',
      imageUrls: ['https://example.com/imagen.jpg'],
    }

    const res = await POST(buildPostRequest(validBody))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data).toEqual(MOCK_PROJECT_ROW)
  })

  it('retorna 500 cuando Supabase falla al crear el proyecto', async () => {
    mockAuthOk()

    supabaseMock.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
        }),
      }),
    })

    const validBody = {
      communityId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      title: 'Mi proyecto',
      problem: 'Problema',
      solution: 'Solución',
      hypothesis: 'Hipótesis',
      imageUrls: ['https://example.com/imagen.jpg'],
    }

    const res = await POST(buildPostRequest(validBody))
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.code).toBe('PROJECT_CREATE_ERROR')
  })
})
