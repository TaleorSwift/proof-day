import { NextResponse } from 'next/server'
import { submitFeedbackSchema } from '@/lib/validations/feedback'
import { requireAuth } from '@/lib/api/middleware/require-auth'
import { createFeedbackService } from '@/lib/services/feedback.service'
import { createFeedbackRepository } from '@/lib/repositories/feedback.repository'
import { createProjectsRepository } from '@/lib/repositories/projects.repository'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { user, supabase } = auth
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  if (!projectId)
    return NextResponse.json({ error: 'projectId requerido', code: 'VALIDATION_ERROR' }, { status: 400 })

  const projectsRepo = createProjectsRepository(supabase)
  const { data: project } = await projectsRepo.findById(projectId, 'id, builder_id')

  if (!project || project.builder_id !== user.id)
    return NextResponse.json(
      { error: 'Solo el builder puede ver los feedbacks', code: 'FEEDBACK_FORBIDDEN' },
      { status: 403 }
    )

  const feedbackRepo = createFeedbackRepository(supabase)
  const { data: feedbacks, error } = await feedbackRepo.findByProject(projectId)

  if (error) {
    // Fallback sin join a profiles si la tabla no existe aún
    const { data: feedbacksBasic, error: errorBasic } = await feedbackRepo.findByProjectBasic(projectId)
    if (errorBasic)
      return NextResponse.json({ error: 'Error al obtener feedbacks', code: 'FEEDBACKS_FETCH_ERROR' }, { status: 500 })

    const normalized = (feedbacksBasic ?? []).map((f: Record<string, unknown>) => ({ ...f, profiles: null }))
    return NextResponse.json({ data: normalized, count: normalized.length })
  }

  return NextResponse.json({ data: feedbacks ?? [], count: feedbacks?.length ?? 0 })
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { user, supabase } = auth

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de la petición inválido', code: 'INVALID_BODY' }, { status: 400 })
  }

  const result = submitFeedbackSchema.safeParse(body)
  if (!result.success)
    return NextResponse.json({ error: result.error.issues[0].message, code: 'VALIDATION_ERROR' }, { status: 400 })

  const { projectId, communityId, scores, textResponses } = result.data

  const feedbackService = createFeedbackService(supabase)
  const eligibility = await feedbackService.validateEligibility({
    projectId,
    communityId,
    reviewerId: user.id,
  })

  if (!eligibility.eligible)
    return NextResponse.json({ error: eligibility.error, code: eligibility.code }, { status: eligibility.status })

  const feedbackRepo = createFeedbackRepository(supabase)
  const { data: feedback, error } = await feedbackRepo.create({
    projectId,
    reviewerId: user.id,
    communityId,
    scores,
    textResponses,
  })

  if (error || !feedback)
    return NextResponse.json({ error: 'Error al enviar feedback', code: 'FEEDBACK_INSERT_ERROR' }, { status: 500 })

  return NextResponse.json({ data: feedback }, { status: 201 })
}
