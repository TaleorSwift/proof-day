// Story 12.2 — Síntesis de feedbacks con Ollama
// AC2: synthesizeFeedbacks retorna AISynthesisResult
// AC3: buildPrompt construye el prompt correcto

import type { Feedback } from '@/lib/types/feedback'
import type { Project } from '@/lib/types/projects'
import { getOllamaClient } from './ollamaClient'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Resultado de la síntesis de feedbacks por el modelo de IA */
export interface AISynthesisResult {
  summaryText: string
  keyInsights: string[]
  model: string
  tokensInput: number
  tokensOutput: number
  costUsd: number
}

/** Resultado parseado del texto libre devuelto por Ollama */
export interface ParsedAIResponse {
  summaryText: string
  keyInsights: string[]
}

// ---------------------------------------------------------------------------
// buildPrompt — función pura
// ---------------------------------------------------------------------------

/**
 * Construye el prompt para Ollama a partir de los feedbacks y el proyecto.
 * Es una función pura — sin efectos secundarios, testable de forma aislada.
 */
export function buildPrompt(feedbacks: Feedback[], project: Project): string {
  const feedbackTexts = feedbacks
    .map((fb) => {
      const texts = Object.values(fb.textResponses).filter(Boolean)
      return texts.join('\n')
    })
    .filter((text) => text.trim().length > 0)
    .join('\n---\n')

  return `Sintetiza los siguientes feedbacks sobre el proyecto ${project.title}.

Instrucciones de formato:
1) Resumen ejecutivo (2-3 frases)
2) Puntos fuertes (bullet list)
3) Áreas de mejora (bullet list)
4) Recomendación final

Feedbacks recibidos:
${feedbackTexts}

Responde SOLO en español. Sé conciso.`
}

// ---------------------------------------------------------------------------
// parseAIResponse — función pura
// ---------------------------------------------------------------------------

/**
 * Parsea el texto libre devuelto por Ollama y extrae:
 * - summaryText: primer párrafo / sección de resumen ejecutivo
 * - keyInsights: líneas con "-" o "•" del texto completo
 */
export function parseAIResponse(text: string): ParsedAIResponse {
  if (!text.trim()) {
    return { summaryText: '', keyInsights: [] }
  }

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  // Extrae la sección de resumen ejecutivo (después de "1)" o "Resumen ejecutivo:")
  const summaryLines: string[] = []
  let inSummary = false
  let foundNextSection = false

  for (const line of lines) {
    const isSection1 =
      /^1[).]/.test(line) ||
      /resumen ejecutivo/i.test(line)
    const isSection2Plus =
      /^[2-4][).]/.test(line) ||
      /puntos fuertes|áreas de mejora|recomendación/i.test(line)

    if (isSection1) {
      inSummary = true
      // Incluir el contenido de la misma línea si hay texto después del marcador
      const content = line.replace(/^1[).]\s*(resumen ejecutivo[:.]\s*)?/i, '').trim()
      if (content) summaryLines.push(content)
      continue
    }

    if (inSummary && isSection2Plus) {
      foundNextSection = true
      break
    }

    if (inSummary && !foundNextSection) {
      summaryLines.push(line)
    }
  }

  // Si no se encontró sección marcada, usar el primer párrafo
  const summaryText = summaryLines.length > 0
    ? summaryLines.join(' ').trim()
    : lines[0] ?? ''

  // Extrae bullet points de todo el texto
  const keyInsights = lines
    .filter((line) => /^[-•*]/.test(line))
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter((line) => line.length > 0)

  return { summaryText, keyInsights }
}

// ---------------------------------------------------------------------------
// synthesizeFeedbacks — orquestación
// ---------------------------------------------------------------------------

/**
 * Orquesta la síntesis de feedbacks:
 * 1. Construye el prompt
 * 2. Llama al cliente Ollama
 * 3. Parsea la respuesta
 * 4. Retorna AISynthesisResult
 */
export async function synthesizeFeedbacks(
  feedbacks: Feedback[],
  project: Project
): Promise<AISynthesisResult> {
  const model = process.env.OLLAMA_MODEL ?? 'qwen2.5:3b'
  const client = getOllamaClient()

  const prompt = buildPrompt(feedbacks, project)
  const ollamaResponse = await client.generate(prompt)

  const { summaryText, keyInsights } = parseAIResponse(ollamaResponse.response)

  return {
    summaryText,
    keyInsights,
    model,
    tokensInput: ollamaResponse.prompt_eval_count,
    tokensOutput: ollamaResponse.eval_count,
    costUsd: 0.0, // Ollama local = sin coste económico
  }
}
