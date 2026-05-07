// Story 12.2 — Cliente HTTP singleton para Ollama
// AC1: singleton, usa OLLAMA_BASE_URL y OLLAMA_MODEL de env vars
// AC2: método generate(prompt) — POST a /api/generate

/** Respuesta de la API de Ollama al generar texto */
export interface OllamaResponse {
  response: string
  eval_count: number
  prompt_eval_count: number
}

/** Cliente HTTP para la API de Ollama */
export interface OllamaClient {
  generate(prompt: string): Promise<OllamaResponse>
}

class OllamaHttpClient implements OllamaClient {
  private readonly baseUrl: string
  private readonly model: string

  constructor(baseUrl: string, model: string) {
    this.baseUrl = baseUrl
    this.model = model
  }

  async generate(prompt: string): Promise<OllamaResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(
        `Ollama error ${response.status}: ${response.statusText}`
      )
    }

    return response.json() as Promise<OllamaResponse>
  }
}

// Singleton — una instancia por proceso Node
let instance: OllamaClient | null = null

/**
 * Retorna el singleton del cliente Ollama.
 * Usa OLLAMA_BASE_URL (default: http://localhost:11434) y OLLAMA_MODEL (default: qwen2.5:3b).
 */
export function getOllamaClient(): OllamaClient {
  if (!instance) {
    const baseUrl =
      process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
    const model =
      process.env.OLLAMA_MODEL ?? 'qwen2.5:3b'
    instance = new OllamaHttpClient(baseUrl, model)
  }
  return instance
}

/** Solo para tests — permite resetear el singleton entre suites */
export function _resetOllamaClientSingleton(): void {
  instance = null
}
