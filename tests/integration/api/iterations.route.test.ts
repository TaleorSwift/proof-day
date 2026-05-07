import { describe, it, expect, vi, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock de Supabase server — debe ir ANTES de cualquier import del handler
// ---------------------------------------------------------------------------

const { supabaseMock, adminClientMock, mockNotifyPreviousReviewers } = vi.hoisted(() => {
  const supabaseMock = {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  }
  const adminClientMock = {
    from: vi.fn(),
  }
  const mockNotifyPreviousReviewers = vi.fn().mockResolvedValue(undefined)
  return { supabaseMock, adminClientMock, mockNotifyPreviousReviewers }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(supabaseMock),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => adminClientMock),
}))

vi.mock('@/lib/notifications/notify-previous-reviewers', () => ({
  notifyPreviousReviewers: (...args: unknown[]) => mockNotifyPreviousReviewers(...args),
}))

// ---------------------------------------------------------------------------
// Imports tras mocks
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/projects/[id]/iterations/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001' }
const PROJECT_ID = 'project-uuid-001'

const MOCK_PROJECT = {
  id: PROJECT_ID,
  builder_id: MOCK_USER.id,
  status: 'live',
  title: 'Mi proyecto',
  problem: 'Un problema real',
  solution: 'Una solución concreta',
  hypothesis: 'Hipótesis en juego',
  slug: 'mi-proyecto',
  community_id: 'community-uuid-001',
}

const MOCK_ITERATION_ROW = {
  id: 'iteration-uuid-001',
  project_id: PROJECT_ID,
  version_number: 1,
  title: MOCK_PROJECT.title,
  description: `${MOCK_PROJECT.problem}\n\n${MOCK_PROJECT.solution}`,
  hypothesis: MOCK_PROJECT.hypothesis,
  published_at: '2026-05-07T10:00:00Z',
  created_at: '2026-05-07T10:00:00Z',
}

function buildParams(id: string = PROJECT_ID) {
  return { params: Promise.resolve({ id }) }
}

function buildRequest(body: unknown): Request {
  return new Request(`http://localhost/api/projects/${PROJECT_ID}/iterations`, {
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

// Mock encadenado para: from('projects').select(...).eq(...).single()
function mockProjectQuery(projectData: typeof MOCK_PROJECT | null) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: projectData, error: null }),
      }),
    }),
  }
}

// Mock para: from('project_iterations').select('version_number').eq(...).order(...).limit(1).single()
function mockIterationsCountQuery(latestRow: { version_number: number } | null) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: latestRow, error: null }),
          }),
        }),
      }),
    }),
  }
}

// Mock para: from('project_iterations').insert(...).select().single()
function mockIterationsInsert(returnRow: typeof MOCK_ITERATION_ROW | null, error: unknown = null) {
  return {
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: returnRow, error }),
      }),
    }),
  }
}

// Mock para: adminClient.from('communities').select('slug').eq(...).single()
function mockCommunitiesQuery(slug: string | null = 'startup-madrid') {
  adminClientMock.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: slug ? { slug } : null,
          error: null,
        }),
      }),
    }),
  })
}

// ---------------------------------------------------------------------------
// Suite: POST /api/projects/[id]/iterations
// ---------------------------------------------------------------------------

