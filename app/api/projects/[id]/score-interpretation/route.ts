// Story 13.8 — GET /api/projects/[id]/score-interpretation
// Genera una interpretación en lenguaje natural del Proof Score del proyecto.
//
// Flujo:
//   1. requireAuth → 401 si no autenticado
//   2. Obtener proyecto → 404 si no existe
//   3. Verificar builder_id === user.id → 403 si no es el builder
//   4. Calcular Proof Score → 400 INSUFFICIENT_DATA si < 3 feedbacks
//   5. checkDailyBudget → 429 BUDGET_EXCEEDED si agotado
//   6. Construir prompt con score + contexto del proyecto
//   7. Llamar a Ollama
//   8. trackCost con communityId del proyecto
//   9. Retornar { interpretation: string }

import { NextResponse } from 'next/server'
import { isAIEnabled } from '@/lib/ai/featureFlag'
import { createClient } from '@/lib/supabase/server'
import { calculateProofScore } from '@/lib/utils/proof-score'
import { getOllamaClient, checkDailyBudget, trackCost } from '@/lib/ai'
import { buildInterpretationPrompt } from '@/lib/ai/interpretationPrompt'

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAIEnabled()) {
    return NextResponse.json({ error: 'AI_DISABLED' }, { status: 503 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 })
  }

  const { id } = await params

  // Obtener proyecto con los campos necesarios
  const { data: project } = await supabase
    .from('projects')
    .select('id, builder_id, community_id, title, problem')
    .eq('id', id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' }, { status: 404 })
  }

  if (project.builder_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden', code: 'PROOF_SCORE_FORBIDDEN' }, { status: 403 })
  }

  // Obtener la iteración más reciente del proyecto (si existe)
  const { data: latestIteration } = await supabase
    .from('project_iterations')
    .select('id')
    .eq('project_id', id)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Obtener feedbacks — filtrar por iteración más reciente si existe
  let feedbackQuery = supabase
    .from('feedbacks')
    .select('scores')
    .eq('project_id', id)

  if (latestIteration) {
    feedbackQuery = feedbackQuery.eq('iteration_id', latestIteration.id)
  }

  const { data: feedbacks, error: feedbacksError } = await feedbackQuery

  if (feedbacksError) {
    return NextResponse.json({ error: 'Error al obtener feedbacks', code: 'FEEDBACKS_FETCH_ERROR' }, { status: 500 })
  }

  const score = calculateProofScore(feedbacks ?? [])

  if (!score) {
    return NextResponse.json({ error: 'INSUFFICIENT_DATA', code: 'INSUFFICIENT_DATA' }, { status: 400 })
  }

  // Verificar presupuesto diario
  const budgetOk = await checkDailyBudget(project.community_id)
  if (!budgetOk) {
    return NextResponse.json({ error: 'BUDGET_EXCEEDED', code: 'BUDGET_EXCEEDED' }, { status: 429 })
  }

  // Generar interpretación con Ollama
  const prompt = buildInterpretationPrompt({
    title: project.title,
    problem: project.problem ?? '',
    scoreLabel: score.label,
    average: score.average,
    feedbackCount: score.feedbackCount,
  })

  let ollamaResponse
  try {
    const client = getOllamaClient()
    ollamaResponse = await client.generate(prompt)
  } catch {
    return NextResponse.json({ error: 'AI_UNAVAILABLE', code: 'AI_UNAVAILABLE' }, { status: 503 })
  }

  // Registrar coste (fire-and-forget: no bloqueamos la respuesta)
  void trackCost({
    communityId: project.community_id,
    tokensInput: ollamaResponse.prompt_eval_count,
    tokensOutput: ollamaResponse.eval_count,
    costUsd: 0,
  })

  return NextResponse.json({ interpretation: ollamaResponse.response })
}
