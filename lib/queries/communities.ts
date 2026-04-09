import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Community } from '@/lib/types/communities'

/**
 * Obtiene las comunidades del usuario autenticado con member_count.
 * Usa React.cache para deduplicar la llamada a Supabase dentro de un mismo request
 * (evita el doble fetch entre layout.tsx y page.tsx en /communities).
 *
 * El resultado incluye el filtro explícito de membresía (segunda línea de defensa además de RLS).
 */
export const getUserCommunities = cache(async (userId: string): Promise<Community[]> => {
  const supabase = await createClient()

  const { data: rawCommunities, error } = await supabase
    .from('communities')
    .select(`
      id,
      name,
      slug,
      description,
      image_url,
      created_by,
      created_at,
      updated_at,
      community_members!inner(user_id)
    `)
    .eq('community_members.user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getUserCommunities] Error fetching communities:', error)
    return []
  }

  const communities = rawCommunities ?? []

  if (communities.length === 0) return []

  // Obtener conteo de miembros para todas las comunidades en una sola query
  const communityIds = communities.map((c: Record<string, unknown>) => c.id as string)
  const { data: memberData } = await supabase
    .from('community_members')
    .select('community_id')
    .in('community_id', communityIds)

  const memberCounts: Record<string, number> = (memberData ?? []).reduce(
    (acc: Record<string, number>, row: Record<string, unknown>) => {
      const id = row.community_id as string
      acc[id] = (acc[id] ?? 0) + 1
      return acc
    },
    {},
  )

  return communities.map((c: Record<string, unknown>) => ({
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
    description: c.description as string,
    image_url: c.image_url as string | null,
    created_by: c.created_by as string,
    created_at: c.created_at as string,
    updated_at: c.updated_at as string,
    member_count: memberCounts[c.id as string] ?? 0,
  }))
})
