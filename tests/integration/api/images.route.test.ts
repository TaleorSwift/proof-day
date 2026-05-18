import { describe, it, expect, vi, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock de Supabase server
// ---------------------------------------------------------------------------

const { supabaseMock } = vi.hoisted(() => {
  const storageChain = {
    upload: vi.fn(),
    getPublicUrl: vi.fn(),
    remove: vi.fn(),
  }
  const supabaseMock = {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
    storage: { from: vi.fn().mockReturnValue(storageChain), _chain: storageChain },
  }
  return { supabaseMock }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(supabaseMock),
}))

// ---------------------------------------------------------------------------
// Imports tras mocks
// ---------------------------------------------------------------------------

import { POST, DELETE } from '@/app/api/projects/[id]/images/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001' }
const PROJECT_ID = 'project-uuid-001'
const PUBLIC_URL = 'https://storage.example.com/project-images/u/p/img.jpg'

function buildParams(id: string = PROJECT_ID) {
  return { params: Promise.resolve({ id }) }
}

function buildFileRequest(fileContent = 'image-data', fileName = 'foto.jpg', fileType = 'image/jpeg'): Request {
  const formData = new FormData()
  const file = new File([fileContent], fileName, { type: fileType })
  formData.append('file', file)
  return new Request(`http://localhost/api/projects/${PROJECT_ID}/images`, {
    method: 'POST',
    body: formData,
  })
}

function buildDeleteRequest(path: string): Request {
  return new Request(`http://localhost/api/projects/${PROJECT_ID}/images`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path }),
  })
}

function mockNoAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null } })
}

function mockAuth() {
  supabaseMock.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
}

function mockProjectFound(imageUrls: string[] = []) {
  return {
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: PROJECT_ID, builder_id: MOCK_USER.id, image_urls: imageUrls, status: 'draft' },
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
// Suite: POST /api/projects/[id]/images
// ---------------------------------------------------------------------------

describe('POST /api/projects/[id]/images', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 401 cuando el usuario no está autenticado', async () => {
    mockNoAuth()

    const res = await POST(buildFileRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.code).toBe('AUTH_REQUIRED')
  })

  it('retorna 404 cuando el proyecto no existe', async () => {
    mockAuth()
    supabaseMock.from.mockReturnValue(mockProjectNotFound())

    const res = await POST(buildFileRequest(), buildParams())
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
            data: { id: PROJECT_ID, builder_id: 'otro-user', image_urls: [], status: 'draft' },
            error: null,
          }),
        }),
      }),
    })

    const res = await POST(buildFileRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.code).toBe('PROJECT_FORBIDDEN')
  })

  it('retorna 422 cuando el proyecto ya tiene 5 imágenes', async () => {
    mockAuth()
    supabaseMock.from.mockReturnValue(
      mockProjectFound(['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg', 'e.jpg'])
    )

    const res = await POST(buildFileRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(422)
    expect(body.code).toBe('PROJECT_IMAGES_LIMIT')
  })

  it('retorna 400 cuando el formato del archivo no es válido', async () => {
    mockAuth()
    supabaseMock.from.mockReturnValue(mockProjectFound())

    const res = await POST(buildFileRequest('data', 'foto.bmp', 'image/bmp'), buildParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 400 cuando no se adjunta ningún archivo', async () => {
    mockAuth()
    supabaseMock.from.mockReturnValue(mockProjectFound())

    const req = new Request(`http://localhost/api/projects/${PROJECT_ID}/images`, {
      method: 'POST',
      body: new FormData(), // sin file
    })
    const res = await POST(req, buildParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 201 con url y path cuando el upload es exitoso', async () => {
    mockAuth()

    let fromCallCount = 0
    supabaseMock.from.mockImplementation(() => {
      fromCallCount++
      if (fromCallCount === 1) return mockProjectFound()
      // Segunda llamada: update image_urls
      return {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }
    })

    supabaseMock.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: PUBLIC_URL } }),
      remove: vi.fn().mockResolvedValue({ error: null }),
    })

    const res = await POST(buildFileRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.data.url).toBe(PUBLIC_URL)
    expect(typeof body.data.path).toBe('string')
  })

  it('retorna 500 y hace rollback cuando falla la actualización en BD', async () => {
    mockAuth()

    let fromCallCount = 0
    supabaseMock.from.mockImplementation(() => {
      fromCallCount++
      if (fromCallCount === 1) return mockProjectFound()
      return {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: new Error('DB error') }),
        }),
      }
    })

    const removeMock = vi.fn().mockResolvedValue({ error: null })
    supabaseMock.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: PUBLIC_URL } }),
      remove: removeMock,
    })

    const res = await POST(buildFileRequest(), buildParams())
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(body.code).toBe('DB_UPDATE_ERROR')
    // Verifica que se intentó el rollback
    expect(removeMock).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Suite: DELETE /api/projects/[id]/images
// ---------------------------------------------------------------------------

describe('DELETE /api/projects/[id]/images', () => {
  afterEach(() => vi.clearAllMocks())

  it('retorna 401 cuando el usuario no está autenticado', async () => {
    mockNoAuth()

    const res = await DELETE(buildDeleteRequest('u/p/img.jpg'), buildParams())
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.code).toBe('AUTH_REQUIRED')
  })

  it('retorna 400 cuando el body es JSON inválido', async () => {
    mockAuth()

    const req = new Request(`http://localhost/api/projects/${PROJECT_ID}/images`, {
      method: 'DELETE',
      body: 'no-es-json',
    })
    const res = await DELETE(req, buildParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('VALIDATION_ERROR')
  })

  it('retorna 403 cuando el usuario no es el builder del proyecto', async () => {
    mockAuth()
    supabaseMock.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: PROJECT_ID, builder_id: 'otro-user', image_urls: ['u/p/img.jpg'] },
            error: null,
          }),
        }),
      }),
    })

    const res = await DELETE(buildDeleteRequest('u/p/img.jpg'), buildParams())
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.code).toBe('PROJECT_FORBIDDEN')
  })

  it('retorna 400 cuando la imagen no pertenece al proyecto', async () => {
    mockAuth()
    supabaseMock.from.mockReturnValue(mockProjectFound(['u/p/otra-imagen.jpg']))

    const res = await DELETE(buildDeleteRequest('u/p/img.jpg'), buildParams())
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('IMAGE_NOT_FOUND')
  })

  it('retorna 200 cuando la imagen se elimina correctamente', async () => {
    mockAuth()
    const imagePath = `${MOCK_USER.id}/${PROJECT_ID}/foto.jpg`

    let fromCallCount = 0
    supabaseMock.from.mockImplementation(() => {
      fromCallCount++
      if (fromCallCount === 1) return mockProjectFound([imagePath])
      return {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }
    })

    supabaseMock.storage.from.mockReturnValue({
      remove: vi.fn().mockResolvedValue({ error: null }),
    })

    const res = await DELETE(buildDeleteRequest(imagePath), buildParams())
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })
})
