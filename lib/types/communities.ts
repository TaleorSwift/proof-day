export type CommunityRole = 'admin' | 'member'

/**
 * Forma del row tal como lo devuelve Supabase (snake_case) — Story 11.1.
 * Refleja exactamente las columnas de la tabla communities en BD.
 * member_count es un campo computado (no columna BD) que se añade tras el conteo.
 */
export interface CommunityRow {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_by: string
  created_at: string
  updated_at: string
  member_count: number
  reciprocity_threshold: number
}

/**
 * Tipo de dominio para una comunidad con campos en camelCase — Story 11.1.
 * Se obtiene siempre a través de communityFromRow() para garantizar el mapeo correcto.
 */
export interface Community {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  memberCount: number
  reciprocityThreshold: number
}

/**
 * Mapea un CommunityRow de Supabase al tipo de dominio Community.
 * Convierte todos los campos snake_case → camelCase — Story 11.1.
 */
export function communityFromRow(row: CommunityRow): Community {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imageUrl: row.image_url,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    memberCount: row.member_count,
    reciprocityThreshold: row.reciprocity_threshold,
  }
}

export interface CommunityMember {
  id: string
  community_id: string
  user_id: string
  role: CommunityRole
  joined_at: string
}

// ── Community Image Storage ──────────────────────────────────────────────────

export const COMMUNITY_IMAGES_BUCKET = 'community-images'

export const COMMUNITY_IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const COMMUNITY_IMAGE_MAX_SIZE = 5 * 1024 * 1024

export interface CommunityImageValidationResult {
  valid: boolean
  error?: string
}

export function validateCommunityImageFile(file: File): CommunityImageValidationResult {
  if (!COMMUNITY_IMAGE_ALLOWED_TYPES.includes(file.type as typeof COMMUNITY_IMAGE_ALLOWED_TYPES[number])) {
    return { valid: false, error: 'Formato no válido. Usa JPG, PNG o WebP' }
  }
  if (file.size > COMMUNITY_IMAGE_MAX_SIZE) {
    return { valid: false, error: 'La imagen no puede superar 5MB' }
  }
  return { valid: true }
}
