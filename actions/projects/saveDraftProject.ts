'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { toSlug } from '@/lib/utils/slug'
import type { LaunchProjectInput } from './launchProject'

export type SaveDraftResult =
  | { success: true; projectId: string; projectSlug: string }
  | { success: false; error: string }

export async function saveDraftProject(input: LaunchProjectInput): Promise<SaveDraftResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: community } = await supabase
    .from('communities')
    .select('id')
    .eq('slug', input.communitySlug)
    .single()

  if (!community) return { success: false, error: 'Comunidad no encontrada' }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      slug: toSlug(input.title),
      title: input.title,
      tagline: input.tagline,
      problem: input.problem,
      solution: input.solution,
      target_user: input.targetUser ?? null,
      hypothesis: input.hypothesis || null,
      demo_url: input.demoLink ?? null,
      image_urls: input.imageUrls,
      feedback_topics: input.feedbackTopics.length > 0 ? input.feedbackTopics : null,
      community_id: community.id,
      builder_id: user.id,
      status: 'draft',
      ...(input.templateId !== undefined && { template_id: input.templateId }),
      custom_question: input.customQuestion?.trim() || null,
    })
    .select('id, slug')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/communities/${input.communitySlug}`)

  return { success: true, projectId: data.id, projectSlug: data.slug }
}
