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
  description: string
  image_url: string | null
  created_by: string
  created_at: string
  updated_at: string
  member_count: number  // número de miembros — añadido en story 2.3
}

export interface CommunityMember {
  id: string
  community_id: string
  user_id: string
  role: CommunityRole
  joined_at: string
}