describe('POST /api/projects/[id]/iterations', () => {
  afterEach(() => {
    vi.clearAllMocks()
    mockNotifyPreviousReviewers.mockResolvedValue(undefined)
  })

  it('retorna 401 cuando el usuario no está autenticado', async () => {
    mockNoAuth()

    const res = await POST(buildRequest({}), buildParams())
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.code).toBe('AUTH_REQUIRED')
  })

  it('retorna 404 cuando el proyecto no existe', async () => {
    mockAuth()
    supabaseMock.from.mockReturnValue(mockProjectQuery(null))

    const res = await POST(buildRequest({}), buildParams())
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.code).toBe('PROJECT_NOT_FOUND')
  })

  it('retorna 403 cuando el usuario no es el builder del proyecto', async () => {
    mockAuth()
    supabaseMock.from.mockReturnValue(
      mockProjectQuery({ ...MOCK_PROJECT, builder_id: 'otro-user-id' })
    )

    const res = await POST(buildRequest({}), buildParams())
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.code).toBe('PROJECT_FORBIDDEN')
  })

  it('retorna 422 cuando el proyecto no está en estado live', async () => {
    mockAuth()
    supabaseMock.from.mockReturnValue(
      mockProjectQuery({ ...MOCK_PROJECT, status: 'draft' })
    )

    const res = await POST(buildRequest({}), buildParams())
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.code).toBe('PROJECT_NOT_LIVE')
  })

  it('retorna 201 con version_number = 1 en la primera iteración', async () => {
    mockAuth()
    mockCommunitiesQuery()

    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) return mockProjectQuery(MOCK_PROJECT)
      if (callCount === 2) return mockIterationsCountQuery(null) // sin iteraciones previas
      return mockIterationsInsert(MOCK_ITERATION_ROW)
    })

    const res = await POST(buildRequest({}), buildParams())
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.versionNumber).toBe(1)
  })

  it('retorna 201 con version_number = N + 1 cuando ya hay iteraciones previas', async () => {
    mockAuth()
    mockCommunitiesQuery()

    const iterationRowV3 = { ...MOCK_ITERATION_ROW, version_number: 3 }
    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) return mockProjectQuery(MOCK_PROJECT)
      if (callCount === 2) return mockIterationsCountQuery({ version_number: 2 }) // última = 2
      return mockIterationsInsert(iterationRowV3)
    })

    const res = await POST(buildRequest({}), buildParams())
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.versionNumber).toBe(3)
  })

  it('retorna 201 con los valores del body si se pasan campos editados', async () => {
    mockAuth()
    mockCommunitiesQuery()

    const customTitle = 'Título personalizado de la iteración'
    const customIterationRow = { ...MOCK_ITERATION_ROW, title: customTitle }

    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) return mockProjectQuery(MOCK_PROJECT)
      if (callCount === 2) return mockIterationsCountQuery(null)
      return mockIterationsInsert(customIterationRow)
    })

    const res = await POST(
      buildRequest({ title: customTitle, description: 'Desc custom', hypothesis: 'Hip custom' }),
      buildParams()
    )
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.title).toBe(customTitle)
  })

  it('retorna 201 con valores del proyecto cuando no se pasan campos en el body', async () => {
    mockAuth()
    mockCommunitiesQuery()

    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) return mockProjectQuery(MOCK_PROJECT)
      if (callCount === 2) return mockIterationsCountQuery(null)
      return mockIterationsInsert(MOCK_ITERATION_ROW)
    })

    const res = await POST(buildRequest({}), buildParams())
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data).toBeDefined()
  })

  it('retorna 500 cuando la inserción en BD falla', async () => {
    mockAuth()

    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) return mockProjectQuery(MOCK_PROJECT)
      if (callCount === 2) return mockIterationsCountQuery(null)
      return mockIterationsInsert(null, new Error('DB error'))
    })

    const res = await POST(buildRequest({}), buildParams())
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.code).toBe('ITERATION_CREATE_ERROR')
  })

  it('retorna 409 cuando la inserción falla por conflicto UNIQUE en version_number (code 23505)', async () => {
    mockAuth()

    const uniqueConstraintError = { code: '23505', message: 'duplicate key value violates unique constraint' }

    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) return mockProjectQuery(MOCK_PROJECT)
      if (callCount === 2) return mockIterationsCountQuery(null)
      return mockIterationsInsert(null, uniqueConstraintError)
    })

    const res = await POST(buildRequest({}), buildParams())
    const body = await res.json()

    expect(res.status).toBe(409)
    expect(body.code).toBe('VERSION_CONFLICT')
  })

  // Story 13.3 — Verificar que notifyPreviousReviewers se dispara en el happy path 201
  it('dispara notifyPreviousReviewers con los parámetros correctos en el happy path 201', async () => {
    mockAuth()
    mockCommunitiesQuery('startup-madrid')

    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) return mockProjectQuery(MOCK_PROJECT)
      if (callCount === 2) return mockIterationsCountQuery(null)
      return mockIterationsInsert(MOCK_ITERATION_ROW)
    })

    const res = await POST(buildRequest({}), buildParams())

    expect(res.status).toBe(201)
    expect(mockNotifyPreviousReviewers).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: PROJECT_ID,
        builderId: MOCK_USER.id,
        projectSlug: MOCK_PROJECT.slug,
        projectTitle: MOCK_PROJECT.title,
        versionNumber: 1,
        communitySlug: 'startup-madrid',
      })
    )
  })
})
