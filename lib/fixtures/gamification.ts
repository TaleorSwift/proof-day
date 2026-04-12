import type { TopReviewer, FeedbackCountStats, TopContributor } from '@/lib/types/gamification'
import { USER_ALEX, USER_SARA, USER_TOM, COMMUNITY_ALPHA, COMMUNITY_STARTUP_LAB, COMMUNITY_EMPTY } from './_ids'
import { AVATAR_ALEX, AVATAR_SARA } from './_images'

// ── Top Reviewers ─────────────────────────────────────────────────────────────

export const topReviewerAlex: TopReviewer = {
  userId: USER_ALEX,
  name: 'Alex Rivera',
  avatarUrl: AVATAR_ALEX,
  feedbackCount: 5,
}

export const topReviewerSara: TopReviewer = {
  userId: USER_SARA,
  name: 'Sara Medina',
  avatarUrl: AVATAR_SARA,
  feedbackCount: 4,
}

export const topReviewerTom: TopReviewer = {
  userId: USER_TOM,
  name: 'Tom Eriksen',
  avatarUrl: null,
  feedbackCount: 2,
}

/** Reviewer sin nombre ni avatar — tests de empty/missing data. */
export const topReviewerAnonymous: TopReviewer = {
  userId: 'a0000000-0000-4000-8000-000000000099',
  name: null,
  avatarUrl: null,
  feedbackCount: 1,
}

// ── Top Contributors ─────────────────────────────────────────────────────────

export const topContributorAlex: TopContributor = {
  userId: USER_ALEX,
  name: 'Alex Rivera',
  feedbackCount: 5,
}

export const topContributorSara: TopContributor = {
  userId: USER_SARA,
  name: 'Sara Medina',
  feedbackCount: 4,
}

// ── Feedback Count Stats ─────────────────────────────────────────────────────

/** Comunidad activa con bastante actividad. */
export const feedbackStatsAlpha: FeedbackCountStats = {
  count: 9,
  communityId: COMMUNITY_ALPHA,
}

/** Comunidad con actividad inicial. */
export const feedbackStatsLab: FeedbackCountStats = {
  count: 3,
  communityId: COMMUNITY_STARTUP_LAB,
}

/** Comunidad vacía — tests de zero state. */
export const feedbackStatsEmpty: FeedbackCountStats = {
  count: 0,
  communityId: COMMUNITY_EMPTY,
}

// ── Colecciones ───────────────────────────────────────────────────────────────

export const ALL_TOP_REVIEWERS: TopReviewer[] = [
  topReviewerAlex, topReviewerSara, topReviewerTom,
]
