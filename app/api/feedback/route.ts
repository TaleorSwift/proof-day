import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { submitFeedbackSchema } from '@/lib/validations/feedback'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user)
    return NextResponse.json(
      { error: 'No autenticado', code: 'AUTH_REQUIRED' },
      { status: 401 }
    )

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  if (!projectId)
    return NextResponse.json(
      { error: 'projectId requerido', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )

  // Verificar que el usuario es el builder del proyecto
  const { data: project } = await supabase
    .from('projects')
    .select('id, builder_id')
    .eq('id', projectId)
    .single()

  if (!project || project.builder_id !== user.id)
    return NextResponse.json(
      {
        error: 'Solo el builder puede ver los feedbacks',
        code: 'FEEDBACK_FORBIDDEN',
      },
      { status: 403 }
    )

  // Leer feedbacks con datos del reviewer (LEFT JOIN a profiles)
  // La tabla profiles puede no existir aún (Story 6.1) — si el join falla, devolvemos feedbacks sin perfiles
  const { data: feedbacks, error } = await supabase
    .from('feedbacks')
    .select(
      `
      id, text_responses, created_at,
      profiles:reviewer_id (id, name, avatar_url)
    `
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    // Si el error es por tabla profiles inexistente, intentar sin el join
    const { data: feedbacksBasic, error: errorBasic } = await supabase
      .from('feedbacks')
      .select('id, text_responses, created_at')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (errorBasic)
      return NextResponse.json(
        { error: 'Error al obtener feedbacks', code: 'FEEDBACKS_FETCH_ERROR' },
        { status: 500 }
      )

    // Normalizar: añadir profiles: null para compatibilidad con el cliente
    const normalized = (feedbacksBasic ?? []).map((f) => ({
      ...f,
      profiles: null,
    }))

    return NextResponse.json({
      data: normalized,
      count: normalized.length,
    })
  }

  return NextResponse.json({ data: feedbacks ?? [], count: feedbacks?.length ?? 0 })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user)
    return NextResponse.json(
      { error: 'No autenticado', code: 'AUTH_REQUIRED' },
      { status: 401 }
    )

  const body = await request.json()
  const result = submitFeedbackSchema.safeParse(body)
  if (!result.success)
    return NextResponse.json(
      { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )

  const { projectId, communityId, scores, textResponses } = result.data

  // Verificar que el proyecto existe y está live
  const { data: project } = await supabase
    .from('projects')
    .select('id, status, builder_id, community_id, decision')
    .eq('id', projectId)
    .single()

  if (!project)
    return NextResponse.json(
      { error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' },
      { status: 404 }
    )

  if (project.decision !== null) {
    return NextResponse.json(
      { error: 'Feedback cerrado — el builder ya tomó una decisión', code: 'FEEDBACK_LOCKED' },
      { status: 409 }
    )
  }

  if (project.status !== 'live')
    return NextResponse.json(
      {
        error: 'Solo se puede dar feedback en proyectos Live',
        code: 'PROJECT_NOT_LIVE',
      },
      { status: 422 }
    )

  if (project.builder_id === user.id)
    return NextResponse.json(
      {
        error: 'No puedes dar feedback en tu propio proyecto',
        code: 'FEEDBACK_SELF_NOT_ALLOWED',
      },
      { status: 422 }
    )

  // Verificar que communityId del body coincide con la comunidad real del proyecto
  if (project.community_id !== communityId)
    return NextResponse.json(
      {
        error: 'La comunidad indicada no corresponde al proyecto',
        code: 'COMMUNITY_MISMATCH',
      },
      { status: 422 }
    )

  // Verificar membresía en la comunidad
  const { data: member } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .single()

  if (!member)
    return NextResponse.json(
      {
        error: 'No eres miembro de esta comunidad',
        code: 'COMMUNITY_ACCESS_DENIED',
      },
      { status: 403 }
    )

  // Verificar que no ha dado feedback ya
  const { data: existing } = await supabase
    .from('feedbacks')
    .select('id')
    .eq('project_id', projectId)
    .eq('reviewer_id', user.id)
    .maybeSingle()

  if (existing)
    return NextResponse.json(
      {
        error: 'Ya has dado feedback en este proyecto',
        code: 'FEEDBACK_ALREADY_SUBMITTED',
      },
      { status: 409 }
    )

  const { data: feedback, error } = await supabase
    .from('feedbacks')
    .insert({
      project_id: projectId,
      reviewer_id: user.id,
      community_id: communityId,
      scores,
      text_responses: textResponses,
    })
    .select()
    .single()

  if (error || !feedback)
    return NextResponse.json(
      { error: 'Error al enviar feedback', code: 'FEEDBACK_INSERT_ERROR' },
      { status: 500 }
    )

  return NextResponse.json({ data: feedback }, { status: 201 })
}
