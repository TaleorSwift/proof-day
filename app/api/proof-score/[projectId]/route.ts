import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateProofScore } from '@/lib/utils/proof-score'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user)
    return NextResponse.json(
      { error: 'No autenticado', code: 'AUTH_REQUIRED' },
      { status: 401 }
    )

  const { projectId } = await params

  // Verificar que el proyecto existe y que el solicitante es el builder
  const { data: project } = await supabase
    .from('projects')
    .select('id, builder_id')
    .eq('id', projectId)
    .single()

  if (!project)
    return NextResponse.json(
      { error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' },
      { status: 404 }
    )

  if (project.builder_id !== user.id)
    return NextResponse.json(
      { error: 'Solo el builder puede ver el Proof Score', code: 'PROOF_SCORE_FORBIDDEN' },
      { status: 403 }
    )

  // Obtener la iteración más reciente del proyecto (si existe)
  const { data: latestIteration } = await supabase
    .from('project_iterations')
    .select('id')
    .eq('project_id', projectId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Construir query de feedbacks — filtrar por iteración más reciente si existe
  let feedbackQuery = supabase
    .from('feedbacks')
    .select('scores')
    .eq('project_id', projectId)

  if (latestIteration) {
    feedbackQuery = feedbackQuery.eq('iteration_id', latestIteration.id)
  }

  const { data: feedbacks, error } = await feedbackQuery

  if (error)
    return NextResponse.json(
      { error: 'Error al obtener feedbacks', code: 'FEEDBACKS_FETCH_ERROR' },
      { status: 500 }
    )

  const result = calculateProofScore(feedbacks ?? [])
  return NextResponse.json({ data: result })
}
