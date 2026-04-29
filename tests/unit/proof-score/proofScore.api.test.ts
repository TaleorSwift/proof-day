import { describe, it, expect, vi, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Import tras mocks (fetch se mockea con vi.spyOn)
// ---------------------------------------------------------------------------

import { getProofScore } from '@/lib/api/proof-score'
import type { ProofScoreResult } from '@/lib/types/proof-score'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PROJECT_ID = 'project-uuid-001'

const MOCK_PROOF_SCORE: ProofScoreResult = {
  label: 'Promising',
  average: 4.2,
  feedbackCount: 8,
}

function buildFetchOk(data: unknown) {
  return vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ data }),
  } as Response)
}

function buildFetchError(errorMessage: string) {
  return vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: false,
    status: 404,
    json: async () => ({ error: errorMessage }),
  } as Response)
}

// ---------------------------------------------------------------------------
// Suite: getProofScore — respuesta exitosa
// ---------------------------------------------------------------------------

describe('getProofScore — respuesta exitosa', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a fetch con la URL correcta para el proyecto', async () => {
    const fetchSpy = buildFetchOk(MOCK_PROOF_SCORE)

    await getProofScore(PROJECT_ID)

    expect(fetchSpy).toHaveBeenCalledWith(`/api/proof-score/${PROJECT_ID}`)
  })

  it('retorna el ProofScoreResult cuando la respuesta es ok', async () => {
    buildFetchOk(MOCK_PROOF_SCORE)

    const result = await getProofScore(PROJECT_ID)

    expect(result).toEqual(MOCK_PROOF_SCORE)
  })

  it('retorna el label correcto del proof score', async () => {
    buildFetchOk(MOCK_PROOF_SCORE)

    const result = await getProofScore(PROJECT_ID)

    expect(result?.label).toBe('Promising')
  })

  it('retorna el average y feedbackCount correctos', async () => {
    buildFetchOk(MOCK_PROOF_SCORE)

    const result = await getProofScore(PROJECT_ID)

    expect(result?.average).toBe(4.2)
    expect(result?.feedbackCount).toBe(8)
  })

  it('retorna null cuando data es null (proof score aún no calculado)', async () => {
    buildFetchOk(null)

    const result = await getProofScore(PROJECT_ID)

    expect(result).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Suite: getProofScore — labels disponibles
// ---------------------------------------------------------------------------

describe('getProofScore — labels disponibles', () => {
  afterEach(() => vi.restoreAllMocks())

  it('maneja correctamente el label "Needs iteration"', async () => {
    buildFetchOk({ label: 'Needs iteration', average: 2.5, feedbackCount: 4 })

    const result = await getProofScore(PROJECT_ID)

    expect(result?.label).toBe('Needs iteration')
  })

  it('maneja correctamente el label "Weak"', async () => {
    buildFetchOk({ label: 'Weak', average: 1.2, feedbackCount: 2 })

    const result = await getProofScore(PROJECT_ID)

    expect(result?.label).toBe('Weak')
  })
})

// ---------------------------------------------------------------------------
// Suite: getProofScore — respuesta con error
// ---------------------------------------------------------------------------

describe('getProofScore — respuesta con error', () => {
  afterEach(() => vi.restoreAllMocks())

  it('lanza error con el mensaje de la API cuando la respuesta no es ok', async () => {
    buildFetchError('Proyecto no encontrado')

    await expect(getProofScore(PROJECT_ID)).rejects.toThrow('Proyecto no encontrado')
  })

  it('lanza error cuando la API retorna 500 con mensaje genérico', async () => {
    buildFetchError('Error interno del servidor')

    await expect(getProofScore(PROJECT_ID)).rejects.toThrow('Error interno del servidor')
  })
})
