import { describe, it, expect, vi, afterEach } from 'vitest'
import { createCommunity, getCommunities, ApiError } from '@/lib/api/communities'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_COMMUNITY = {
  id: 'community-uuid-001',
  name: 'Startup Madrid',
  slug: 'startup-madrid',
  description: 'Comunidad de startups en Madrid',
  image_url: null,
  created_by: 'user-uuid-001',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  member_count: 1,
}

const VALID_INPUT = {
  name: 'Startup Madrid',
  description: 'Comunidad de startups en Madrid',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchOk(data: unknown) {
  return vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data }),
  } as Response)
}

function mockFetchError(status: number, body: Record<string, string>) {
  return vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => body,
  } as Response)
}

// ---------------------------------------------------------------------------
// Suite: createCommunity
// ---------------------------------------------------------------------------

describe('createCommunity', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a POST /api/communities con Content-Type JSON', async () => {
    const fetchSpy = mockFetchOk(MOCK_COMMUNITY)

    await createCommunity(VALID_INPUT)

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/communities',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  it('envía el body serializado correctamente', async () => {
    const fetchSpy = mockFetchOk(MOCK_COMMUNITY)

    await createCommunity(VALID_INPUT)

    const [, options] = fetchSpy.mock.calls[0]
    expect(JSON.parse((options as RequestInit).body as string)).toEqual(VALID_INPUT)
  })

  it('retorna los datos de la comunidad creada cuando la respuesta es ok', async () => {
    mockFetchOk(MOCK_COMMUNITY)

    const result = await createCommunity(VALID_INPUT)

    expect(result).toEqual(MOCK_COMMUNITY)
  })

  it('lanza ApiError cuando la respuesta no es ok', async () => {
    mockFetchError(422, { error: 'El nombre ya existe', code: 'DUPLICATE_SLUG' })

    await expect(createCommunity(VALID_INPUT)).rejects.toThrow(ApiError)
  })

  it('lanza ApiError con el mensaje del servidor', async () => {
    mockFetchError(422, { error: 'El nombre ya existe', code: 'DUPLICATE_SLUG' })

    await expect(createCommunity(VALID_INPUT)).rejects.toThrow('El nombre ya existe')
  })

  it('lanza ApiError con el código del servidor', async () => {
    mockFetchError(422, { error: 'El nombre ya existe', code: 'DUPLICATE_SLUG' })

    try {
      await createCommunity(VALID_INPUT)
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      expect((err as ApiError).code).toBe('DUPLICATE_SLUG')
    }
  })

  it('usa mensaje genérico cuando la respuesta de error no tiene campo error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response)

    await expect(createCommunity(VALID_INPUT)).rejects.toThrow('Error al crear la comunidad')
  })

  it('usa mensaje genérico cuando el JSON del error no se puede parsear', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => { throw new SyntaxError('Invalid JSON') },
    } as unknown as Response)

    await expect(createCommunity(VALID_INPUT)).rejects.toThrow('Error al crear la comunidad')
  })
})

// ---------------------------------------------------------------------------
// Suite: getCommunities
// ---------------------------------------------------------------------------

describe('getCommunities', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a GET /api/communities', async () => {
    const fetchSpy = mockFetchOk([MOCK_COMMUNITY])

    await getCommunities()

    expect(fetchSpy).toHaveBeenCalledWith('/api/communities')
  })

  it('retorna el array de comunidades cuando la respuesta es ok', async () => {
    mockFetchOk([MOCK_COMMUNITY])

    const result = await getCommunities()

    expect(result).toEqual([MOCK_COMMUNITY])
  })

  it('retorna array vacío cuando no hay comunidades', async () => {
    mockFetchOk([])

    const result = await getCommunities()

    expect(result).toEqual([])
  })

  it('lanza Error cuando la respuesta no es ok', async () => {
    mockFetchError(500, { error: 'Error interno' })

    await expect(getCommunities()).rejects.toThrow('Error interno')
  })

  it('usa mensaje genérico cuando la respuesta de error no tiene campo error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response)

    await expect(getCommunities()).rejects.toThrow('Error al obtener comunidades')
  })
})
