import { createCommunitiesRepository } from '@/lib/repositories/communities.repository'
import { createClient } from '@/lib/supabase/server'
import { toSlug } from '@/lib/utils/slug'

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

type SlugResult = { ok: true; slug: string } | ServiceError

export function createCommunitiesService(supabase: SupabaseClient) {
  const communitiesRepo = createCommunitiesRepository(supabase)

  return {
    /**
     * Validates membership in the given community.
     */
    async validateMembership(communityId: string, userId: string): Promise<ServiceOk | ServiceError> {
      const { data: member } = await communitiesRepo.checkMembership(communityId, userId)
      if (!member) {
        return { ok: false, error: 'No eres miembro de esta comunidad', code: 'COMMUNITY_ACCESS_DENIED', status: 403 }
      }
      return { ok: true }
    },

    /**
     * Generates a unique slug from a community name.
     * Returns error if slug is empty or already taken.
     */
    async generateUniqueSlug(name: string): Promise<SlugResult> {
      const slug = toSlug(name)
      if (!slug) {
        return {
          ok: false,
          error: 'El nombre no produce un identificador válido. Usa letras o números.',
          code: 'INVALID_SLUG',
          status: 400,
        }
      }

      const { data: existing } = await communitiesRepo.findBySlug(slug)
      if (existing) {
        return { ok: false, error: 'Ya existe una comunidad con ese nombre', code: 'COMMUNITY_NAME_TAKEN', status: 409 }
      }

      return { ok: true, slug }
    },
  }
}
