// Story 12.3 — POST /api/webhooks/ai-synthesis
// Orquesta la síntesis IA de feedbacks de un proyecto:
//   1. Autentica via WEBHOOK_SECRET (timingSafeEqual)
//   2. Verifica >= 3 feedbacks con quality_score >= 0.6
//   3. Skip si síntesis reciente (< 24h)
//   4. Verifica presupuesto diario
//   5. Sintetiza con Ollama (lib/ai)
//   6. Upsert en ai_summaries
//   7. Registra coste en ai_cost_tracking
//   8. Inserta notificación in-app para el Builder
//   9. Story 12.6: Envía email al Builder si email_enabled (fire-and-forget)

import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { synthesizeFeedbacks, trackCost, checkDailyBudget } from '@/lib/ai'
import { sendEmail, buildAiSynthesisReadyEmail } from '@/lib/email'
import type { Feedback } from '@/lib/types/feedback'
import type { Project } from '@/lib/types/projects'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const MINIMUM_FEEDBACKS = 3
const QUALITY_THRESHOLD = 0.6
const SUMMARY_FRESHNESS_MS = 24 * 60 * 60 * 1000 // 24 horas en milisegundos

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------

interface WebhookBody {
  projectId?: string
}

interface ProjectRow {
  id: string
  slug: string
  builder_id: string
  title: string
  community_id: string
  problem: string
  solution: string
  hypothesis: string
  image_urls: string[]
  status: string
  decision: string | null
  decided_at: string | null
  created_at: string
  updated_at: string
  target_user: string | null
  demo_url: string | null
  feedback_topics: string[] | null
  tagline: string | null
  would_use_count: number
  template_id: string | null
  custom_question: string | null
  quality_threshold: number
}

interface FeedbackRow {
  id: string
  project_id: string
  reviewer_id: string
  community_id: string
  scores: { p1: number; p2: number; p3: number }
  text_responses: { p1?: string; p2?: string; p3?: string; p4: string }
  created_at: string
  custom_answer: string | null
  quality_score: number | null
}

