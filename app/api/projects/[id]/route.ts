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
  const body = await request.json()
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

  const updateData: Record<string, unknown> = { ...result.data, updated_at: new Date().toISOString() }
  if (result.data.imageUrls !== undefined) {
    updateData.image_urls = result.data.imageUrls
    delete updateData.imageUrls
  }

  const { data: project, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error || !project) return NextResponse.json(
    { error: 'Error al actualizar el proyecto', code: 'PROJECT_UPDATE_ERROR' }, { status: 500 }
  )

  return NextResponse.json({ data: project })
}
