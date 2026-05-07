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

import { PATCH } from '@/app/api/communities/[id]/settings/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001' }
const COMMUNITY_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const OTHER_USER_ID = 'user-uuid-002'

function buildParams(id: string = COMMUNITY_ID) {
  return { params: Promise.resolve({ id }) }
}

function buildRequest(body: unknown): Request {
  return new Request(
    `http://localhost/api/communities/${COMMUNITY_ID}/settings`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )
}

// ---------------------------------------------------------------------------
// Helpers para mocks de Supabase
// ---------------------------------------------------------------------------

function mockMembershipAdmin() {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
        }),
      }),
    }),
  }
}

function mockMembershipMember() {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { role: 'member' }, error: null }),
        }),
      }),
    }),
  }
}

function mockMembershipNotFound() {
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

function mockCommunitiesUpdate(data: unknown, error: unknown = null) {
  return {
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data, error }),
        }),
      }),
    }),
  }
}

// ---------------------------------------------------------------------------
// Suite: PATCH /api/communities/[id]/settings
// ---------------------------------------------------------------------------

describe('PATCH /api/communities/[id]/settings', () => {
  afterEach(() => vi.clearAllMocks())

  // AC-4 — Sin autenticación → 401
  it('retorna 401 cuando el usuario no está autenticado', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null } })

    const res = await PATCH(buildRequest({ reciprocityThreshold: 5 }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.code).toBe('UNAUTHENTICATED')
    expect(body.error).toBe('No autenticado')
  })

  // AC-5 — Auth pero no admin → 403
  it('retorna 403 cuando el usuario autenticado no es admin de la comunidad', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    supabaseMock.from.mockReturnValue(mockMembershipMember())

    const res = await PATCH(buildRequest({ reciprocityThreshold: 5 }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.code).toBe('FORBIDDEN')
    expect(body.error).toBe('Solo el admin puede cambiar esta configuración')
  })

  // AC-5 — Auth pero no es miembro → 403
  it('retorna 403 cuando el usuario autenticado no es miembro de la comunidad', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: { id: OTHER_USER_ID } } })
    supabaseMock.from.mockReturnValue(mockMembershipNotFound())

    const res = await PATCH(buildRequest({ reciprocityThreshold: 5 }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.code).toBe('FORBIDDEN')
  })

  // AC-2 — Valor fuera de rango negativo → 400
  it('retorna 400 cuando reciprocityThreshold es -1', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    supabaseMock.from.mockReturnValue(mockMembershipAdmin())

    const res = await PATCH(buildRequest({ reciprocityThreshold: -1 }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  // AC-2 — Valor fuera de rango superior → 400
  it('retorna 400 cuando reciprocityThreshold es 11', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    supabaseMock.from.mockReturnValue(mockMembershipAdmin())

    const res = await PATCH(buildRequest({ reciprocityThreshold: 11 }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  // AC-2 — Valor no entero → 400
  it('retorna 400 cuando reciprocityThreshold es 2.5 (no entero)', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    supabaseMock.from.mockReturnValue(mockMembershipAdmin())

    const res = await PATCH(buildRequest({ reciprocityThreshold: 2.5 }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  // AC-3 — Admin, valor válido → 200 con community actualizada
  it('retorna 200 con la community actualizada cuando el admin guarda un valor válido', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })

    const updatedCommunity = {
      id: COMMUNITY_ID,
      reciprocity_threshold: 5,
    }

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'community_members') {
        return mockMembershipAdmin()
      }
      if (table === 'communities') {
        return mockCommunitiesUpdate(updatedCommunity)
      }
      return {}
    })

    const res = await PATCH(buildRequest({ reciprocityThreshold: 5 }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toEqual({
      id: COMMUNITY_ID,
      reciprocityThreshold: 5,
    })
  })

  // AC-6 — Valor 0 desactiva el gate → 200
  it('retorna 200 cuando reciprocityThreshold es 0 (desactiva el gate)', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })

    const updatedCommunity = {
      id: COMMUNITY_ID,
      reciprocity_threshold: 0,
    }

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'community_members') {
        return mockMembershipAdmin()
      }
      if (table === 'communities') {
        return mockCommunitiesUpdate(updatedCommunity)
      }
      return {}
    })

    const res = await PATCH(buildRequest({ reciprocityThreshold: 0 }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.reciprocityThreshold).toBe(0)
  })

  // Valor en el límite superior → 200
  it('retorna 200 cuando reciprocityThreshold es 10 (valor máximo)', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })

    const updatedCommunity = {
      id: COMMUNITY_ID,
      reciprocity_threshold: 10,
    }

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'community_members') {
        return mockMembershipAdmin()
      }
      if (table === 'communities') {
        return mockCommunitiesUpdate(updatedCommunity)
      }
      return {}
    })

    const res = await PATCH(buildRequest({ reciprocityThreshold: 10 }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.reciprocityThreshold).toBe(10)
  })

  // Community no encontrada → 404
  it('retorna 404 cuando la community no existe tras el update', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'community_members') {
        return mockMembershipAdmin()
      }
      if (table === 'communities') {
        return mockCommunitiesUpdate(null, { message: 'Not found', code: 'PGRST116' })
      }
      return {}
    })

    const res = await PATCH(buildRequest({ reciprocityThreshold: 5 }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.code).toBe('COMMUNITY_NOT_FOUND')
  })

  // Error genérico de BD (no PGRST116) → 500
  it('retorna 500 cuando la BD devuelve un error inesperado al actualizar', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'community_members') {
        return mockMembershipAdmin()
      }
      if (table === 'communities') {
        return mockCommunitiesUpdate(null, { message: 'Internal error', code: 'PGRST500' })
      }
      return {}
    })

    const res = await PATCH(buildRequest({ reciprocityThreshold: 5 }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.code).toBe('UPDATE_ERROR')
  })
})
