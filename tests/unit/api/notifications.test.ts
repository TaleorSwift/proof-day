// Story 12.5 — Tests de las API routes de notificaciones
// TDD Outside-In: tests escritos ANTES de la implementación
//
// GET  /api/notifications
//   - 401 sin auth
//   - 200 con lista de notificaciones (máx 20, ordenadas DESC)
//   - filtro read=false por defecto
//   - ?all=true retorna leídas y no leídas
//
// PATCH /api/notifications/[id]
//   - 401 sin auth
//   - 404 si no existe la notificación
//   - 403 si la notificación pertenece a otro usuario (ownership check)
//   - 200 marca como leída

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ---------------------------------------------------------------------------
// Mocks — hoisted para que las variables estén disponibles en factory
// ---------------------------------------------------------------------------

const { mockGetUser, mockFrom, mockCreateClient } = vi.hoisted(() => {
  const mockGetUser = vi.fn()
  const mockFrom = vi.fn()
  const mockCreateClient = vi.fn().mockReturnValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })
  return { mockGetUser, mockFrom, mockCreateClient }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}))

// ---------------------------------------------------------------------------
// Import handlers bajo test — DESPUÉS de los mocks
// ---------------------------------------------------------------------------

import { GET } from '@/app/api/notifications/route'
import { PATCH } from '@/app/api/notifications/[id]/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const USER_ID = 'user-uuid-001'
const OTHER_USER_ID = 'user-uuid-002'
const NOTIF_ID = 'notif-uuid-001'

const MOCK_USER = { id: USER_ID, email: 'user@example.com' }

const MOCK_NOTIF_ROW = {
  id: NOTIF_ID,
  user_id: USER_ID,
  type: 'ai_synthesis_ready',
  payload: {
    projectId: 'project-001',
    projectSlug: 'my-project',
    projectTitle: 'Mi Proyecto',
    communitySlug: 'startup-madrid',
  },
  read: false,
  created_at: '2026-05-07T10:00:00Z',
}

const MOCK_NOTIF_READ = {
  ...MOCK_NOTIF_ROW,
  id: 'notif-uuid-002',
  read: true,
}

// ---------------------------------------------------------------------------
// Helpers de mocking
// ---------------------------------------------------------------------------

type ChainResult<T> = { data: T | null; error: null | { message: string; code?: string } }

function makeSelectChain<T>(result: ChainResult<T>) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result),
    maybeSingle: vi.fn().mockResolvedValue(result),
    single: vi.fn().mockResolvedValue(result),
  }
}

function makeUpdateChain<T>(result: ChainResult<T>) {
  return {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue(result),
  }
}

// ---------------------------------------------------------------------------
// Setup — restaurar mocks entre tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54321')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'anon-key-test')

  mockGetUser.mockReset()
  mockFrom.mockReset()
  mockCreateClient.mockReturnValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })
})

// ---------------------------------------------------------------------------
// GET /api/notifications — 401 sin auth
// ---------------------------------------------------------------------------

describe('GET /api/notifications — autenticación', () => {
  it('retorna 401 cuando no hay sesión', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const req = new NextRequest('http://localhost/api/notifications')
    const response = await GET(req)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('no consulta notifications cuando no hay sesión', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const req = new NextRequest('http://localhost/api/notifications')
    await GET(req)

    expect(mockFrom).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// GET /api/notifications — 200 con lista
// ---------------------------------------------------------------------------

describe('GET /api/notifications — lista de notificaciones', () => {
  it('retorna 200 con array de notificaciones cuando hay sesión', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

    const chain = makeSelectChain({ data: [MOCK_NOTIF_ROW], error: null })
    mockFrom.mockReturnValue(chain)

    const req = new NextRequest('http://localhost/api/notifications')
    const response = await GET(req)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(Array.isArray(body.data)).toBe(true)
  })

  it('retorna notificaciones mapeadas a camelCase', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

    const chain = makeSelectChain({ data: [MOCK_NOTIF_ROW], error: null })
    mockFrom.mockReturnValue(chain)

    const req = new NextRequest('http://localhost/api/notifications')
    const response = await GET(req)

    const body = await response.json()
    const notif = body.data[0]
    expect(notif.id).toBe(NOTIF_ID)
    expect(notif.userId).toBe(USER_ID)
    expect(notif.read).toBe(false)
    expect(notif.createdAt).toBe('2026-05-07T10:00:00Z')
  })

  it('filtra por read=false por defecto (sin ?all=true)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

    const chain = makeSelectChain({ data: [MOCK_NOTIF_ROW], error: null })
    mockFrom.mockReturnValue(chain)

    const req = new NextRequest('http://localhost/api/notifications')
    await GET(req)

    // Verifica que se llamó a .eq con 'read', false
    const eqCalls = chain.eq.mock.calls as [string, unknown][]
    const hasReadFilter = eqCalls.some(([field, value]) => field === 'read' && value === false)
    expect(hasReadFilter).toBe(true)
  })

  it('con ?all=true NO filtra por read y retorna todas', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

    const chain = makeSelectChain({ data: [MOCK_NOTIF_ROW, MOCK_NOTIF_READ], error: null })
    mockFrom.mockReturnValue(chain)

    const req = new NextRequest('http://localhost/api/notifications?all=true')
    const response = await GET(req)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toHaveLength(2)
  })

  it('con ?all=true NO llama a .eq con read=false', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

    const chain = makeSelectChain({ data: [MOCK_NOTIF_ROW, MOCK_NOTIF_READ], error: null })
    mockFrom.mockReturnValue(chain)

    const req = new NextRequest('http://localhost/api/notifications?all=true')
    await GET(req)

    const eqCalls = chain.eq.mock.calls as [string, unknown][]
    const hasReadFilter = eqCalls.some(([field, value]) => field === 'read' && value === false)
    expect(hasReadFilter).toBe(false)
  })

  it('limita a 20 notificaciones', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

    const chain = makeSelectChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    const req = new NextRequest('http://localhost/api/notifications')
    await GET(req)

    expect(chain.limit).toHaveBeenCalledWith(20)
  })

  it('ordena por created_at DESC', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

    const chain = makeSelectChain({ data: [], error: null })
    mockFrom.mockReturnValue(chain)

    const req = new NextRequest('http://localhost/api/notifications')
    await GET(req)

    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false })
  })
})

