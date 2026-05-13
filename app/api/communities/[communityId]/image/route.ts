import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateCommunityImageSchema } from '@/lib/validations/communities'
import { createCommunitiesRepository } from '@/lib/repositories/communities.repository'
import { saveExternalImageToBucket } from '@/lib/utils/saveExternalImageToBucket'
import { ImageFetchError } from '@/lib/utils/fetchExternalImage'

function isOwnStorageUrl(url: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  if (!supabaseUrl) return false
  try {
    const parsed = new URL(url)
    const base = new URL(supabaseUrl)
    return parsed.origin === base.origin && parsed.pathname.startsWith('/storage/')
  } catch {
    return false
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ communityId: string }> },
) {
  const { communityId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'No autenticado', code: 'UNAUTHENTICATED' },
      { status: 401 },
    )
  }

  const { data: membership } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    return NextResponse.json(
      { error: 'Solo el admin puede cambiar la imagen', code: 'FORBIDDEN' },
      { status: 403 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Body inválido', code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  const validation = updateCommunityImageSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  let { imageUrl } = validation.data

  if (imageUrl && !isOwnStorageUrl(imageUrl)) {
    try {
      imageUrl = await saveExternalImageToBucket(imageUrl, user.id, communityId)
    } catch (err) {
      if (err instanceof ImageFetchError) {
        return NextResponse.json({ error: err.message, code: err.code }, { status: 400 })
      }
      return NextResponse.json(
        { error: 'Error al procesar la imagen', code: 'IMAGE_FETCH_FAILED' },
        { status: 400 },
      )
    }
  }

  const repository = createCommunitiesRepository(supabase)
  const { data: updated, error } = await repository.updateImage(communityId, imageUrl)

  if (error || !updated) {
    const isNotFound =
      error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116'
    if (isNotFound) {
      return NextResponse.json(
        { error: 'Comunidad no encontrada', code: 'COMMUNITY_NOT_FOUND' },
        { status: 404 },
      )
    }
    return NextResponse.json(
      { error: 'Error al actualizar la imagen', code: 'UPDATE_ERROR' },
      { status: 500 },
    )
  }

  return NextResponse.json({ data: { id: updated.id, imageUrl: updated.image_url } })
}
