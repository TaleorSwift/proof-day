'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { toSlug } from '@/lib/utils/slug'
import { buildReciprocityMessage } from '@/lib/utils/reciprocity'

export interface LaunchProjectInput {
  communitySlug: string
  title: string
  tagline: string
  problem: string
  solution: string
  targetUser?: string
  hypothesis: string
  demoLink?: string
  imageUrls: string[]
  feedbackTopics: string[]
  // Story 10.2 — template Phase 2
  templateId?: string | null
  // Story 11.2 — pregunta custom del Builder
  customQuestion?: string
}

export type LaunchProjectResult =
  | { success: true; projectId: string; projectSlug: string }
  | { success: false; error: string; code?: string }

export async function launchProject(input: LaunchProjectInput): Promise<LaunchProjectResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No autenticado' }
  }

  const { data: community } = await supabase
    .from('communities')
    .select('id, reciprocity_threshold')
    .eq('slug', input.communitySlug)
    .single()

  if (!community) {
    return { success: false, error: 'Comunidad no encontrada' }
  }

  // Story 11.5 — Gate de reciprocidad: verificar feedbacks dados en los últimos 30 días
  const threshold = (community as { id: string; reciprocity_threshold: number }).reciprocity_threshold ?? 0
  if (threshold > 0) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('feedbacks')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', (community as { id: string }).id)
      .eq('reviewer_id', user.id)
      .gte('created_at', thirtyDaysAgo)

    const given = count ?? 0
    if (given < threshold) {
      return {
        success: false,
        error: buildReciprocityMessage(given, threshold),
        code: 'RECIPROCITY_GATE_BLOCKED',
      }
    }
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      slug: toSlug(input.title),
      title: input.title,
      tagline: input.tagline,
      problem: input.problem,
      solution: input.solution,
      target_user: input.targetUser ?? null,
      hypothesis: input.hypothesis,
      demo_url: input.demoLink ?? null,
      image_urls: input.imageUrls,
      feedback_topics: input.feedbackTopics,
      community_id: community.id,
      builder_id: user.id,
      status: 'live',
      // Story 10.2 — template Phase 2 (undefined no se envía a Supabase)
      ...(input.templateId !== undefined && { template_id: input.templateId }),
      // Story 11.2 — pregunta custom del Builder
      custom_question: input.customQuestion && input.customQuestion.trim().length > 0
        ? input.customQuestion
        : null,
    })
    .select('id, slug')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/communities/${input.communitySlug}`)

  return { success: true, projectId: data.id, projectSlug: data.slug }
}
