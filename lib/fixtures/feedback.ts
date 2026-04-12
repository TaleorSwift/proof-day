import type { Feedback, FeedbackEntryData } from '@/lib/types/feedback'
import {
  USER_ALEX, USER_SARA, USER_TOM, USER_KAI, USER_PRIYA,
  COMMUNITY_ALPHA, COMMUNITY_STARTUP_LAB,
  PROJECT_PULSE_CHECK, PROJECT_DOC_BRIDGE, PROJECT_RETRO_REPLAY,
  PROJECT_LIVE_ITERATE, PROJECT_LIVE_SCALE,
  FB_PULSE_1, FB_PULSE_2, FB_PULSE_3,
  FB_DOC_1,
  FB_RETRO_1, FB_RETRO_2,
  FB_ITERATE_1, FB_ITERATE_2, FB_ITERATE_3,
  FB_SCALE_1, FB_SCALE_2, FB_SCALE_3,
} from './_ids'

// ── Feedbacks — Pulse Check ────────────────────────────────────────────────────

/** scores: 3,3,2 | contributorType: top-reviewer | 4 campos de texto */
export const fbPulse1: Feedback = {
  id: FB_PULSE_1,
  projectId: PROJECT_PULSE_CHECK,
  reviewerId: USER_SARA,
  communityId: COMMUNITY_ALPHA,
  scores: { p1: 3, p2: 3, p3: 2 },
  textResponses: {
    p1: 'The problem is real — our team does manual check-ins every Friday and it takes 30 minutes.',
    p2: 'The trend visualization is the key differentiator. I would use this over a spreadsheet.',
    p3: 'Slack integration would make adoption seamless for remote teams.',
    p4: 'We already do informal check-ins — this would save time and be more honest.',
  },
  createdAt: '2026-03-20T14:00:00Z',
}

/** scores: 3,2,3 | contributorType: insightful | p4 solo */
export const fbPulse2: Feedback = {
  id: FB_PULSE_2,
  projectId: PROJECT_PULSE_CHECK,
  reviewerId: USER_KAI,
  communityId: COMMUNITY_ALPHA,
  scores: { p1: 3, p2: 2, p3: 3 },
  textResponses: {
    p4: 'I worry people will not be honest even anonymously if the team is small.',
  },
  createdAt: '2026-03-21T09:00:00Z',
}

/** scores: 2,3,2 | contributorType: changed-thinking | p1+p4 */
export const fbPulse3: Feedback = {
  id: FB_PULSE_3,
  projectId: PROJECT_PULSE_CHECK,
  reviewerId: USER_PRIYA,
  communityId: COMMUNITY_ALPHA,
  scores: { p1: 2, p2: 3, p3: 2 },
  textResponses: {
    p1: 'The problem resonates but I would want to see data on how it compares to 1:1s.',
    p4: 'Would love a comparison mode against existing team health tools.',
  },
  createdAt: '2026-03-21T11:00:00Z',
}

// ── Feedbacks — DocBridge ─────────────────────────────────────────────────────

/** scores: 3,3,3 | sin contributorType | 4 campos de texto */
export const fbDocBridge1: Feedback = {
  id: FB_DOC_1,
  projectId: PROJECT_DOC_BRIDGE,
  reviewerId: USER_TOM,
  communityId: COMMUNITY_ALPHA,
  scores: { p1: 3, p2: 3, p3: 3 },
  textResponses: {
    p1: 'This is literally the biggest pain point in our onboarding process.',
    p2: 'Would save weeks of senior engineer time answering repeated questions.',
    p3: 'Need to address privacy — not all Slack convos should be indexed.',
    p4: 'Address privacy concerns and this becomes a must-have for teams over 20 people.',
  },
  createdAt: '2026-03-19T12:00:00Z',
}

// ── Feedbacks — Retro Replay ──────────────────────────────────────────────────

/** scores: 1,1,2 | sin contributorType | p4 solo — territorio "Weak" */
export const fbRetro1: Feedback = {
  id: FB_RETRO_1,
  projectId: PROJECT_RETRO_REPLAY,
  reviewerId: USER_ALEX,
  communityId: COMMUNITY_ALPHA,
  scores: { p1: 1, p2: 1, p3: 2 },
  textResponses: {
    p4: 'Our team already uses Miro + Notion — I am not sure this adds enough value.',
  },
  createdAt: '2026-03-16T14:00:00Z',
}

/** scores: 2,1,1 | sin contributorType | p3+p4 — combo de puntuación más baja */
export const fbRetro2: Feedback = {
  id: FB_RETRO_2,
  projectId: PROJECT_RETRO_REPLAY,
  reviewerId: USER_SARA,
  communityId: COMMUNITY_ALPHA,
  scores: { p1: 2, p2: 1, p3: 1 },
  textResponses: {
    p3: 'The AI summary accuracy would need to be very high for this to be trusted.',
    p4: 'Clarify what this does that Miro + Notion cannot do better.',
  },
  createdAt: '2026-03-16T16:00:00Z',
}

// ── Feedbacks — Iterate Labs ─────────────────────────────────────────────────

/** scores: 2,2,2 | top-reviewer | 4 campos — punto medio exacto */
export const fbIterate1: Feedback = {
  id: FB_ITERATE_1,
  projectId: PROJECT_LIVE_ITERATE,
  reviewerId: USER_ALEX,
  communityId: COMMUNITY_STARTUP_LAB,
  scores: { p1: 2, p2: 2, p3: 2 },
  textResponses: {
    p1: 'I understand the problem but it happens less often than I expected.',
    p2: 'The prototype testing flow needs to be simpler before I commit.',
    p3: 'Pricing could block solo founders — needs a free tier.',
    p4: 'Solid concept but needs more polish before I would switch from my current tools.',
  },
  createdAt: '2026-03-15T10:00:00Z',
}

