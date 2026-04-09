import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateProjectSchema } from '@/lib/validations/projects'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 })

  const { id } = await params
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) return NextResponse.json({ error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' }, { status: 404 })
  return NextResponse.json({ data: project })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json(
    { error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 }
  )

  const { id } = await params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido', code: 'INVALID_BODY' }, { status: 400 })
  }
  const result = updateProjectSchema.safeParse(body)
  if (!result.success) return NextResponse.json(
    { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' }, { status: 400 }
  )

  // Verificar que el proyecto existe y pertenece al builder
  const { data: existing } = await supabase
    .from('projects')
    .select('id, status, builder_id')
    .eq('id', id)
    .single()

  if (!existing) return NextResponse.json(
    { error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' }, { status: 404 }
  )
  if (existing.builder_id !== user.id) return NextResponse.json(
    { error: 'No tienes permiso para editar este proyecto', code: 'PROJECT_FORBIDDEN' }, { status: 403 }
  )
  if (existing.status !== 'draft') return NextResponse.json(
    { error: 'Solo puedes editar proyectos en borrador', code: 'PROJECT_NOT_DRAFT' }, { status: 422 }
  )

  // Construir objeto de update con snake_case para Supabase
  const updateFields: {
    title?: string
    problem?: string
    solution?: string
    hypothesis?: string
    image_urls?: string[]
    // Story 8.1 — campos opcionales (null para borrar, string/array para actualizar)
    target_user?: string | null
    demo_url?: string | null
    feedback_topics?: string[] | null
    updated_at: string
  } = { updated_at: new Date().toISOString() }

  if (result.data.title !== undefined) updateFields.title = result.data.title
  if (result.data.problem !== undefined) updateFields.problem = result.data.problem
  if (result.data.solution !== undefined) updateFields.solution = result.data.solution
  if (result.data.hypothesis !== undefined) updateFields.hypothesis = result.data.hypothesis
  if (result.data.imageUrls !== undefined) updateFields.image_urls = result.data.imageUrls
  // Story 8.1 — campos opcionales: se pasa null explícitamente para permitir borrar el valor
  if (result.data.targetUser !== undefined) updateFields.target_user = result.data.targetUser || null
  if (result.data.demoUrl !== undefined) updateFields.demo_url = result.data.demoUrl || null
  if (result.data.feedbackTopics !== undefined)
    updateFields.feedback_topics = result.data.feedbackTopics?.length ? result.data.feedbackTopics : null

  const { data: project, error } = await supabase
    .from('projects')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single()

  if (error || !project) return NextResponse.json(
    { error: 'Error al actualizar el proyecto', code: 'PROJECT_UPDATE_ERROR' }, { status: 500 }
  )

  return NextResponse.json({ data: project })
}
