import { createClient } from '@/lib/supabase/server'
import { createGamificationRepository } from '@/lib/repositories/gamification.repository'
import { calculateTopContributors } from '@/lib/utils/gamification'
import { TopContributorsList } from './TopContributorsList'
import type { TopContributor } from '@/lib/types/gamification'

interface TopContributorsProps {
  communityId: string
}

type FeedbackWithProfile = {
  reviewer_id: string
  created_at: string
  profiles: { name: string | null } | null
}

export async function TopContributors({ communityId }: TopContributorsProps) {
  const supabase = await createClient()
  const gamificationRepo = createGamificationRepository(supabase)

  const { data: feedbacks } = await gamificationRepo.getAllFeedbacksByCommunity(communityId)

  const feedbackList = (feedbacks ?? []) as unknown as FeedbackWithProfile[]

  const topResults = calculateTopContributors(feedbackList, 5)

  // Construir mapa reviewer_id → name desde los feedbacks con join (1 query, sin N+1)
  const nameMap = Object.fromEntries(
    feedbackList
      .filter((f) => f.profiles?.name)
      .map((f) => [f.reviewer_id, f.profiles!.name!])
  )

  const contributors: TopContributor[] = topResults.map((result) => ({
    userId: result.userId,
    name: nameMap[result.userId] ?? result.userId.slice(0, 8),
    feedbackCount: result.feedbackCount,
  }))

  return <TopContributorsList contributors={contributors} />
}
