import { createClient } from '@/lib/supabase/server'
import { createGamificationRepository } from '@/lib/repositories/gamification.repository'
import { createProfilesRepository } from '@/lib/repositories/profiles.repository'
import { calculateTopContributors } from '@/lib/utils/gamification'
import { TopContributorsList } from './TopContributorsList'
import type { TopContributor } from '@/lib/types/gamification'

interface TopContributorsProps {
  communityId: string
}

export async function TopContributors({ communityId }: TopContributorsProps) {
  const supabase = await createClient()
  const gamificationRepo = createGamificationRepository(supabase)
  const profilesRepo = createProfilesRepository(supabase)

  const { data: feedbacks } = await gamificationRepo.getAllFeedbacksByCommunity(communityId)

  const topResults = calculateTopContributors(feedbacks ?? [], 5)

  // Resolve nombres de perfil en paralelo — 5 queries máximo (N+1 aceptable documentado)
  const profileResults = await Promise.all(
    topResults.map(({ userId }) => profilesRepo.findByIdForWidget(userId))
  )

  const contributors: TopContributor[] = topResults.map((result, index) => ({
    userId: result.userId,
    name: profileResults[index].data?.name ?? 'Usuario',
    feedbackCount: result.feedbackCount,
  }))

  return <TopContributorsList contributors={contributors} />
}
