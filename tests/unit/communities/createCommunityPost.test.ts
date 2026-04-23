import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks de next/server (hoisted)
// ---------------------------------------------------------------------------

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      body,
      json: async () => body,
    })),
  },
}))

// ---------------------------------------------------------------------------
// Mock de Supabase
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
// Imports — después de los mocks
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/communities/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockUser = { id: 'user-new-abc' }

function mockAuthOk() {
  supabaseMock.auth.getUser.mockResolvedValue({
    data: { user: mockUser },
    error: null,
  })
}

function buildRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/communities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

// ---------------------------------------------------------------------------
// Suite 1: Autenticación
// ---------------------------------------------------------------------------

describe('POST /api/communities — autenticación', () => {
  it('devuelve 401 cuando no hay usuario autenticado', async () => {
    supabaseMock.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })

    const response = await POST(buildRequest({ name: 'Mi Comunidad', description: 'Desc' }))
    expect(response.status).toBe(401)
  })
})

// ---------------------------------------------------------------------------
// Suite 2: Validación del cuerpo
// ---------------------------------------------------------------------------

describe('POST /api/communities — validación', () => {
  beforeEach(mockAuthOk)
  afterEach(() => vi.clearAllMocks())

  it('devuelve 400 cuando el nombre está vacío', async () => {
    const response = await POST(buildRequest({ name: '', description: 'Descripción válida' }))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('devuelve 400 cuando la descripción está vacía', async () => {
    const response = await POST(buildRequest({ name: 'Mi Comunidad', description: '' }))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('devuelve 400 con cuerpo JSON inválido', async () => {
    const request = new Request('http://localhost/api/communities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json',
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.code).toBe('INVALID_BODY')
  })
})

// ---------------------------------------------------------------------------
// Suite 3: Bug de RLS — SELECT devuelve null tras INSERT
//
// Reproduce el escenario real donde:
//   - INSERT communities → OK (la policy INSERT permite auth.uid() = created_by)
//   - .select().single() → { data: null, error: null }
//     porque la policy SELECT (members_read_own_community) exige membership,
//     que aún no existe en ese momento
// ---------------------------------------------------------------------------

describe('POST /api/communities — bug RLS: SELECT null tras INSERT', () => {
  beforeEach(() => {
    mockAuthOk()

    let callCount = 0
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'communities') {
        callCount++
        if (callCount === 1) {
          // generateUniqueSlug: findBySlug → no existe slug → ok
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        // INSERT + SELECT → RLS filtra la fila recién creada → data: null
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      }
      return {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
    })
  })

  afterEach(() => vi.clearAllMocks())

  it('devuelve 500 con COMMUNITY_CREATE_ERROR cuando SELECT devuelve null (RLS bug)', async () => {
    const response = await POST(
      buildRequest({ name: 'Comunidad RLS Test', description: 'Descripción del bug RLS' })
    )
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.code).toBe('COMMUNITY_CREATE_ERROR')
  })
})

// ---------------------------------------------------------------------------
// Suite 4: Creación exitosa — flujo completo
//
// Simula el comportamiento DESPUÉS del fix:
//   - INSERT + SELECT devuelve la comunidad (la policy creator_read_own_community lo permite)
//   - addMember inserta el admin sin error
// ---------------------------------------------------------------------------

describe('POST /api/communities — creación exitosa', () => {
  const createdCommunity = {
    id: 'comm-new-123',
    name: 'Startup Valencia',
    slug: 'startup-valencia',
    description: 'Comunidad de startups en Valencia',
    image_url: null,
    created_by: mockUser.id,
    created_at: '2026-04-23T10:00:00Z',
    updated_at: '2026-04-23T10:00:00Z',
  }

  beforeEach(() => {
    mockAuthOk()

    let callCount = 0
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'communities') {
        callCount++
        if (callCount === 1) {
          // generateUniqueSlug: no existe → null
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        // INSERT + SELECT → devuelve la comunidad (fix aplicado)
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: createdCommunity, error: null }),
        }
      }
      if (table === 'community_members') {
        // addMember → éxito
        return {
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      }
      return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) }
    })
  })

  afterEach(() => vi.clearAllMocks())

  it('devuelve 201 con la comunidad creada', async () => {
    const response = await POST(
      buildRequest({ name: 'Startup Valencia', description: 'Comunidad de startups en Valencia' })
    )
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.data.id).toBe('comm-new-123')
    expect(body.data.slug).toBe('startup-valencia')
  })

  it('el nombre del creador como admin se registra (addMember se llama con community.id)', async () => {
    // Spy para verificar que addMember se invoca con el id correcto
    const insertSpy = vi.fn().mockResolvedValue({ data: null, error: null })
    let callCount = 0
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'communities') {
        callCount++
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: createdCommunity, error: null }),
        }
      }
      if (table === 'community_members') {
        return { insert: insertSpy }
      }
      return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) }
    })

    await POST(
      buildRequest({ name: 'Startup Valencia', description: 'Comunidad de startups en Valencia' })
    )

    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        community_id: 'comm-new-123',
        user_id: mockUser.id,
        role: 'admin',
      })
    )
  })
})

// ---------------------------------------------------------------------------
// Suite 5: Slug duplicado (race condition)
// ---------------------------------------------------------------------------

describe('POST /api/communities — slug duplicado', () => {
  beforeEach(() => {
    mockAuthOk()

    let callCount = 0
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'communities') {
        callCount++
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return {
          insert: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          single: vi
            .fn()
            .mockResolvedValue({ data: null, error: { code: '23505', message: 'unique violation' } }),
        }
      }
      return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) }
    })
  })

  afterEach(() => vi.clearAllMocks())

  it('devuelve 409 con COMMUNITY_NAME_TAKEN cuando hay unique violation', async () => {
    const response = await POST(
      buildRequest({ name: 'Nombre Duplicado', description: 'Desc' })
    )
    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body.code).toBe('COMMUNITY_NAME_TAKEN')
  })
})
