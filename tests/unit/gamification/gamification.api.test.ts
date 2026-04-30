import { describe, it, expect, vi, afterEach } from 'vitest'
import { getTopReviewer, getFeedbackCount } from '@/lib/api/gamification'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const COMMUNITY_ID = 'community-uuid-001'

const MOCK_TOP_REVIEWER = {
  userId: 'user-uuid-001',
  name: 'Ana García',
  avatarUrl: null,
  feedbackCount: 5,
}

const MOCK_FEEDBACK_COUNT = {
  count: 3,
  communityId: COMMUNITY_ID,
}

// ---------------------------------------------------------------------------
// Suite: getTopReviewer
// ---------------------------------------------------------------------------

describe('getTopReviewer', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama al endpoint correcto con el communityId como query param', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: MOCK_TOP_REVIEWER }),
    } as Response)

    await getTopReviewer(COMMUNITY_ID)

    expect(fetchSpy).toHaveBeenCalledWith(
      `/api/gamification/top-reviewer?communityId=${COMMUNITY_ID}`
    )
  })

  it('retorna el top reviewer cuando la respuesta es ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: MOCK_TOP_REVIEWER }),
    } as Response)

    const result = await getTopReviewer(COMMUNITY_ID)

    expect(result).toEqual(MOCK_TOP_REVIEWER)
  })

  it('retorna null cuando no hay top reviewer esta semana', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: null }),
    } as Response)

    const result = await getTopReviewer(COMMUNITY_ID)

    expect(result).toBeNull()
  })

  it('lanza Error con el mensaje del servidor cuando la respuesta no es ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'No perteneces a esta comunidad' }),
    } as Response)

    await expect(getTopReviewer(COMMUNITY_ID)).rejects.toThrow(
      'No perteneces a esta comunidad'
    )
  })

  it('usa mensaje genérico cuando la respuesta de error no tiene campo error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response)

    await expect(getTopReviewer(COMMUNITY_ID)).rejects.toThrow(
      'Error al obtener el top reviewer'
    )
  })

  it('usa mensaje genérico cuando el JSON del error no se puede parsear', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => { throw new SyntaxError('Invalid JSON') },
    } as unknown as Response)

    await expect(getTopReviewer(COMMUNITY_ID)).rejects.toThrow(
      'Error al obtener el top reviewer'
    )
  })
})

// ---------------------------------------------------------------------------
// Suite: getFeedbackCount
// ---------------------------------------------------------------------------

describe('getFeedbackCount', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama al endpoint correcto con el communityId como query param', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: MOCK_FEEDBACK_COUNT }),
    } as Response)

    await getFeedbackCount(COMMUNITY_ID)

    expect(fetchSpy).toHaveBeenCalledWith(
      `/api/gamification/feedback-count?communityId=${COMMUNITY_ID}`
    )
  })

  it('retorna las estadísticas de conteo cuando la respuesta es ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: MOCK_FEEDBACK_COUNT }),
    } as Response)

    const result = await getFeedbackCount(COMMUNITY_ID)

    expect(result).toEqual(MOCK_FEEDBACK_COUNT)
  })

  it('lanza Error con el mensaje del servidor cuando la respuesta no es ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Acceso denegado' }),
    } as Response)

    await expect(getFeedbackCount(COMMUNITY_ID)).rejects.toThrow('Acceso denegado')
  })

  it('usa mensaje genérico cuando la respuesta de error no tiene campo error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response)

    await expect(getFeedbackCount(COMMUNITY_ID)).rejects.toThrow(
      'Error al obtener el contador de feedbacks'
    )
  })

  it('usa mensaje genérico cuando el JSON del error no se puede parsear', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => { throw new SyntaxError('Invalid JSON') },
    } as unknown as Response)

    await expect(getFeedbackCount(COMMUNITY_ID)).rejects.toThrow(
      'Error al obtener el contador de feedbacks'
    )
  })
})
