import { createClient } from '@/lib/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export function createCommunitiesRepository(supabase: SupabaseClient) {
  return {
    async findByUserId(userId: string) {
      return supabase
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
    },

    async getMemberCounts(communityIds: string[]) {
      return supabase
        .from('community_members')
        .select('community_id')
        .in('community_id', communityIds)
    },

    async findBySlug(slug: string) {
      return supabase
        .from('communities')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
    },

    async create(data: {
      name: string
      slug: string
      description: string | null
      imageUrl: string | null
      createdBy: string
    }) {
      return supabase
        .from('communities')
        .insert({
          name: data.name,
          slug: data.slug,
          description: data.description,
          image_url: data.imageUrl,
          created_by: data.createdBy,
        })
        .select()
        .single()
    },

    async addMember(communityId: string, userId: string, role: 'admin' | 'member') {
      return supabase
        .from('community_members')
        .insert({ community_id: communityId, user_id: userId, role })
    },

    async checkMembership(communityId: string, userId: string) {
      return supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .single()
    },

    async getSharedCommunities(viewerUserId: string, targetUserId: string) {
      const { data: targetCommunities } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', targetUserId)

      const targetIds = (targetCommunities ?? []).map(
        (m: Record<string, unknown>) => m.community_id
      )

      return supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', viewerUserId)
        .in('community_id', targetIds)
        .limit(1)
    },
  }
}
