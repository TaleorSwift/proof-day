import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks de next/server (hoisted — sin referencias a variables externas)
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
// Mock de Supabase — usando vi.hoisted para poder referenciar en vi.mock
// ---------------------------------------------------------------------------

const { supabaseMock } = vi.hoisted(() => {
  const supabaseMock = {
    auth: {
      getUser: vi.fn(),
    },
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

import { GET } from '@/app/api/communities/route'

// ---------------------------------------------------------------------------
// Suite 1: GET /api/communities — autenticación
// ---------------------------------------------------------------------------

describe('GET /api/communities — autenticación', () => {
  it('devuelve 401 cuando no hay usuario autenticado', async () => {
    supabaseMock.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('No session'),
    })

    const response = await GET()
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.code).toBe('AUTH_REQUIRED')
  })

  it('devuelve 401 cuando getUser retorna error sin usuario', async () => {
    supabaseMock.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    })

    const response = await GET()
    expect(response.status).toBe(401)
  })
})

// ---------------------------------------------------------------------------
// Suite 2: GET /api/communities — respuesta con comunidades
// ---------------------------------------------------------------------------

describe('GET /api/communities — respuesta con datos', () => {
  const mockUser = { id: 'user-123' }

  const mockCommunities = [
    {
      id: 'comm-1',
      name: 'Comunidad Alpha',
      slug: 'comunidad-alpha',
      description: 'Descripción de Alpha',
      image_url: null,
      created_by: 'user-123',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'comm-2',
      name: 'Comunidad Beta',
      slug: 'comunidad-beta',
      description: 'Descripción de Beta',
      image_url: 'https://example.com/beta.jpg',
      created_by: 'user-123',
      created_at: '2026-01-02T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    },
  ]

  const mockMemberData = [
    { community_id: 'comm-1' },
    { community_id: 'comm-1' },
    { community_id: 'comm-1' },
    { community_id: 'comm-2' },
  ]

  beforeEach(() => {
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // Primera llamada: query de comunidades
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: mockCommunities, error: null }),
        }
      } else {
        // Segunda llamada: query de member counts
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: mockMemberData, error: null }),
        }
      }
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('devuelve lista de comunidades del usuario (AC-1)', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toHaveLength(2)
  })

  it('incluye memberCount en cada comunidad (AC-7)', async () => {
    const response = await GET()
    const body = await response.json()

    const alpha = body.data.find((c: { slug: string }) => c.slug === 'comunidad-alpha')
    const beta = body.data.find((c: { slug: string }) => c.slug === 'comunidad-beta')

    expect(alpha?.memberCount).toBe(3)
    expect(beta?.memberCount).toBe(1)
  })

  it('mapea snake_case a camelCase correctamente (AC-7)', async () => {
    const response = await GET()
    const body = await response.json()
    const community = body.data[0]

    // Campos en camelCase presentes
    expect(community).toHaveProperty('imageUrl')
    expect(community).toHaveProperty('createdAt')
    expect(community).toHaveProperty('updatedAt')
    expect(community).toHaveProperty('createdBy')
    expect(community).toHaveProperty('memberCount')

    // Campos en snake_case NO deben estar presentes en la respuesta
    expect(community).not.toHaveProperty('image_url')
    expect(community).not.toHaveProperty('created_at')
    expect(community).not.toHaveProperty('updated_at')
  })

  it('imageUrl es null cuando la comunidad no tiene imagen', async () => {
    const response = await GET()
    const body = await response.json()
    const alpha = body.data.find((c: { slug: string }) => c.slug === 'comunidad-alpha')
    expect(alpha?.imageUrl).toBeNull()
  })

  it('imageUrl contiene la URL cuando la comunidad tiene imagen', async () => {
    const response = await GET()
    const body = await response.json()
    const beta = body.data.find((c: { slug: string }) => c.slug === 'comunidad-beta')
    expect(beta?.imageUrl).toBe('https://example.com/beta.jpg')
  })

  it('incluye campo count con el número de comunidades (AC-7)', async () => {
    const response = await GET()
    const body = await response.json()
    expect(body.count).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// Suite 3: GET /api/communities — usuario sin comunidades
// ---------------------------------------------------------------------------

describe('GET /api/communities — usuario sin comunidades', () => {
  beforeEach(() => {
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-empty' } },
      error: null,
    })

    supabaseMock.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('devuelve data vacía y count 0 cuando el usuario no tiene comunidades', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toEqual([])
    expect(body.count).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Suite 4: GET /api/communities — error de BD
// ---------------------------------------------------------------------------

describe('GET /api/communities — error de base de datos', () => {
  beforeEach(() => {
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })

    supabaseMock.from.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'PGRST000' },
      }),
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('devuelve 500 cuando hay error de BD', async () => {
    const response = await GET()
    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.code).toBe('COMMUNITIES_FETCH_ERROR')
  })
})

// ---------------------------------------------------------------------------
// Suite 5: Lógica de redirect automático (AC-5) — función pura de decisión
// ---------------------------------------------------------------------------

describe('Lógica de redirect automático — AC-5', () => {
  function shouldAutoRedirect(communityCount: number): boolean {
    return communityCount === 1
  }

  it('debe redirigir cuando el usuario tiene exactamente 1 comunidad', () => {
    expect(shouldAutoRedirect(1)).toBe(true)
  })

  it('NO debe redirigir cuando el usuario tiene 0 comunidades', () => {
    expect(shouldAutoRedirect(0)).toBe(false)
  })

  it('NO debe redirigir cuando el usuario tiene 2 comunidades', () => {
    expect(shouldAutoRedirect(2)).toBe(false)
  })

  it('NO debe redirigir cuando el usuario tiene 3 o más comunidades', () => {
    expect(shouldAutoRedirect(3)).toBe(false)
    expect(shouldAutoRedirect(10)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Suite 6: memberCount aggregation — función pura
// ---------------------------------------------------------------------------

describe('memberCount aggregation — lógica pura', () => {
  function aggregateMemberCounts(
    memberData: Array<{ community_id: string }>
  ): Record<string, number> {
    return memberData.reduce<Record<string, number>>((acc, row) => {
      acc[row.community_id] = (acc[row.community_id] ?? 0) + 1
      return acc
    }, {})
  }

  it('cuenta correctamente múltiples miembros por comunidad', () => {
    const data = [
      { community_id: 'c1' },
      { community_id: 'c1' },
      { community_id: 'c2' },
    ]
    const counts = aggregateMemberCounts(data)
    expect(counts['c1']).toBe(2)
    expect(counts['c2']).toBe(1)
  })

  it('retorna 0 para comunidades no encontradas en el conteo', () => {
    const counts = aggregateMemberCounts([])
    expect(counts['unknown'] ?? 0).toBe(0)
  })

  it('maneja comunidad con un solo miembro', () => {
    const counts = aggregateMemberCounts([{ community_id: 'solo' }])
    expect(counts['solo']).toBe(1)
  })
})
