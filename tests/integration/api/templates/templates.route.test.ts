import { describe, it, expect, vi, afterEach } from 'vitest'
import { NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Mocks hoisted
// ---------------------------------------------------------------------------

const { supabaseMock, requireAuthMock } = vi.hoisted(() => {
  const supabaseMock = {
    from: vi.fn(),
  }
  const requireAuthMock = vi.fn()
  return { supabaseMock, requireAuthMock }
})

vi.mock('@/lib/api/middleware/require-auth', () => ({
  requireAuth: requireAuthMock,
}))

// ---------------------------------------------------------------------------
// Imports tras mocks
// ---------------------------------------------------------------------------

import { GET } from '@/app/api/templates/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001' }

const MOCK_TEMPLATE_ROWS = [
  {
    id: 'tpl-uuid-001',
    type: 'feature',
    name: 'Feature de producto existente',
    description_structure: {
      problem: { placeholder: 'placeholder-p', example: 'example-p' },
      solution: { placeholder: 'placeholder-s', example: 'example-s' },
    },
    reviewer_context: 'contexto feature',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl-uuid-002',
    type: 'internal_process',
    name: 'Proceso interno',
    description_structure: {
      problem: { placeholder: 'placeholder-p', example: 'example-p' },
      solution: { placeholder: 'placeholder-s', example: 'example-s' },
    },
    reviewer_context: 'contexto internal_process',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl-uuid-003',
    type: 'physical_product',
    name: 'Producto físico',
    description_structure: {
      problem: { placeholder: 'placeholder-p', example: 'example-p' },
      solution: { placeholder: 'placeholder-s', example: 'example-s' },
    },
    reviewer_context: 'contexto physical_product',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl-uuid-004',
    type: 'saas',
    name: 'Producto SaaS',
    description_structure: {
      problem: { placeholder: 'placeholder-p', example: 'example-p' },
      solution: { placeholder: 'placeholder-s', example: 'example-s' },
    },
    reviewer_context: 'contexto saas',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'tpl-uuid-005',
    type: 'service',
    name: 'Servicio',
    description_structure: {
      problem: { placeholder: 'placeholder-p', example: 'example-p' },
      solution: { placeholder: 'placeholder-s', example: 'example-s' },
    },
    reviewer_context: 'contexto service',
    created_at: '2024-01-01T00:00:00Z',
  },
]

function buildGetRequest(): Request {
  return new Request('http://localhost/api/templates')
}

function mockAuthOk() {
  requireAuthMock.mockResolvedValue({ user: MOCK_USER, supabase: supabaseMock, error: null })
}

function mockAuthFail() {
  requireAuthMock.mockResolvedValue({
    user: null,
    supabase: null,
    error: NextResponse.json({ error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 }),
  })
}

// ---------------------------------------------------------------------------
// Suite: GET /api/templates
// ---------------------------------------------------------------------------

describe('GET /api/templates', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 401 cuando el usuario no está autenticado (AC-5)', async () => {
    mockAuthFail()

    const res = await GET(buildGetRequest())
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.code).toBe('AUTH_REQUIRED')
  })

  it('retorna 200 con los 5 templates ordenados por name cuando el usuario está autenticado (AC-5)', async () => {
    mockAuthOk()

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: MOCK_TEMPLATE_ROWS, error: null }),
      }),
    })

    const res = await GET(buildGetRequest())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toHaveLength(5)
    expect(body.data[0].type).toBe('feature')
    expect(body.data[0].name).toBe('Feature de producto existente')
    // Verifica que la respuesta está en camelCase (templateFromRow mapeado)
    expect(body.data[0].descriptionStructure).toBeDefined()
    expect(body.data[0].reviewerContext).toBeDefined()
    expect(body.data[0].createdAt).toBeDefined()
    // Verifica que NO hay snake_case en la respuesta
    expect(body.data[0].description_structure).toBeUndefined()
    expect(body.data[0].reviewer_context).toBeUndefined()
  })

  it('retorna 500 cuando Supabase devuelve un error de base de datos', async () => {
    mockAuthOk()

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB connection error') }),
      }),
    })

    const res = await GET(buildGetRequest())
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.error).toBeDefined()
  })
})
