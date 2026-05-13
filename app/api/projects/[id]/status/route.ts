import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  draft: ['live'],
  live: ['inactive'],
  inactive: [],
}

const statusSchema = z.object({
  status: z.enum(['live', 'inactive']),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido', code: 'INVALID_BODY' }, { status: 400 })
  }

  const result = statusSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, status, builder_id')
    .eq('id', id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' }, { status: 404 })
  }

  if (project.builder_id !== user.id) {
    return NextResponse.json({ error: 'No tienes permiso', code: 'PROJECT_FORBIDDEN' }, { status: 403 })
  }

  const allowed = ALLOWED_TRANSITIONS[project.status] ?? []
  if (!allowed.includes(result.data.status)) {
    return NextResponse.json(
      { error: `No se puede cambiar de ${project.status} a ${result.data.status}`, code: 'INVALID_TRANSITION' },
      { status: 422 },
    )
  }

  const { data: updated, error } = await supabase
    .from('projects')
    .update({ status: result.data.status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error || !updated) {
    return NextResponse.json({ error: 'Error al actualizar el estado', code: 'UPDATE_ERROR' }, { status: 500 })
  }

  return NextResponse.json({ data: updated })
}
