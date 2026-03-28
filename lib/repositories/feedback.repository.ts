import { createClient } from '@/lib/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export function createFeedbackRepository(supabase: SupabaseClient) {
  return {
    async findByProject(projectId: string) {
      return supabase
        .from('feedbacks')
        .select(`
          id, text_responses, created_at,
          profiles:reviewer_id (id, name, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
    },

    async findByProjectBasic(projectId: string) {
      return supabase
        .from('feedbacks')
        .select('id, text_responses, created_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
    },

    async checkDuplicate(projectId: string, reviewerId: string) {
      return supabase
        .from('feedbacks')
        .select('id')
        .eq('project_id', projectId)
        .eq('reviewer_id', reviewerId)
        .maybeSingle()
    },

    async create(data: {
      projectId: string
      reviewerId: string
      communityId: string
      scores: Record<string, number>
      textResponses: Record<string, string>
    }) {
      return supabase
        .from('feedbacks')
        .insert({
          project_id: data.projectId,
          reviewer_id: data.reviewerId,
          community_id: data.communityId,
          scores: data.scores,
          text_responses: data.textResponses,
        })
        .select()
        .single()
    },

    async countByReviewerInCommunity(reviewerId: string, communityId: string) {
      return supabase
        .from('feedbacks')
        .select('id', { count: 'exact', head: true })
        .eq('community_id', communityId)
        .eq('reviewer_id', reviewerId)
    },

    async findWeeklyByCommunity(communityId: string, weekStart: Date) {
      return supabase
        .from('feedbacks')
        .select('reviewer_id, created_at')
        .eq('community_id', communityId)
        .gte('created_at', weekStart.toISOString())
    },
  }
}
