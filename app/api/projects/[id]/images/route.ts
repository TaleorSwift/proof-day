import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  PROJECT_IMAGES_BUCKET,
  PROJECT_IMAGE_ALLOWED_TYPES,
  PROJECT_IMAGE_MAX_SIZE,
  PROJECT_IMAGES_MAX_COUNT,
} from '@/lib/types/projects'

// POST /api/projects/[id]/images — upload a new image
export async function POST(
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

  // Verify project exists and belongs to this builder
  const { data: project } = await supabase
    .from('projects')
    .select('id, builder_id, image_urls, status')
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
  if ((project.image_urls ?? []).length >= PROJECT_IMAGES_MAX_COUNT) {
    return NextResponse.json(
      { error: `Límite de ${PROJECT_IMAGES_MAX_COUNT} imágenes alcanzado`, code: 'PROJECT_IMAGES_LIMIT' },
      { status: 422 }
    )
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json(
      { error: 'Archivo requerido', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Validate format and size
  if (!PROJECT_IMAGE_ALLOWED_TYPES.includes(file.type as typeof PROJECT_IMAGE_ALLOWED_TYPES[number])) {
    return NextResponse.json(
      { error: 'Formato no válido. Usa JPG, PNG o WebP', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }
  if (file.size > PROJECT_IMAGE_MAX_SIZE) {
    return NextResponse.json(
      { error: 'La imagen no puede superar 5MB', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Build path: {userId}/{projectId}/{timestamp}.{ext}
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}.${ext}`
  const path = `${user.id}/${projectId}/${filename}`

  const { error: uploadError } = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .upload(path, file)

  if (uploadError) {
    return NextResponse.json(
      { error: 'Error al subir la imagen', code: 'STORAGE_UPLOAD_ERROR' },
      { status: 500 }
    )
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(PROJECT_IMAGES_BUCKET).getPublicUrl(path)

  // Store relative path (not absolute URL) in image_urls array
  const currentUrls: string[] = project.image_urls ?? []
  const newImageUrls = [...currentUrls, path]
  await supabase
    .from('projects')
    .update({ image_urls: newImageUrls })
    .eq('id', projectId)

  return NextResponse.json({ data: { url: publicUrl, path } }, { status: 201 })
}

// DELETE /api/projects/[id]/images — remove an image
export async function DELETE(
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

  let body: { path: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Body inválido', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { path } = body
  if (!path) {
    return NextResponse.json(
      { error: 'path requerido', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, builder_id, image_urls')
    .eq('id', projectId)
    .single()

  if (!project || project.builder_id !== user.id) {
    return NextResponse.json(
      { error: 'Sin permiso', code: 'PROJECT_FORBIDDEN' },
      { status: 403 }
    )
  }

  // Remove from Storage
  await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove([path])

  // Update the paths array
  const newImageUrls = (project.image_urls ?? []).filter((p: string) => p !== path)
  await supabase
    .from('projects')
    .update({ image_urls: newImageUrls })
    .eq('id', projectId)

  return NextResponse.json({ success: true })
}
