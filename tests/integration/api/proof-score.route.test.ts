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

import { GET } from '@/app/api/proof-score/[projectId]/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001' }
const PROJECT_ID = 'project-uuid-001'
const ITERATION_ID = 'iteration-uuid-001'

function buildParams(projectId: string = PROJECT_ID) {
  return { params: Promise.resolve({ projectId }) }
}

function buildRequest(): Request {
  return new Request(`http://localhost/api/proof-score/${PROJECT_ID}`)
}

function mockNoAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null } })
}

function mockAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
}

/**
 * Construye el mock de project_iterations que devuelve una iteración concreta.
 * Devuelve el builder completo (select → eq → order → limit → maybeSingle).
 */
function buildIterationMock(iterationData: { id: string } | null) {
  const maybeSingleMock = vi.fn().mockResolvedValue({ data: iterationData, error: null })
  const limitMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
  const orderMock = vi.fn().mockReturnValue({ limit: limitMock })
  const eqMock = vi.fn().mockReturnValue({ order: orderMock })
  const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
  return { select: selectMock }
}

/**
 * Construye el mock de feedbacks sin filtro de iteración (solo eq project_id).
 */
function buildFeedbacksMockNoIteration(feedbackData: unknown[], error?: Error) {
  const eqMock = vi.fn().mockResolvedValue({ data: error ? null : feedbackData, error: error ?? null })
  return { select: vi.fn().mockReturnValue({ eq: eqMock }) }
}

/**
 * Construye el mock de feedbacks con filtro de iteración (eq project_id + eq iteration_id).
 */
function buildFeedbacksMockWithIteration(feedbackData: unknown[], error?: Error) {
  const eqIterationMock = vi.fn().mockResolvedValue({ data: error ? null : feedbackData, error: error ?? null })
  const eqProjectMock = vi.fn().mockReturnValue({ eq: eqIterationMock })
  return { select: vi.fn().mockReturnValue({ eq: eqProjectMock }) }
}

// ---------------------------------------------------------------------------
// Suite: GET /api/proof-score/[projectId]
// ---------------------------------------------------------------------------

describe('GET /api/proof-score/[projectId]', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 401 cuando el usuario no está autenticado', async () => {
    mockNoAuth()

    const res = await GET(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.code).toBe('AUTH_REQUIRED')
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

    const res = await GET(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.code).toBe('PROJECT_NOT_FOUND')
  })

  it('retorna 403 cuando el usuario no es el builder del proyecto', async () => {
    mockAuth()

    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: PROJECT_ID, builder_id: 'otro-user' },
            error: null,
          }),
        }),
      }),
    })

    const res = await GET(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.code).toBe('PROOF_SCORE_FORBIDDEN')
  })

  it('retorna 500 cuando Supabase falla al obtener los feedbacks', async () => {
    mockAuth()

    let callCount = 0
    supabaseMock.from.mockImplementation((table: string) => {
      callCount++
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
      if (table === 'project_iterations') {
        return buildIterationMock(null)
      }
      // feedbacks — simula error de BD
      return buildFeedbacksMockNoIteration([], new Error('DB error'))
    })

    const res = await GET(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.code).toBe('FEEDBACKS_FETCH_ERROR')
  })

  it('retorna 200 con el proof score calculado usando feedbacks de la iteración más reciente cuando existe iteración', async () => {
    mockAuth()

    const mockFeedbacks = [
      { scores: { p1: 3, p2: 2, p3: 3 } },
      { scores: { p1: 2, p2: 3, p3: 2 } },
    ]

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
      if (table === 'project_iterations') {
        return buildIterationMock({ id: ITERATION_ID })
      }
      // feedbacks — con filtro de iteración
      return buildFeedbacksMockWithIteration(mockFeedbacks)
    })

    const res = await GET(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toBeDefined()
  })

  it('retorna 200 usando todos los feedbacks del proyecto cuando no hay iteraciones', async () => {
    mockAuth()

    const mockFeedbacks = [
      { scores: { p1: 3, p2: 2, p3: 3 } },
    ]

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
      if (table === 'project_iterations') {
        return buildIterationMock(null)
      }
      // feedbacks — sin filtro de iteración (fallback)
      return buildFeedbacksMockNoIteration(mockFeedbacks)
    })

    const res = await GET(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toBeDefined()
  })

  it('retorna 200 con score calculado para proyecto sin feedbacks y sin iteraciones', async () => {
    mockAuth()

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
      if (table === 'project_iterations') {
        return buildIterationMock(null)
      }
      return buildFeedbacksMockNoIteration([])
    })

    const res = await GET(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toBeDefined()
  })

  it('retorna 200 con 0 feedbacks cuando la iteración más reciente no tiene feedbacks', async () => {
    mockAuth()

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
      if (table === 'project_iterations') {
        return buildIterationMock({ id: ITERATION_ID })
      }
      // Iteración más reciente sin feedbacks
      return buildFeedbacksMockWithIteration([])
    })

    const res = await GET(buildRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.data).toBeDefined()
  })
})
