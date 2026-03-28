import { createClient } from '@/lib/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export function createProfilesRepository(supabase: SupabaseClient) {
  return {
    async findById(id: string) {
      return supabase
        .from('profiles')
        .select('id, name, bio, interests, avatar_url, created_at, updated_at')
        .eq('id', id)
        .single()
    },

    async findByIdForWidget(id: string) {
      return supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .eq('id', id)
        .single()
    },

    async update(
      id: string,
      data: { name?: string; bio?: string; interests?: string[] }
    ) {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }
      if (data.name !== undefined) updateData.name = data.name
      if (data.bio !== undefined) updateData.bio = data.bio
      if (data.interests !== undefined) updateData.interests = data.interests

      return supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id)
        .select('id, name, bio, interests, avatar_url, created_at, updated_at')
        .single()
    },
  }
}
