import { createCommunitiesRepository } from '@/lib/repositories/communities.repository'
import { createProjectsRepository } from '@/lib/repositories/projects.repository'
import { createClient } from '@/lib/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

type ServiceError = {
  ok: false
  error: string
  code: string
  status: number
}

type ServiceOk = {
  ok: true
}

type ServiceResult = ServiceOk | ServiceError

export function createProjectsService(supabase: SupabaseClient) {
  const projectsRepo = createProjectsRepository(supabase)
  const communitiesRepo = createCommunitiesRepository(supabase)

  return {
    /**
     * Validates that the given user owns the project.
     */
    async validateOwnership(projectId: string, userId: string): Promise<ServiceResult> {
      const { data: project } = await projectsRepo.findById(projectId, 'id, builder_id')
      if (!project) {
        return { ok: false, error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND', status: 404 }
      }
      if (project.builder_id !== userId) {
        return { ok: false, error: 'No tienes permiso para modificar este proyecto', code: 'FORBIDDEN', status: 403 }
      }
      return { ok: true }
    },

    /**
     * Validates the user has membership in the given community.
     */
    async validateMembership(communityId: string, userId: string): Promise<ServiceResult> {
      const { data: member } = await communitiesRepo.checkMembership(communityId, userId)
      if (!member) {
        return { ok: false, error: 'No eres miembro de esta comunidad', code: 'COMMUNITY_ACCESS_DENIED', status: 403 }
      }
      return { ok: true }
    },
  }
}
