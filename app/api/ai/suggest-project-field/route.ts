// Story 13.7 — POST /api/ai/suggest-project-field
// Genera sugerencias de texto para los campos del wizard (problema, solución, hipótesis)
// usando Ollama como motor de IA local.
//
// AC2: validación de campo, auth, budget, manejo de errores Ollama
// AC5: tracking de coste en ai_cost_tracking

import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/middleware/require-auth'
import { getOllamaClient, checkDailyBudget, trackCost } from '@/lib/ai'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SuggestField = 'problem' | 'solution' | 'hypothesis'

interface SuggestContext {
  title: string
  problem?: string
  solution?: string
  hypothesis?: string
  templateId?: string
}

const VALID_FIELDS: SuggestField[] = ['problem', 'solution', 'hypothesis']

// Centinela para presupuesto global — fuera del contexto de una comunidad específica
const GLOBAL_BUDGET_SENTINEL = 'global'

// ---------------------------------------------------------------------------
// Prompt builder — puro, sin efectos secundarios
// ---------------------------------------------------------------------------

export function buildSuggestionPrompt(field: SuggestField, context: SuggestContext): string {
  const base = `Eres un asistente que ayuda a emprendedores a describir sus proyectos de forma clara y concisa. El proyecto se llama "${context.title}".`

  if (field === 'problem') {
    return `${base} Escribe un párrafo breve (2-3 frases) describiendo el problema que este proyecto resuelve. Sé específico y orientado al usuario afectado. Responde SOLO con el párrafo, sin explicaciones adicionales.`
  }

  if (field === 'solution') {
    const problemCtx = context.problem ? ` El problema que resuelve es: "${context.problem}".` : ''
    return `${base}${problemCtx} Escribe un párrafo breve (2-3 frases) describiendo la solución propuesta. Sé concreto y describe el producto/servicio. Responde SOLO con el párrafo, sin explicaciones adicionales.`
  }

  // field === 'hypothesis'
  const ctx = [
    context.problem ? `Problema: "${context.problem}"` : '',
    context.solution ? `Solución: "${context.solution}"` : '',
  ].filter(Boolean).join('. ')

  return `${base}${ctx ? ' ' + ctx : ''} Escribe una hipótesis de validación para este proyecto en formato "Creemos que [acción] logrará [resultado] para [usuario]. Lo validaremos cuando [métrica]." Una sola oración. Responde SOLO con la hipótesis, sin explicaciones adicionales.`
}

// ---------------------------------------------------------------------------
// Estimación de tokens — aproximación simple
// ---------------------------------------------------------------------------

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: Request): Promise<NextResponse> {
  // AC2 — Auth
  const auth = await requireAuth()
  if (auth.error) return auth.error

  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de la petición inválido', code: 'INVALID_BODY' },
      { status: 400 }
    )
  }

  const { field, title, problem, solution, hypothesis, templateId } =
    (body ?? {}) as Record<string, unknown>

  // AC2 — Validar campo
  if (!VALID_FIELDS.includes(field as SuggestField)) {
    return NextResponse.json({ error: 'INVALID_FIELD' }, { status: 400 })
  }

  // AC2 — title requerido
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return NextResponse.json({ error: 'TITLE_REQUIRED' }, { status: 400 })
  }

  // AC2 — Budget check (global, sin contexto de comunidad)
  const budgetOk = await checkDailyBudget(GLOBAL_BUDGET_SENTINEL)
  if (!budgetOk) {
    return NextResponse.json({ error: 'BUDGET_EXCEEDED' }, { status: 429 })
  }

  // Construir prompt
  const context: SuggestContext = {
    title: title.trim(),
    problem: typeof problem === 'string' ? problem : undefined,
    solution: typeof solution === 'string' ? solution : undefined,
    hypothesis: typeof hypothesis === 'string' ? hypothesis : undefined,
    templateId: typeof templateId === 'string' ? templateId : undefined,
  }

  const prompt = buildSuggestionPrompt(field as SuggestField, context)

  // AC2 — Llamar a Ollama
  let suggestion: string
  let tokensOutput: number

  try {
    const client = getOllamaClient()
    const response = await client.generate(prompt)
    suggestion = response.response.trim()
    tokensOutput = response.eval_count ?? estimateTokens(suggestion)
  } catch {
    return NextResponse.json({ error: 'AI_UNAVAILABLE' }, { status: 503 })
  }

  // AC5 — Tracking de coste (fire-and-forget si falla, no bloquea)
  const tokensInput = estimateTokens(prompt)
  try {
    await trackCost({
      communityId: GLOBAL_BUDGET_SENTINEL,
      tokensInput,
      tokensOutput,
      costUsd: 0,
    })
  } catch (err) {
    console.error('[suggest-project-field] Error en trackCost:', err)
  }

  return NextResponse.json({ suggestion })
}
