import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const decisionSchema = z.object({
  decision: z.enum(['iterate', 'scale', 'abandon']),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

  const { id } = await params

  const body = await request.json()
  const result = decisionSchema.safeParse(body)
  if (!result.success)
    return NextResponse.json(
      { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )

  // Verificar que el proyecto existe
  const { data: existing } = await supabase
    .from('projects')
    .select('id, builder_id, decision')
    .eq('id', id)
    .single()

  if (!existing)
    return NextResponse.json(
      { error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' },
      { status: 404 }
    )

  if (existing.builder_id !== user.id)
    return NextResponse.json(
      { error: 'No tienes permiso para registrar una decisión en este proyecto', code: 'PROJECT_FORBIDDEN' },
      { status: 403 }
    )

  // Irreversible — si ya hay decisión, devolver 409
  if (existing.decision !== null)
    return NextResponse.json(
      { error: 'Ya existe una decisión registrada para este proyecto', code: 'DECISION_ALREADY_REGISTERED' },
      { status: 409 }
    )

  const { data: project, error } = await supabase
    .from('projects')
    .update({
      decision: result.data.decision,
      decided_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !project)
    return NextResponse.json(
      { error: 'Error al registrar la decisión', code: 'DECISION_UPDATE_ERROR' },
      { status: 500 }
    )

  return NextResponse.json({ data: project })
}
