import { createClient } from '@/lib/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export function createProjectsRepository(supabase: SupabaseClient) {
  return {
    async findByCommunity(communityId: string) {
      return supabase
        .from('projects')
        .select('id, title, image_urls, status, builder_id, created_at')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
    },

    async findById(projectId: string, fields = 'id, status, builder_id, community_id, decision') {
      return supabase
        .from('projects')
        .select(fields)
        .eq('id', projectId)
        .single()
    },

    async create(data: {
      communityId: string
      builderId: string
      title: string
      problem: string
      solution: string
      hypothesis: string
      imageUrls: string[]
    }) {
      return supabase
        .from('projects')
        .insert({
          community_id: data.communityId,
          builder_id: data.builderId,
          title: data.title,
          problem: data.problem,
          solution: data.solution,
          hypothesis: data.hypothesis,
          image_urls: data.imageUrls,
          status: 'draft',
        })
        .select()
        .single()
    },

    async countByBuilder(builderId: string) {
      return supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('builder_id', builderId)
    },
  }
}
