import { createClient } from '@/lib/supabase/server'
import { feedbackFromRow } from '@/lib/types/feedback'
import type { FeedbackRow, Feedback } from '@/lib/types/feedback'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export function createFeedbackRepository(supabase: SupabaseClient) {
  return {
    async findByProject(projectId: string) {
      return supabase
        .from('feedbacks')
        .select(`
          id, scores, text_responses, quality_score, created_at, iteration_id,
          profiles:reviewer_id (id, name, avatar_url),
          project_iterations:iteration_id (version_number)
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
      // Story 11.2 — respuesta custom opcional del Reviewer
      customAnswer?: string | null
      // Story 11.3 — quality score calculado antes de persistir
      qualityScore?: number
      // Story 13.4 — iteración vigente al momento del feedback
      iterationId?: string | null
    }): Promise<{ data: Feedback | null; error: unknown }> {
      const { data: row, error } = await supabase
        .from('feedbacks')
        .insert({
          project_id: data.projectId,
          reviewer_id: data.reviewerId,
          community_id: data.communityId,
          scores: data.scores,
          text_responses: data.textResponses,
          // Story 11.2 — columna custom_answer (null si no se proporciona)
          custom_answer: data.customAnswer ?? null,
          // Story 11.3 — columna quality_score (null si no se proporciona)
          quality_score: data.qualityScore ?? null,
          // Story 13.4 — columna iteration_id (null si no hay iteración vigente)
          iteration_id: data.iterationId ?? null,
        })
        .select()
        .single()

      if (error || !row) return { data: null, error }

      return { data: feedbackFromRow(row as FeedbackRow), error: null }
    },

    async countByReviewerInCommunity(reviewerId: string, communityId: string) {
      return supabase
        .from('feedbacks')
        .select('id', { count: 'exact', head: true })
        .eq('community_id', communityId)
        .eq('reviewer_id', reviewerId)
    },

    // Story 11.5 — conteo de feedbacks en los últimos N días (para gate de reciprocidad)
    async countByReviewerInCommunityRecent(reviewerId: string, communityId: string, days: number) {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      return supabase
        .from('feedbacks')
        .select('id', { count: 'exact', head: true })
        .eq('community_id', communityId)
        .eq('reviewer_id', reviewerId)
        .gte('created_at', since)
    },

    async findWeeklyByCommunity(communityId: string, weekStart: Date) {
      return supabase
        .from('feedbacks')
        .select('reviewer_id, created_at')
        .eq('community_id', communityId)
        .gte('created_at', weekStart.toISOString())
    },

    // Story 12.7 — cuenta feedbacks con quality_score >= qualityThreshold para un proyecto
    async countCompleteByProject(projectId: string, qualityThreshold = 0.6): Promise<number> {
      const { count, error } = await supabase
        .from('feedbacks')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .gte('quality_score', qualityThreshold)
      if (error) return 0
      return count ?? 0
    },
  }
}
