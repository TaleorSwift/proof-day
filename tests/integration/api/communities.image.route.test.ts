import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const { supabaseMock } = vi.hoisted(() => {
  const storageChain = {
    upload: vi.fn(),
    getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://proj.supabase.co/storage/v1/object/public/community-images/uid/temp/img.jpg' } }),
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

// mock de require-auth para simplificar — lo reutilizamos de fetchExternalImage
vi.mock('@/lib/api/middleware/require-auth', () => ({
  requireAuth: vi.fn(),
}))

vi.mock('@/lib/services/communities.service', () => ({
  createCommunitiesService: vi.fn().mockReturnValue({
    generateUniqueSlug: vi.fn().mockResolvedValue({ ok: true, slug: 'mi-comunidad' }),
  }),
}))

// Mock de saveExternalImageToBucket — aísla descarga + upload del Storage
vi.mock('@/lib/utils/saveExternalImageToBucket', () => ({
  saveExternalImageToBucket: vi.fn(),
}))

// Mock de ImageFetchError para poder instanciar en tests
vi.mock('@/lib/utils/fetchExternalImage', () => ({
  fetchExternalImage: vi.fn(),
  ImageFetchError: class ImageFetchError extends Error {
    code: string
    constructor(message: string, code: string) {
      super(message)
      this.name = 'ImageFetchError'
      this.code = code
    }
  },
}))

import { requireAuth } from '@/lib/api/middleware/require-auth'
import { saveExternalImageToBucket } from '@/lib/utils/saveExternalImageToBucket'
import { ImageFetchError } from '@/lib/utils/fetchExternalImage'
import { POST } from '@/app/api/communities/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-001' }
const SUPABASE_STORAGE_URL = 'https://proj.supabase.co/storage/v1/object/public/community-images/u/t/img.jpg'
const EXTERNAL_IMAGE_URL = 'https://secture.com/wp-content/uploads/logo.png'

function buildRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost/api/communities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function mockAuthOk() {
  vi.mocked(requireAuth).mockResolvedValue({
    user: MOCK_USER,
    supabase: supabaseMock,
    error: null,
  } as never)
}

function mockDbInsert(communityData: Record<string, unknown> = {}) {
  const defaultCommunity = {
    id: 'comm-uuid-001',
    name: 'Mi Comunidad',
    slug: 'mi-comunidad',
    description: 'Desc',
    image_url: null,
    created_by: MOCK_USER.id,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    ...communityData,
  }
  supabaseMock.from.mockReturnValue({
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: defaultCommunity, error: null }),
      }),
    }),
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  })
}

// ---------------------------------------------------------------------------
// Tests: POST /api/communities — imagen
// ---------------------------------------------------------------------------

describe('POST /api/communities — imagen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321'
    supabaseMock.storage._chain.upload.mockResolvedValue({ error: null })
    supabaseMock.storage._chain.getPublicUrl.mockReturnValue({
      data: { publicUrl: SUPABASE_STORAGE_URL },
    })
  })

  afterEach(() => vi.clearAllMocks())

  it('acepta una URL que ya es de Supabase Storage sin descargarla', async () => {
    mockAuthOk()
    mockDbInsert({ image_url: SUPABASE_STORAGE_URL })
    // La URL ya apunta a nuestro Storage local (NEXT_PUBLIC_SUPABASE_URL = http://127.0.0.1:54321)
    const ownStorageUrl = 'http://127.0.0.1:54321/storage/v1/object/public/community-images/u/t/img.jpg'

    const res = await POST(buildRequest({
      name: 'Mi Comunidad',
      description: 'Desc',
      imageUrl: ownStorageUrl,
    }))

    expect(res.status).toBe(201)
    expect(vi.mocked(saveExternalImageToBucket)).not.toHaveBeenCalled()
  })

  it('descarga y guarda al Storage una URL externa válida', async () => {
    mockAuthOk()
    mockDbInsert({ image_url: SUPABASE_STORAGE_URL })

    vi.mocked(saveExternalImageToBucket).mockResolvedValue(SUPABASE_STORAGE_URL)

    const res = await POST(buildRequest({
      name: 'Mi Comunidad',
      description: 'Desc',
      imageUrl: EXTERNAL_IMAGE_URL,
    }))

    expect(res.status).toBe(201)
    expect(vi.mocked(saveExternalImageToBucket)).toHaveBeenCalledWith(EXTERNAL_IMAGE_URL, MOCK_USER.id)
  })

  it('retorna 400 con código IMAGE_BLOCKED_HOST si la URL es de un host privado', async () => {
    mockAuthOk()

    vi.mocked(saveExternalImageToBucket).mockRejectedValue(
      new ImageFetchError('Host no permitido', 'IMAGE_BLOCKED_HOST'),
    )

    const res = await POST(buildRequest({
      name: 'Mi Comunidad',
      description: 'Desc',
      imageUrl: 'https://192.168.1.1/image.jpg',
    }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('IMAGE_BLOCKED_HOST')
  })

  it('retorna 400 con código IMAGE_TOO_LARGE si la imagen supera 5MB', async () => {
    mockAuthOk()

    vi.mocked(saveExternalImageToBucket).mockRejectedValue(
      new ImageFetchError('La imagen supera el tamaño máximo de 5MB', 'IMAGE_TOO_LARGE'),
    )

    const res = await POST(buildRequest({
      name: 'Mi Comunidad',
      description: 'Desc',
      imageUrl: EXTERNAL_IMAGE_URL,
    }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('IMAGE_TOO_LARGE')
  })

  it('retorna 400 con código IMAGE_INVALID_TYPE si el Content-Type no es imagen', async () => {
    mockAuthOk()

    vi.mocked(saveExternalImageToBucket).mockRejectedValue(
      new ImageFetchError('Tipo de imagen no válido', 'IMAGE_INVALID_TYPE'),
    )

    const res = await POST(buildRequest({
      name: 'Mi Comunidad',
      description: 'Desc',
      imageUrl: EXTERNAL_IMAGE_URL,
    }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.code).toBe('IMAGE_INVALID_TYPE')
  })

  it('crea la comunidad sin imagen cuando no se provee imageUrl', async () => {
    mockAuthOk()
    mockDbInsert()

    const res = await POST(buildRequest({
      name: 'Mi Comunidad',
      description: 'Desc',
    }))

    expect(res.status).toBe(201)
    expect(vi.mocked(saveExternalImageToBucket)).not.toHaveBeenCalled()
  })
})
