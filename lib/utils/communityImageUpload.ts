import { createClient } from '@/lib/supabase/client'
import { COMMUNITY_IMAGES_BUCKET } from '@/lib/types/communities'

export interface UploadedCommunityImage {
  url: string
  path: string
}

export async function uploadCommunityImageToStorage(
  file: File,
  communityId?: string,
): Promise<UploadedCommunityImage> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const folder = communityId ? `${user.id}/${communityId}` : `${user.id}/temp`
  const path = `${folder}/${filename}`

  const { error: uploadError } = await supabase.storage
    .from(COMMUNITY_IMAGES_BUCKET)
    .upload(path, file)

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage
    .from(COMMUNITY_IMAGES_BUCKET)
    .getPublicUrl(path)

  return { url: publicUrl, path }
}