// ---------------------------------------------------------------------------
// PATCH /api/notifications/[id] — autenticación
// ---------------------------------------------------------------------------

describe('PATCH /api/notifications/[id] — autenticación', () => {
  it('retorna 401 cuando no hay sesión', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })

    const req = new NextRequest(`http://localhost/api/notifications/${NOTIF_ID}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    })
    const response = await PATCH(req, { params: Promise.resolve({ id: NOTIF_ID }) })

    expect(response.status).toBe(401)
  })
})

// ---------------------------------------------------------------------------
// PATCH /api/notifications/[id] — 404 si no existe
// ---------------------------------------------------------------------------

describe('PATCH /api/notifications/[id] — 404 no encontrado', () => {
  it('retorna 404 cuando la notificación no existe', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

    // Primera llamada (select para ownership): notif no encontrada
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }))

    const req = new NextRequest(`http://localhost/api/notifications/${NOTIF_ID}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    })
    const response = await PATCH(req, { params: Promise.resolve({ id: NOTIF_ID }) })

    expect(response.status).toBe(404)
    const body = await response.json()
    expect(body.error).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// PATCH /api/notifications/[id] — 403 ownership
// ---------------------------------------------------------------------------

describe('PATCH /api/notifications/[id] — 403 ownership', () => {
  it('retorna 403 cuando la notificación pertenece a otro usuario', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

    // Notificación existe pero pertenece a otro usuario
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: NOTIF_ID, user_id: OTHER_USER_ID },
        error: null,
      }),
    }))

    const req = new NextRequest(`http://localhost/api/notifications/${NOTIF_ID}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    })
    const response = await PATCH(req, { params: Promise.resolve({ id: NOTIF_ID }) })

    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error).toBeDefined()
  })

  it('no llama a UPDATE cuando la notificación pertenece a otro usuario', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

    const updateMock = vi.fn().mockReturnThis()
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: NOTIF_ID, user_id: OTHER_USER_ID },
        error: null,
      }),
      update: updateMock,
    }))

    const req = new NextRequest(`http://localhost/api/notifications/${NOTIF_ID}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    })
    await PATCH(req, { params: Promise.resolve({ id: NOTIF_ID }) })

    expect(updateMock).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// PATCH /api/notifications/[id] — 200 éxito
// ---------------------------------------------------------------------------

describe('PATCH /api/notifications/[id] — 200 marca como leída', () => {
  it('retorna 200 cuando la notificación existe y pertenece al usuario', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // SELECT ownership check
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: NOTIF_ID, user_id: USER_ID },
            error: null,
          }),
        }
      }
      // UPDATE
      return {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [{ ...MOCK_NOTIF_ROW, read: true }],
          error: null,
        }),
      }
    })

    const req = new NextRequest(`http://localhost/api/notifications/${NOTIF_ID}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    })
    const response = await PATCH(req, { params: Promise.resolve({ id: NOTIF_ID }) })

    expect(response.status).toBe(200)
    void callCount
  })

  it('retorna la notificación actualizada en camelCase', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: NOTIF_ID, user_id: USER_ID },
            error: null,
          }),
        }
      }
      return {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [{ ...MOCK_NOTIF_ROW, read: true }],
          error: null,
        }),
      }
    })

    const req = new NextRequest(`http://localhost/api/notifications/${NOTIF_ID}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    })
    const response = await PATCH(req, { params: Promise.resolve({ id: NOTIF_ID }) })

    const body = await response.json()
    expect(body.data.id).toBe(NOTIF_ID)
    expect(body.data.read).toBe(true)
    void callCount
  })
})
