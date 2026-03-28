import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PROJECT_IMAGES_MAX_COUNT } from '@/lib/types/projects'

// PATCH /api/projects/[id]/images/reorder — update image order
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'No autenticado', code: 'AUTH_REQUIRED' },
      { status: 401 }
    )
  }

  const { id: projectId } = await params

  let body: { imagePaths: string[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Body inválido', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { imagePaths } = body

  // Validate input
  if (!Array.isArray(imagePaths)) {
    return NextResponse.json(
      { error: 'imagePaths debe ser un array', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }
  if (imagePaths.length > PROJECT_IMAGES_MAX_COUNT) {
    return NextResponse.json(
      { error: `No puedes tener más de ${PROJECT_IMAGES_MAX_COUNT} imágenes`, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }
  if (!imagePaths.every((p) => typeof p === 'string' && p.length > 0)) {
    return NextResponse.json(
      { error: 'Cada path debe ser un string no vacío', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Verify ownership
  const { data: project } = await supabase
    .from('projects')
    .select('id, builder_id')
    .eq('id', projectId)
    .single()

  if (!project) {
    return NextResponse.json(
      { error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' },
      { status: 404 }
    )
  }
  if (project.builder_id !== user.id) {
    return NextResponse.json(
      { error: 'Sin permiso', code: 'PROJECT_FORBIDDEN' },
      { status: 403 }
    )
  }

  // Persist new order
  const { error } = await supabase
    .from('projects')
    .update({ image_urls: imagePaths })
    .eq('id', projectId)

  if (error) {
    return NextResponse.json(
      { error: 'Error al reordenar imágenes', code: 'DB_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