interface AISummaryRow {
  id: string
  project_id: string
  content: string
  feedback_count_at_generation: number
  model: string
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Verifica el WEBHOOK_SECRET usando timingSafeEqual para evitar timing attacks.
 * Mismo patrón que cron jobs del proyecto (Story 11.4).
 */
function verifyWebhookSecret(provided: string | null, expected: string | null): boolean {
  if (!provided || !expected) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** Crea el service role client de Supabase — bypasea RLS. */
function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

/** Mapea un ProjectRow (snake_case) a Project (camelCase) del dominio. */
function projectFromRow(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    communityId: row.community_id,
    builderId: row.builder_id,
    title: row.title,
    problem: row.problem,
    solution: row.solution,
    hypothesis: row.hypothesis,
    imageUrls: row.image_urls,
    status: row.status as Project['status'],
    decision: row.decision as Project['decision'],
    decidedAt: row.decided_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    targetUser: row.target_user,
    demoUrl: row.demo_url,
    feedbackTopics: row.feedback_topics,
    tagline: row.tagline,
    wouldUseCount: row.would_use_count,
    templateId: row.template_id,
    customQuestion: row.custom_question,
    qualityThreshold: row.quality_threshold,
  }
}

/** Mapea un FeedbackRow (snake_case) a Feedback (camelCase) del dominio. */
function feedbackFromRow(row: FeedbackRow): Feedback {
  return {
    id: row.id,
    projectId: row.project_id,
    reviewerId: row.reviewer_id,
    communityId: row.community_id,
    scores: row.scores as Feedback['scores'],
    textResponses: row.text_responses as Feedback['textResponses'],
    createdAt: row.created_at,
    customAnswer: row.custom_answer,
    qualityScore: row.quality_score,
  }
}

// ---------------------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------------------

/**
 * POST /api/webhooks/ai-synthesis
 *
 * Protegido con x-webhook-secret (timingSafeEqual).
 * Orquesta síntesis IA → upsert ai_summaries → track cost → notificación builder.
 * Usa service role Supabase para bypasear RLS en todas las operaciones de escritura.
 */
export async function POST(request: Request): Promise<NextResponse> {
  // ── AC1: Verificación del secret ──────────────────────────────────────────
  const providedSecret = (request.headers as Headers).get('x-webhook-secret')
  const expectedSecret = process.env.WEBHOOK_SECRET ?? null

  if (!verifyWebhookSecret(providedSecret, expectedSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parsear body ──────────────────────────────────────────────────────────
  let body: WebhookBody
  try {
    body = (await request.json()) as WebhookBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { projectId } = body
  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
  }

  const supabaseAdmin = createServiceRoleClient()

  // ── Obtener datos del proyecto ────────────────────────────────────────────
  const { data: projectRow, error: projectError } = await supabaseAdmin
    .from('projects')
    .select()
    .eq('id', projectId)
    .maybeSingle()

  if (projectError || !projectRow) {
    return NextResponse.json(
      { error: 'PROJECT_NOT_FOUND', projectId },
      { status: 404 },
    )
  }

  const project = projectFromRow(projectRow as ProjectRow)

  // ── AC2: Verificar feedbacks suficientes ──────────────────────────────────
  const { data: feedbackRows, error: feedbacksError } = await supabaseAdmin
    .from('feedbacks')
    .select()
    .eq('project_id', projectId)
    .gte('quality_score', QUALITY_THRESHOLD)
    .order('created_at', { ascending: false })

  if (feedbacksError) {
    return NextResponse.json(
      { error: 'DB_ERROR', detail: feedbacksError.message },
      { status: 500 },
    )
  }

  const qualityFeedbacks = (feedbackRows as FeedbackRow[] | null) ?? []

  if (qualityFeedbacks.length < MINIMUM_FEEDBACKS) {
    return NextResponse.json(
      { error: 'INSUFFICIENT_FEEDBACKS', count: qualityFeedbacks.length },
      { status: 400 },
    )
  }

  // ── AC3: Skip si síntesis reciente (< 24h) ────────────────────────────────
  const { data: existingSummary } = await supabaseAdmin
    .from('ai_summaries')
    .select()
    .eq('project_id', projectId)
    .maybeSingle()

  if (existingSummary) {
    const summaryRow = existingSummary as AISummaryRow
    const updatedAt = new Date(summaryRow.updated_at).getTime()
    const isFresh = Date.now() - updatedAt < SUMMARY_FRESHNESS_MS

    if (isFresh) {
      return NextResponse.json(
        { skipped: true, reason: 'RECENT_SUMMARY' },
        { status: 200 },
      )
    }
  }

  // ── AC4: Verificar presupuesto diario ─────────────────────────────────────
  const hasBudget = await checkDailyBudget(project.communityId)
  if (!hasBudget) {
    return NextResponse.json({ error: 'BUDGET_EXCEEDED' }, { status: 429 })
  }

  // ── AC5: Sintetizar feedbacks ─────────────────────────────────────────────
  const feedbacks = qualityFeedbacks.map(feedbackFromRow)
  const synthesis = await synthesizeFeedbacks(feedbacks, project)

  // ── AC6: Upsert en ai_summaries ───────────────────────────────────────────
  const { data: upsertedRows, error: upsertError } = await supabaseAdmin
    .from('ai_summaries')
    .upsert(
      {
        project_id: projectId,
        content: synthesis.summaryText,
        feedback_count_at_generation: qualityFeedbacks.length,
        model: synthesis.model,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id' },
    )

  if (upsertError) {
    return NextResponse.json(
      { error: 'UPSERT_FAILED', detail: upsertError.message },
      { status: 500 },
    )
  }

  const summaryId: string =
    (upsertedRows as AISummaryRow[] | null)?.[0]?.id ?? projectId

  // ── AC7 (trackCost): Registrar coste ──────────────────────────────────────
  await trackCost({
    communityId: project.communityId,
    tokensInput: synthesis.tokensInput,
    tokensOutput: synthesis.tokensOutput,
    costUsd: synthesis.costUsd,
  })

  // ── AC8: Insertar notificación in-app al Builder ──────────────────────────
  // Obtener el slug de la comunidad para poder navegar desde la notificación
  const { data: community } = await supabaseAdmin
    .from('communities')
    .select('slug')
    .eq('id', project.communityId)
    .single()

  await supabaseAdmin.from('notifications').insert({
    user_id: project.builderId,
    type: 'ai_synthesis_ready',
    payload: {
      projectId,
      projectSlug: project.slug,
      projectTitle: project.title,
      communitySlug: community?.slug,
    },
    read: false,
  })

  // ── Story 12.6: Envío de email fire-and-forget ────────────────────────────
  // Consultar preferencias de notificación del builder (default: email habilitado)
  const { data: pref } = await supabaseAdmin
    .from('notification_preferences')
    .select('email_enabled')
    .eq('user_id', project.builderId)
    .eq('type', 'ai_synthesis_ready')
    .maybeSingle()

  const emailEnabled = pref?.email_enabled ?? true

  if (emailEnabled) {
    const {
      data: { user: builderAuthUser },
    } = await supabaseAdmin.auth.admin.getUserById(project.builderId)

    const builderEmail = builderAuthUser?.email
    if (builderEmail) {
      const projectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/communities/${community?.slug}/projects/${project.slug}`
      const { subject, html } = buildAiSynthesisReadyEmail({
        projectTitle: project.title,
        projectUrl,
        summaryText: synthesis.summaryText,
      })
      sendEmail({ to: builderEmail, subject, html }).catch((err: unknown) => {
        console.error('[ai-synthesis webhook] Email send failed:', err)
      })
    }
  }

  // ── AC9: Respuesta exitosa ────────────────────────────────────────────────
  return NextResponse.json(
    { success: true, projectId, summaryId },
    { status: 200 },
  )
}
