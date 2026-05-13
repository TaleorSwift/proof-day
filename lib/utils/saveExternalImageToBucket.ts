import { createClient } from '@/lib/supabase/server'
import { fetchExternalImage } from './fetchExternalImage'
import { COMMUNITY_IMAGES_BUCKET } from '@/lib/types/communities'

export async function saveExternalImageToBucket(
  imageUrl: string,
  userId: string,
  communityId?: string,
): Promise<string> {
  const { buffer, mime, ext } = await fetchExternalImage(imageUrl)

  const supabase = await createClient()
  const folder = communityId ? `${userId}/${communityId}` : `${userId}/temp`
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path = `${folder}/${filename}`

  const { error } = await supabase.storage
    .from(COMMUNITY_IMAGES_BUCKET)
    .upload(path, buffer, { contentType: mime })

  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabase.storage
    .from(COMMUNITY_IMAGES_BUCKET)
    .getPublicUrl(path)

  return publicUrl
}
