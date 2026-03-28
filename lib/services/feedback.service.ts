import { createFeedbackRepository } from '@/lib/repositories/feedback.repository'
import { createCommunitiesRepository } from '@/lib/repositories/communities.repository'
import { createProjectsRepository } from '@/lib/repositories/projects.repository'
import { createClient } from '@/lib/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

type FeedbackEligibilityError = {
  eligible: false
  error: string
  code: string
  status: number
}

type FeedbackEligibilityOk = {
  eligible: true
}

type FeedbackEligibilityResult = FeedbackEligibilityOk | FeedbackEligibilityError

export function createFeedbackService(supabase: SupabaseClient) {
  const feedbackRepo = createFeedbackRepository(supabase)
  const communitiesRepo = createCommunitiesRepository(supabase)
  const projectsRepo = createProjectsRepository(supabase)

  return {
    /**
     * Validates all business rules for feedback eligibility.
     * Returns eligible: true or a structured error with HTTP status.
     */
    async validateEligibility(params: {
      projectId: string
      communityId: string
      reviewerId: string
    }): Promise<FeedbackEligibilityResult> {
      const { projectId, communityId, reviewerId } = params

      // 1. Proyecto existe
      const { data: project } = await projectsRepo.findById(projectId)
      if (!project) {
        return { eligible: false, error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND', status: 404 }
      }

      // 2. No hay decisión tomada (feedback bloqueado)
      if (project.decision !== null) {
        return {
          eligible: false,
          error: 'Feedback cerrado — el builder ya tomó una decisión',
          code: 'FEEDBACK_LOCKED',
          status: 409,
        }
      }

      // 3. Proyecto está live
      if (project.status !== 'live') {
        return {
          eligible: false,
          error: 'Solo se puede dar feedback en proyectos Live',
          code: 'PROJECT_NOT_LIVE',
          status: 422,
        }
      }

      // 4. No es feedback propio
      if (project.builder_id === reviewerId) {
        return {
          eligible: false,
          error: 'No puedes dar feedback en tu propio proyecto',
          code: 'FEEDBACK_SELF_NOT_ALLOWED',
          status: 422,
        }
      }

      // 5. communityId coincide con la comunidad real del proyecto
      if (project.community_id !== communityId) {
        return {
          eligible: false,
          error: 'La comunidad indicada no corresponde al proyecto',
          code: 'COMMUNITY_MISMATCH',
          status: 422,
        }
      }

      // 6. Reviewer es miembro de la comunidad
      const { data: member } = await communitiesRepo.checkMembership(communityId, reviewerId)
      if (!member) {
        return {
          eligible: false,
          error: 'No eres miembro de esta comunidad',
          code: 'COMMUNITY_ACCESS_DENIED',
          status: 403,
        }
      }

      // 7. No ha dado feedback ya
      const { data: existing } = await feedbackRepo.checkDuplicate(projectId, reviewerId)
      if (existing) {
        return {
          eligible: false,
          error: 'Ya has dado feedback en este proyecto',
          code: 'FEEDBACK_ALREADY_SUBMITTED',
          status: 409,
        }
      }

      return { eligible: true }
    },
  }
}
