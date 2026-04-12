import { createClient } from '@/lib/supabase/client'
import { PROJECT_IMAGES_BUCKET } from '@/lib/types/projects'

export interface UploadedImage {
  url: string
  path: string
}

/**
 * Sube un archivo de imagen al bucket project-images de Supabase Storage.
 * Genera una ruta temporal con timestamp para evitar colisiones.
 * Retorna la URL pública y el path relativo en Storage.
 */
export async function uploadImageToStorage(file: File): Promise<UploadedImage> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path = `${user.id}/temp/${filename}`

  const { error: uploadError } = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .upload(path, file)

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .getPublicUrl(path)

  return { url: publicUrl, path }
}
