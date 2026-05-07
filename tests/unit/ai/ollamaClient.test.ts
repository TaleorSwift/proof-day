import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Tests — OllamaClient (TDD Outside-In)
// Story 12.2 — AC1, AC2
// ---------------------------------------------------------------------------

describe('OllamaClient', () => {
  const MOCK_OLLAMA_RESPONSE = {
    response: 'Respuesta del modelo',
    eval_count: 150,
    prompt_eval_count: 200,
  }

  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('OLLAMA_BASE_URL', 'http://localhost:11434')
    vi.stubEnv('OLLAMA_MODEL', 'qwen2.5:3b')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('llama a POST /api/generate con la URL base correcta', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_OLLAMA_RESPONSE,
    } as Response)

    const { getOllamaClient } = await import('@/lib/ai/ollamaClient')
    const client = getOllamaClient()
    await client.generate('test prompt')

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://localhost:11434/api/generate',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('envía el body correcto con model, prompt y stream: false', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_OLLAMA_RESPONSE,
    } as Response)

    const { getOllamaClient } = await import('@/lib/ai/ollamaClient')
    const client = getOllamaClient()
    await client.generate('prompt de prueba')

    const callArgs = fetchSpy.mock.calls[0]
    const body = JSON.parse(callArgs[1]?.body as string)
    expect(body).toEqual({
      model: 'qwen2.5:3b',
      prompt: 'prompt de prueba',
      stream: false,
    })
  })

  it('retorna OllamaResponse con response, eval_count y prompt_eval_count', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_OLLAMA_RESPONSE,
    } as Response)

    const { getOllamaClient } = await import('@/lib/ai/ollamaClient')
    const client = getOllamaClient()
    const result = await client.generate('prompt')

    expect(result).toEqual(MOCK_OLLAMA_RESPONSE)
  })

  it('lanza error cuando la respuesta HTTP no es ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response)

    const { getOllamaClient } = await import('@/lib/ai/ollamaClient')
    const client = getOllamaClient()

    await expect(client.generate('prompt')).rejects.toThrow()
  })

  it('retorna el singleton — misma referencia en dos llamadas a getOllamaClient', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => MOCK_OLLAMA_RESPONSE,
    } as Response)

    const { getOllamaClient } = await import('@/lib/ai/ollamaClient')
    const client1 = getOllamaClient()
    const client2 = getOllamaClient()

    expect(client1).toBe(client2)
  })

  it('usa OLLAMA_BASE_URL custom si está definida', async () => {
    vi.resetModules()
    vi.stubEnv('OLLAMA_BASE_URL', 'http://custom-host:11434')
    vi.stubEnv('OLLAMA_MODEL', 'qwen2.5:3b')

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => MOCK_OLLAMA_RESPONSE,
    } as Response)

    const { getOllamaClient } = await import('@/lib/ai/ollamaClient')
    const client = getOllamaClient()
    await client.generate('prompt')

    expect(fetchSpy).toHaveBeenCalledWith(
      'http://custom-host:11434/api/generate',
      expect.anything()
    )
  })
})
