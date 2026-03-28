import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const statusTransitionSchema = z.object({
  status: z.enum(['live', 'inactive']),
})

// Máquina de estados: transiciones válidas
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['live'],
  live: ['inactive'],
  inactive: [], // no hay transiciones desde inactive en MVP
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'No autenticado', code: 'AUTH_REQUIRED' },
      { status: 401 },
    )
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de petición inválido', code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  const result = statusTransitionSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, builder_id, status, image_urls')
    .eq('id', id)
    .single()

  if (!project) {
    return NextResponse.json(
      { error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' },
      { status: 404 },
    )
  }

  if (project.builder_id !== user.id) {
    return NextResponse.json(
      {
        error: 'Solo el builder puede cambiar el estado',
        code: 'PROJECT_FORBIDDEN',
      },
      { status: 403 },
    )
  }

  const targetStatus = result.data.status
  const validNext = VALID_TRANSITIONS[project.status] ?? []

  if (!validNext.includes(targetStatus)) {
    return NextResponse.json(
      {
        error: `Transición inválida: ${project.status} → ${targetStatus}`,
        code: 'PROJECT_INVALID_TRANSITION',
      },
      { status: 422 },
    )
  }

  // Validación al publicar: mínimo 1 imagen
  if (
    targetStatus === 'live' &&
    (!project.image_urls || project.image_urls.length === 0)
  ) {
    return NextResponse.json(
      {
        error: 'Debes añadir al menos una imagen antes de publicar',
        code: 'PROJECT_MISSING_IMAGES',
      },
      { status: 422 },
    )
  }

  const { data: updated, error } = await supabase
    .from('projects')
    .update({ status: targetStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !updated) {
    return NextResponse.json(
      { error: 'Error al cambiar estado', code: 'PROJECT_STATUS_ERROR' },
      { status: 500 },
    )
  }

  return NextResponse.json({ data: updated })
}
