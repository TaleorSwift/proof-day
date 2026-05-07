// Story 13.2 — Tests TDD Outside-In: publishIteration cliente HTTP
// Task 6 — Tests unitarios del cliente HTTP

import { describe, it, expect, vi, afterEach } from 'vitest'
import { publishIteration } from '@/lib/api/project-iterations'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const PROJECT_ID = 'project-uuid-001'

const MOCK_RESULT = { versionNumber: 1 }

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockFetchOk(data: unknown, status = 201) {
  return vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    status,
    json: async () => ({ data }),
  } as Response)
}

function mockFetchError(body: Record<string, unknown>) {
  return vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: false,
    json: async () => body,
  } as Response)
}

// ── Suite: publishIteration ───────────────────────────────────────────────────

describe('publishIteration', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a POST /api/projects/:id/iterations con Content-Type JSON', async () => {
    const fetchSpy = mockFetchOk(MOCK_RESULT)

    await publishIteration(PROJECT_ID, {})

    expect(fetchSpy).toHaveBeenCalledWith(
      `/api/projects/${PROJECT_ID}/iterations`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    )
  })

  it('incluye los datos del formulario en el body de la petición', async () => {
    const fetchSpy = mockFetchOk(MOCK_RESULT)
    const input = { title: 'Nuevo título', description: 'Nueva descripción', hypothesis: 'Nueva hipótesis' }

    await publishIteration(PROJECT_ID, input)

    const [, options] = fetchSpy.mock.calls[0]
    expect(JSON.parse((options as RequestInit).body as string)).toEqual(input)
  })

  it('retorna { versionNumber } cuando la respuesta es ok', async () => {
    mockFetchOk(MOCK_RESULT)

    const result = await publishIteration(PROJECT_ID, {})

    expect(result).toEqual(MOCK_RESULT)
  })

  it('retorna versionNumber = 3 cuando la API devuelve la tercera iteración', async () => {
    mockFetchOk({ versionNumber: 3 })

    const result = await publishIteration(PROJECT_ID, {})

    expect(result.versionNumber).toBe(3)
  })

  it('lanza Error con el mensaje de la API cuando la respuesta no es ok', async () => {
    mockFetchError({ error: 'PROJECT_NOT_FOUND' })

    await expect(publishIteration(PROJECT_ID, {})).rejects.toThrow('PROJECT_NOT_FOUND')
  })

  it('lanza Error con código 401 cuando no está autenticado', async () => {
    mockFetchError({ error: 'AUTH_REQUIRED' })

    await expect(publishIteration(PROJECT_ID, {})).rejects.toThrow('AUTH_REQUIRED')
  })

  it('construye la ruta con el projectId correcto', async () => {
    const fetchSpy = mockFetchOk(MOCK_RESULT)
    const specificProjectId = 'specific-project-abc'

    await publishIteration(specificProjectId, {})

    expect(fetchSpy).toHaveBeenCalledWith(
      `/api/projects/${specificProjectId}/iterations`,
      expect.anything()
    )
  })
})
