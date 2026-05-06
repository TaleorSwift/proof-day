export type CommunityRole = 'admin' | 'member'

/**
 * Representa una comunidad con campos en snake_case.
 * El tipo interno usa snake_case para consistencia con el esquema de BD.
 * La API Route GET /api/communities mapea estos campos a camelCase en la respuesta JSON
 * (image_url → imageUrl, created_at → createdAt, member_count → memberCount).
 */
export interface Community {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  created_by: string
  created_at: string
  updated_at: string
  member_count: number  // número de miembros — añadido en story 2.3
  // Story 11.1 — reciprocidad
  reciprocity_threshold: number
}

/** Forma del row tal como lo devuelve Supabase (snake_case) — Story 11.1 */
export type CommunityRow = Community

/**
 * Mapea un CommunityRow de Supabase a un objeto Community del dominio.
 * Community ya usa snake_case, por lo que el mapper es una copia directa.
 * Incluido para consistencia de patrón con el resto de entidades — Story 11.1.
 */
export function communityFromRow(row: CommunityRow): Community {
  return { ...row }
}

export interface CommunityMember {
  id: string
  community_id: string
  user_id: string
  role: CommunityRole
  joined_at: string
}
