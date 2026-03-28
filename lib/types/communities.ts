export type CommunityRole = 'admin' | 'member'

/**
 * Representa una comunidad tal como la devuelve Supabase (snake_case).
 * La API route retorna la fila directamente — no hay mapeo camelCase.
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
