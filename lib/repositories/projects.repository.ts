import { createClient } from '@/lib/supabase/server'
import type { ProjectRow } from '@/lib/types/projects'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export function createProjectsRepository(supabase: SupabaseClient) {
  return {
    async findByCommunity(communityId: string) {
      return supabase
        .from('projects')
        .select('id, title, image_urls, status, builder_id, created_at, problem')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
    },

    async findById(projectId: string, fields = 'id, status, builder_id, community_id, decision') {
      const result = await supabase
        .from('projects')
        .select(fields)
        .eq('id', projectId)
        .single()
      return { data: result.data as ProjectRow | null, error: result.error }
    },

    async create(data: {
      communityId: string
      builderId: string
      title: string
      problem: string
      solution: string
      hypothesis: string
      imageUrls: string[]
      // Story 8.1 — campos opcionales
      targetUser?: string
      demoUrl?: string
      feedbackTopics?: string[]
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
          // Story 8.1 — campos opcionales (undefined no se envía a Supabase)
          ...(data.targetUser !== undefined && { target_user: data.targetUser }),
          ...(data.demoUrl !== undefined && { demo_url: data.demoUrl }),
          ...(data.feedbackTopics !== undefined && { feedback_topics: data.feedbackTopics }),
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