/** scores: 3,2,2 | sin contributorType | p4 solo */
export const fbIterate2: Feedback = {
  id: FB_ITERATE_2,
  projectId: PROJECT_LIVE_ITERATE,
  reviewerId: USER_SARA,
  communityId: COMMUNITY_STARTUP_LAB,
  scores: { p1: 3, p2: 2, p3: 2 },
  textResponses: {
    p4: 'The problem is real but the solution needs more differentiation from existing tools.',
  },
  createdAt: '2026-03-15T14:00:00Z',
}

/** scores: 2,3,2 | insightful | p2+p4 */
export const fbIterate3: Feedback = {
  id: FB_ITERATE_3,
  projectId: PROJECT_LIVE_ITERATE,
  reviewerId: USER_TOM,
  communityId: COMMUNITY_STARTUP_LAB,
  scores: { p1: 2, p2: 3, p3: 2 },
  textResponses: {
    p2: 'The value proposition for saving weeks of work is compelling and well articulated.',
    p4: 'Focus on the time-saving angle — that is the strongest hook for this audience.',
  },
  createdAt: '2026-03-16T09:00:00Z',
}

// ── Feedbacks — Scale Engine ─────────────────────────────────────────────────

/** scores: 3,3,3 | top-reviewer | 4 campos — puntuación perfecta */
export const fbScale1: Feedback = {
  id: FB_SCALE_1,
  projectId: PROJECT_LIVE_SCALE,
  reviewerId: USER_ALEX,
  communityId: COMMUNITY_STARTUP_LAB,
  scores: { p1: 3, p2: 3, p3: 3 },
  textResponses: {
    p1: 'Cloud waste is a constant pain. Every company I know is overpaying.',
    p2: 'ML-driven recommendations are the right approach — rule-based tools always break.',
    p3: 'Would pay for this immediately if the API coverage is solid.',
    p4: 'One of the strongest ideas I have reviewed. Ship it.',
  },
  createdAt: '2026-03-08T10:00:00Z',
}

/** scores: 3,3,2 | sin contributorType | p4 solo */
export const fbScale2: Feedback = {
  id: FB_SCALE_2,
  projectId: PROJECT_LIVE_SCALE,
  reviewerId: USER_SARA,
  communityId: COMMUNITY_STARTUP_LAB,
  scores: { p1: 3, p2: 3, p3: 2 },
  textResponses: {
    p4: 'Security and compliance will be the main objection — address that early.',
  },
  createdAt: '2026-03-08T14:00:00Z',
}

/** scores: 3,2,3 | changed-thinking | p1+p4 */
export const fbScale3: Feedback = {
  id: FB_SCALE_3,
  projectId: PROJECT_LIVE_SCALE,
  reviewerId: USER_KAI,
  communityId: COMMUNITY_STARTUP_LAB,
  scores: { p1: 3, p2: 2, p3: 3 },
  textResponses: {
    p1: 'I did not realize how bad cloud waste was until I saw the numbers in the demo.',
    p4: 'Changed my perspective on how actionable infrastructure data can be.',
  },
  createdAt: '2026-03-09T10:00:00Z',
}

// ── FeedbackEntryData — versión enriquecida para componentes ──────────────────

export const fbPulse1Entry: FeedbackEntryData = {
  id: fbPulse1.id,
  reviewerName: 'Sara Medina',
  createdAt: fbPulse1.createdAt,
  textResponses: fbPulse1.textResponses,
  contributorType: 'top-reviewer',
  scores: fbPulse1.scores,
}

export const fbPulse2Entry: FeedbackEntryData = {
  id: fbPulse2.id,
  reviewerName: 'Kai Nakamura',
  createdAt: fbPulse2.createdAt,
  textResponses: fbPulse2.textResponses,
  contributorType: 'insightful',
  scores: fbPulse2.scores,
}

export const fbPulse3Entry: FeedbackEntryData = {
  id: fbPulse3.id,
  reviewerName: 'Priya Sharma',
  createdAt: fbPulse3.createdAt,
  textResponses: fbPulse3.textResponses,
  contributorType: 'changed-thinking',
  scores: fbPulse3.scores,
}

export const fbScale1Entry: FeedbackEntryData = {
  id: fbScale1.id,
  reviewerName: 'Alex Rivera',
  createdAt: fbScale1.createdAt,
  textResponses: fbScale1.textResponses,
  contributorType: 'top-reviewer',
  scores: fbScale1.scores,
}

export const fbRetro1Entry: FeedbackEntryData = {
  id: fbRetro1.id,
  reviewerName: 'Alex Rivera',
  createdAt: fbRetro1.createdAt,
  textResponses: fbRetro1.textResponses,
  scores: fbRetro1.scores,
}

// ── Colecciones ───────────────────────────────────────────────────────────────

export const ALL_FEEDBACKS: Feedback[] = [
  fbPulse1, fbPulse2, fbPulse3,
  fbDocBridge1,
  fbRetro1, fbRetro2,
  fbIterate1, fbIterate2, fbIterate3,
  fbScale1, fbScale2, fbScale3,
]

export const PULSE_CHECK_FEEDBACKS: Feedback[] = [fbPulse1, fbPulse2, fbPulse3]
export const RETRO_FEEDBACKS: Feedback[] = [fbRetro1, fbRetro2]
export const ITERATE_FEEDBACKS: Feedback[] = [fbIterate1, fbIterate2, fbIterate3]
export const SCALE_FEEDBACKS: Feedback[] = [fbScale1, fbScale2, fbScale3]

export const PULSE_CHECK_ENTRIES: FeedbackEntryData[] = [
  fbPulse1Entry, fbPulse2Entry, fbPulse3Entry,
]
