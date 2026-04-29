import { describe, it, expect, vi, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Import tras mocks (fetch se mockea con vi.spyOn antes de cada test)
// ---------------------------------------------------------------------------

import { getProfile, updateProfile } from '@/lib/api/profiles'
import type { ProfileWithStats } from '@/lib/types/profiles'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PROFILE_ID = 'user-uuid-001'

const MOCK_PROFILE: ProfileWithStats = {
  id: PROFILE_ID,
  name: 'Ana García',
  bio: 'Emprendedora',
  interests: ['IA', 'Startups'],
  avatarUrl: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  feedbackCount: 5,
  projectCount: 3,
}

function buildFetchOk(data: unknown) {
  return vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ data }),
  } as Response)
}

function buildFetchError(status: number, errorMessage: string) {
  return vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ error: errorMessage }),
  } as Response)
}

function buildFetchErrorNoJson() {
  return vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: false,
    status: 500,
    json: async () => { throw new Error('no json') },
  } as unknown as Response)
}

// ---------------------------------------------------------------------------
// Suite: getProfile
// ---------------------------------------------------------------------------

describe('getProfile — respuesta exitosa', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a fetch con la URL correcta', async () => {
    const fetchSpy = buildFetchOk(MOCK_PROFILE)

    await getProfile(PROFILE_ID)

    expect(fetchSpy).toHaveBeenCalledWith(`/api/profiles/${PROFILE_ID}`)
  })

  it('retorna el ProfileWithStats cuando la respuesta es ok', async () => {
    buildFetchOk(MOCK_PROFILE)

    const result = await getProfile(PROFILE_ID)

    expect(result).toEqual(MOCK_PROFILE)
  })

  it('retorna el nombre correcto del perfil', async () => {
    buildFetchOk(MOCK_PROFILE)

    const result = await getProfile(PROFILE_ID)

    expect(result.name).toBe('Ana García')
  })
})

describe('getProfile — respuesta con error', () => {
  afterEach(() => vi.restoreAllMocks())

  it('lanza error con el mensaje de la API cuando la respuesta no es ok', async () => {
    buildFetchError(404, 'Perfil no encontrado')

    await expect(getProfile(PROFILE_ID)).rejects.toThrow('Perfil no encontrado')
  })

  it('lanza error con mensaje genérico cuando la API no devuelve error en body', async () => {
    buildFetchErrorNoJson()

    await expect(getProfile(PROFILE_ID)).rejects.toThrow('Error al obtener el perfil')
  })
})

// ---------------------------------------------------------------------------
// Suite: updateProfile
// ---------------------------------------------------------------------------

describe('updateProfile — respuesta exitosa', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a fetch con método PATCH y la URL correcta', async () => {
    const updatedProfile = { ...MOCK_PROFILE, name: 'Nombre actualizado' }
    const fetchSpy = buildFetchOk(updatedProfile)

    await updateProfile(PROFILE_ID, { name: 'Nombre actualizado' })

    expect(fetchSpy).toHaveBeenCalledWith(
      `/api/profiles/${PROFILE_ID}`,
      expect.objectContaining({ method: 'PATCH' })
    )
  })

  it('envía el Content-Type application/json en la cabecera', async () => {
    const fetchSpy = buildFetchOk(MOCK_PROFILE)

    await updateProfile(PROFILE_ID, { name: 'Test' })

    const callArgs = fetchSpy.mock.calls[0]
    expect(callArgs[1]).toMatchObject({
      headers: { 'Content-Type': 'application/json' },
    })
  })

  it('envía el body serializado como JSON', async () => {
    const fetchSpy = buildFetchOk(MOCK_PROFILE)
    const input = { name: 'Nuevo nombre', bio: 'Nueva bio' }

    await updateProfile(PROFILE_ID, input)

    const callArgs = fetchSpy.mock.calls[0]
    expect(callArgs[1]).toMatchObject({ body: JSON.stringify(input) })
  })

  it('retorna el Profile actualizado cuando la respuesta es ok', async () => {
    const updatedProfile = { ...MOCK_PROFILE, name: 'Nombre actualizado' }
    buildFetchOk(updatedProfile)

    const result = await updateProfile(PROFILE_ID, { name: 'Nombre actualizado' })

    expect(result.name).toBe('Nombre actualizado')
  })
})

describe('updateProfile — respuesta con error', () => {
  afterEach(() => vi.restoreAllMocks())

  it('lanza error con el mensaje de la API cuando la respuesta no es ok', async () => {
    buildFetchError(400, 'Datos inválidos')

    await expect(updateProfile(PROFILE_ID, { name: 'x' })).rejects.toThrow('Datos inválidos')
  })

  it('lanza error con mensaje genérico cuando la API no devuelve error en body', async () => {
    buildFetchErrorNoJson()

    await expect(updateProfile(PROFILE_ID, { name: 'x' })).rejects.toThrow(
      'Error al actualizar el perfil'
    )
  })
})
