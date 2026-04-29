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
// Import tras mocks
// ---------------------------------------------------------------------------

import { PATCH } from '@/app/api/projects/[id]/images/reorder/route'
import { PROJECT_IMAGES_MAX_COUNT } from '@/lib/types/projects'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001' }
const PROJECT_ID = 'project-uuid-001'

const CURRENT_IMAGES = [
  `${MOCK_USER.id}/${PROJECT_ID}/img1.jpg`,
  `${MOCK_USER.id}/${PROJECT_ID}/img2.jpg`,
  `${MOCK_USER.id}/${PROJECT_ID}/img3.jpg`,
]

function buildParams(id: string = PROJECT_ID) {
  return { params: Promise.resolve({ id }) }
}

function buildRequest(body: unknown): Request {
  return new Request(`http://localhost/api/projects/${PROJECT_ID}/images/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function buildInvalidJsonRequest(): Request {
  return new Request(`http://localhost/api/projects/${PROJECT_ID}/images/reorder`, {
    method: 'PATCH',
    body: 'no-es-json',
  })
}

function mockNoAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null } })
}

function mockAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
}

function mockProjectFound(imageUrls: string[] = CURRENT_IMAGES) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: PROJECT_ID, builder_id: MOCK_USER.id, image_urls: imageUrls },
          error: null,
        }),
      }),
    }),
  }
}

function mockProjectOtherOwner() {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: PROJECT_ID, builder_id: 'otro-user', image_urls: CURRENT_IMAGES },
          error: null,
        }),
      }),
    }),
  }
}

function mockProjectNotFound() {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
  }
}

// ---------------------------------------------------------------------------
// Suite: PATCH /api/projects/[id]/images/reorder — autenticación
// ---------------------------------------------------------------------------

describe('PATCH /api/projects/[id]/images/reorder — autenticación', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 401 cuando el usuario no está autenticado', async () => {
    mockNoAuth()

    const res = await PATCH(buildRequest({ imagePaths: CURRENT_IMAGES }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.code).toBe('AUTH_REQUIRED')
  })
})

// ---------------------------------------------------------------------------
// Suite: PATCH — validación del body
// ---------------------------------------------------------------------------

describe('PATCH /api/projects/[id]/images/reorder — validación del body', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 400 cuando el body es JSON inválido', async () => {
    mockAuth()

    const res = await PATCH(buildInvalidJsonRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 400 cuando imagePaths no es un array', async () => {
    mockAuth()

    const res = await PATCH(buildRequest({ imagePaths: 'no-es-array' }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it(`retorna 400 cuando imagePaths tiene más de ${PROJECT_IMAGES_MAX_COUNT} elementos`, async () => {
    mockAuth()

    const tooMany = Array.from({ length: PROJECT_IMAGES_MAX_COUNT + 1 }, (_, i) => `img${i}.jpg`)
    const res = await PATCH(buildRequest({ imagePaths: tooMany }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 400 cuando algún path no es un string no vacío', async () => {
    mockAuth()

    const res = await PATCH(buildRequest({ imagePaths: ['valid.jpg', ''] }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })
})

// ---------------------------------------------------------------------------
// Suite: PATCH — verificación de proyecto
// ---------------------------------------------------------------------------

describe('PATCH /api/projects/[id]/images/reorder — verificación de proyecto', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 404 cuando el proyecto no existe', async () => {
    mockAuth()
    supabaseMock.from.mockReturnValue(mockProjectNotFound())

    const res = await PATCH(buildRequest({ imagePaths: CURRENT_IMAGES }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body.code).toBe('PROJECT_NOT_FOUND')
  })

  it('retorna 403 cuando el usuario no es el builder del proyecto', async () => {
    mockAuth()
    supabaseMock.from.mockReturnValue(mockProjectOtherOwner())

    const res = await PATCH(buildRequest({ imagePaths: CURRENT_IMAGES }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.code).toBe('PROJECT_FORBIDDEN')
  })
})

// ---------------------------------------------------------------------------
// Suite: PATCH — validación de paths contra imágenes actuales
// ---------------------------------------------------------------------------

describe('PATCH /api/projects/[id]/images/reorder — mismatch de paths', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 400 cuando imagePaths contiene rutas distintas a las actuales', async () => {
    mockAuth()
    supabaseMock.from.mockReturnValue(mockProjectFound(CURRENT_IMAGES))

    const pathsDistintos = ['img-diferente.jpg', ...CURRENT_IMAGES.slice(1)]
    const res = await PATCH(buildRequest({ imagePaths: pathsDistintos }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('IMAGE_PATHS_MISMATCH')
  })

  it('retorna 400 cuando imagePaths tiene diferente número de elementos que los actuales', async () => {
    mockAuth()
    supabaseMock.from.mockReturnValue(mockProjectFound(CURRENT_IMAGES))

    const res = await PATCH(buildRequest({ imagePaths: CURRENT_IMAGES.slice(0, 2) }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('IMAGE_PATHS_MISMATCH')
  })
})

// ---------------------------------------------------------------------------
// Suite: PATCH — reordenación exitosa
// ---------------------------------------------------------------------------

describe('PATCH /api/projects/[id]/images/reorder — reordenación exitosa', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 200 con success:true al reordenar correctamente', async () => {
    mockAuth()

    const reorderedPaths = [...CURRENT_IMAGES].reverse()

    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) return mockProjectFound(CURRENT_IMAGES)
      return {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }
    })

    const res = await PATCH(buildRequest({ imagePaths: reorderedPaths }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('retorna 500 cuando falla la actualización en BD', async () => {
    mockAuth()

    const reorderedPaths = [...CURRENT_IMAGES].reverse()

    let callCount = 0
    supabaseMock.from.mockImplementation(() => {
      callCount++
      if (callCount === 1) return mockProjectFound(CURRENT_IMAGES)
      return {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: new Error('DB error') }),
        }),
      }
    })

    const res = await PATCH(buildRequest({ imagePaths: reorderedPaths }), buildParams())
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.code).toBe('DB_ERROR')
  })
})
