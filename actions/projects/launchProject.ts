'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { toSlug } from '@/lib/utils/slug'

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
}

export type LaunchProjectResult =
  | { success: true; projectId: string }
  | { success: false; error: string }

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
    .select('id')
    .eq('slug', input.communitySlug)
    .single()

  if (!community) {
    return { success: false, error: 'Comunidad no encontrada' }
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
    })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/communities/${input.communitySlug}`)

  return { success: true, projectId: data.id }
}
