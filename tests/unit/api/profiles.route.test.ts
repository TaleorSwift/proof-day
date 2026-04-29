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

import { GET, PATCH } from '@/app/api/profiles/[id]/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001' }
const OTHER_USER_ID = 'user-uuid-002'

const MOCK_PROFILE = {
  id: MOCK_USER.id,
  name: 'Ana García',
  bio: 'Apasionada del desarrollo',
  interests: ['tech', 'startups'],
  avatar_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

function buildParams(id: string = MOCK_USER.id) {
  return { params: Promise.resolve({ id }) }
}

function buildGetRequest(): Request {
  return new Request(`http://localhost/api/profiles/${MOCK_USER.id}`)
}

function buildPatchRequest(id: string, body: unknown): Request {
  return new Request(`http://localhost/api/profiles/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function mockNoAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null } })
}

function mockAuth(userId = MOCK_USER.id) {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: { id: userId } } })
}

// ---------------------------------------------------------------------------
// Suite: GET /api/profiles/[id]
// ---------------------------------------------------------------------------

describe('GET /api/profiles/[id]', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 401 cuando el usuario no está autenticado', async () => {
    mockNoAuth()

    const res = await GET(buildGetRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.code).toBe('AUTH_REQUIRED')
  })

  it('retorna 200 con el perfil propio sin verificar comunidades compartidas', async () => {
    mockAuth()

    let fromCallCount = 0
    supabaseMock.from.mockImplementation((table: string) => {
      fromCallCount++
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: MOCK_PROFILE, error: null }),
            }),
          }),
        }
      }
      // Para los contadores (feedbacks y projects)
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
        }),
      }
    })

    const res = await GET(buildGetRequest(), buildParams(MOCK_USER.id))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.id).toBe(MOCK_USER.id)
    expect(body.data.name).toBe('Ana García')
  })

  it('retorna 403 cuando el usuario intenta ver un perfil sin comunidad compartida', async () => {
    mockAuth()

    // El route construye la query anidada de la siguiente manera:
    // const { data: shared } = await supabase
    //   .from('community_members')   ← outer from (callCount=1)
    //   .select('community_id')
    //   .eq('user_id', user.id)
    //   .in('community_id', (await supabase
    //     .from('community_members')  ← inner from (callCount=2, se resuelve como argumento)
    //     .select('community_id')
    //     .eq('user_id', id)
    //   ).data?.map(...) ?? [])
    //   .limit(1)
    //
    // JavaScript evalúa los argumentos ANTES de llamar a la función:
    // → outer from() se llama primero (construye la chain)
    // → inner from() se llama segundo (como argumento del .in(), resuelto con await)
    // → .in() se llama con el resultado de la inner query
    // Por tanto: callCount=1 → outer (necesita .select().eq().in().limit()), callCount=2 → inner

    let callCount = 0
    supabaseMock.from.mockImplementation((table: string) => {
      if (table !== 'community_members') return {}

      callCount++
      if (callCount === 1) {
        // Outer query: necesita encadenar .select().eq().in().limit()
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              in: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          }),
        }
      }

      // Inner subquery (argumento del .in()): .select().eq() → awaitable con data=[]
      const innerChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        data: [] as unknown[],
        error: null,
        then: (resolve: (v: { data: unknown[]; error: null }) => void) =>
          Promise.resolve({ data: [], error: null }).then(resolve),
      }
      return innerChain
    })

    const res = await GET(buildGetRequest(), buildParams(OTHER_USER_ID))
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.code).toBe('COMMUNITY_ACCESS_DENIED')
  })

  it('retorna 404 cuando el perfil no existe', async () => {
    mockAuth()

    // Simular que la ruta es el propio perfil (mismo userId) pero no existe en BD
    supabaseMock.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: new Error('not found') }),
        }),
      }),
    }))

    const res = await GET(buildGetRequest(), buildParams(MOCK_USER.id))
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.code).toBe('PROFILE_NOT_FOUND')
  })

  it('retorna feedbackCount y projectCount en la respuesta', async () => {
    mockAuth()

    let profileCalled = false
    let countCalls = 0
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'profiles' && !profileCalled) {
        profileCalled = true
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: MOCK_PROFILE, error: null }),
            }),
          }),
        }
      }
      countCalls++
      const countValue = table === 'feedbacks' ? 5 : 2
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: countValue, error: null }),
        }),
      }
    })

    const res = await GET(buildGetRequest(), buildParams(MOCK_USER.id))
    const body = await res.json()

    expect(body.data.feedbackCount).toBe(5)
    expect(body.data.projectCount).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// Suite: PATCH /api/profiles/[id]
// ---------------------------------------------------------------------------

describe('PATCH /api/profiles/[id]', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 401 cuando el usuario no está autenticado', async () => {
    mockNoAuth()

    const res = await PATCH(buildPatchRequest(MOCK_USER.id, { name: 'Nuevo nombre' }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.code).toBe('AUTH_REQUIRED')
  })

  it('retorna 403 cuando intenta editar el perfil de otro usuario', async () => {
    mockAuth()

    const res = await PATCH(buildPatchRequest(OTHER_USER_ID, { name: 'x' }), buildParams(OTHER_USER_ID))
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.code).toBe('FORBIDDEN')
  })

  it('retorna 400 cuando el body es JSON inválido', async () => {
    mockAuth()

    const req = new Request(`http://localhost/api/profiles/${MOCK_USER.id}`, {
      method: 'PATCH',
      body: 'no-es-json',
    })
    const res = await PATCH(req, buildParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('INVALID_JSON')
  })

  it('retorna 400 cuando los datos no pasan validación Zod', async () => {
    mockAuth()

    const res = await PATCH(
      buildPatchRequest(MOCK_USER.id, { name: 'x'.repeat(200) }), // demasiado largo
      buildParams()
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 200 con el perfil actualizado cuando los datos son válidos', async () => {
    mockAuth()

    const updatedProfile = { ...MOCK_PROFILE, name: 'Nombre actualizado' }
    supabaseMock.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: updatedProfile, error: null }),
          }),
        }),
      }),
    })

    const res = await PATCH(
      buildPatchRequest(MOCK_USER.id, { name: 'Nombre actualizado' }),
      buildParams()
    )
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data.name).toBe('Nombre actualizado')
  })
})
