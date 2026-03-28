import { createClient } from '@/lib/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export function createGamificationRepository(supabase: SupabaseClient) {
  return {
    async getWeeklyFeedbacks(communityId: string, weekStart: Date) {
      return supabase
        .from('feedbacks')
        .select('reviewer_id, created_at')
        .eq('community_id', communityId)
        .gte('created_at', weekStart.toISOString())
    },

    async getFeedbackCountByReviewer(communityId: string, reviewerId: string) {
      return supabase
        .from('feedbacks')
        .select('id', { count: 'exact', head: true })
        .eq('community_id', communityId)
        .eq('reviewer_id', reviewerId)
    },
  }
}
