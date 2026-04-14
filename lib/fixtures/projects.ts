import type { Project, ProjectRow } from '@/lib/types/projects'
import { projectFromRow } from '@/lib/types/projects'
import {
  USER_ALEX, USER_SARA, USER_TOM, USER_AVA, USER_KAI, USER_PRIYA,
  COMMUNITY_ALPHA, COMMUNITY_STARTUP_LAB,
  PROJECT_PULSE_CHECK, PROJECT_DOC_BRIDGE, PROJECT_CARBON_LEDGER,
  PROJECT_RETRO_REPLAY, PROJECT_DRAFT_NEW, PROJECT_LIVE_ITERATE,
  PROJECT_LIVE_SCALE, PROJECT_INACTIVE_ITERATE, PROJECT_INACTIVE_SCALE,
} from './_ids'
import {
  IMG_PULSE_CHECK_1, IMG_DOC_BRIDGE_1, IMG_RETRO_REPLAY_1,
  IMG_ITERATE_LABS_1, IMG_ITERATE_LABS_2,
  IMG_SCALE_ENGINE_1, IMG_SCALE_ENGINE_2, IMG_SCALE_ENGINE_3,
  IMG_PIVOT_TRACKER_1,
} from './_images'

// ── ProjectRows (snake_case — forma cruda de Supabase) ────────────────────────

const pulseCheckRow: ProjectRow = {
  id: PROJECT_PULSE_CHECK,
  slug: 'pulse-check',
  community_id: COMMUNITY_ALPHA,
  builder_id: USER_ALEX,
  title: 'Pulse Check',
  problem: 'Remote teams struggle to surface burnout and morale issues before they escalate.',
  solution: 'A lightweight weekly pulse survey with trend visualization for team leads.',
  hypothesis: 'If team leads see mood trends weekly, they will intervene 2x faster on morale dips.',
  image_urls: [IMG_PULSE_CHECK_1],
  status: 'live',
  decision: null,
  decided_at: null,
  created_at: '2026-03-20T10:00:00Z',
  updated_at: '2026-03-20T10:00:00Z',
  target_user: 'Engineering managers with 5+ remote reports',
  demo_url: 'https://example.com/pulse-demo',
  feedback_topics: ['Problem clarity', 'Willingness to use', 'Missing features'],
  tagline: 'Anonymous weekly mood tracking for distributed teams',
  would_use_count: 2,
}

const docBridgeRow: ProjectRow = {
  id: PROJECT_DOC_BRIDGE,
  slug: 'docbridge',
  community_id: COMMUNITY_ALPHA,
  builder_id: USER_SARA,
  title: 'DocBridge',
  problem: 'New hires spend weeks piecing together tribal knowledge scattered across Slack.',
  solution: 'ML-powered extraction of key decisions and processes from Slack history into structured docs.',
  hypothesis: 'Auto-generated docs will reduce onboarding time-to-productivity by 30%.',
  image_urls: [IMG_DOC_BRIDGE_1],
  status: 'live',
  decision: null,
  decided_at: null,
  created_at: '2026-03-19T08:00:00Z',
  updated_at: '2026-03-19T08:00:00Z',
  target_user: 'People Ops teams at companies with 50–200 employees',
  demo_url: null,
  feedback_topics: ['Onboarding speed', 'AI accuracy', 'Integration needs'],
  tagline: 'Auto-generate onboarding docs from Slack conversations',
  would_use_count: 1,
}

const carbonLedgerRow: ProjectRow = {
  id: PROJECT_CARBON_LEDGER,
  slug: 'carbon-ledger',
  community_id: COMMUNITY_ALPHA,
  builder_id: USER_TOM,
  title: 'Carbon Ledger',
  problem: 'Engineering teams have no visibility into the environmental cost of their cloud usage.',
  solution: 'Dashboard that maps AWS/GCP spend to estimated CO₂ output with reduction suggestions.',
  hypothesis: 'Visibility into carbon cost will drive 15% infrastructure optimization within 3 months.',
  image_urls: [],
  status: 'live',
  decision: null,
  decided_at: null,
  created_at: '2026-03-18T15:00:00Z',
  updated_at: '2026-03-18T15:00:00Z',
  target_user: 'Platform engineering teams at sustainability-conscious companies',
  demo_url: null,
  feedback_topics: ['Carbon accuracy', 'Cloud coverage', 'Action suggestions'],
  tagline: "Track your team's carbon footprint from cloud infrastructure",
  would_use_count: 0,
}

const retroReplayRow: ProjectRow = {
  id: PROJECT_RETRO_REPLAY,
  slug: 'retro-replay',
  community_id: COMMUNITY_ALPHA,
  builder_id: USER_AVA,
  title: 'Retro Replay',
  problem: 'Retro action items get lost and the same issues resurface every sprint.',
  solution: 'Record retros, auto-summarize themes, and track action item completion across sprints.',
  hypothesis: 'Tracked action items will have 2x higher completion rate than untracked ones.',
  image_urls: [IMG_RETRO_REPLAY_1],
  status: 'inactive',
  decision: 'abandon',
  decided_at: '2026-03-25T10:00:00Z',
  created_at: '2026-03-15T10:00:00Z',
  updated_at: '2026-03-25T10:00:00Z',
  target_user: 'Scrum masters and agile coaches',
  demo_url: null,
  feedback_topics: ['Summary quality', 'Action tracking', 'Integrations'],
  tagline: 'AI-powered summaries of sprint retrospectives with action tracking',
  would_use_count: 2,
}

const draftNewRow: ProjectRow = {
  id: PROJECT_DRAFT_NEW,
  slug: 'idea-sketch',
  community_id: COMMUNITY_ALPHA,
  builder_id: USER_ALEX,
  title: 'Idea Sketch',
  problem: '',
  solution: '',
  hypothesis: '',
  image_urls: [],
  status: 'draft',
  decision: null,
  decided_at: null,
  created_at: '2026-04-01T09:00:00Z',
  updated_at: '2026-04-01T09:00:00Z',
  target_user: null,
  demo_url: null,
  feedback_topics: null,
  tagline: null,
  would_use_count: 0,
}

const liveIterateRow: ProjectRow = {
  id: PROJECT_LIVE_ITERATE,
  slug: 'iterate-labs',
  community_id: COMMUNITY_STARTUP_LAB,
  builder_id: USER_KAI,
  title: 'Iterate Labs',
  problem: 'Indie hackers waste weeks building features users did not ask for.',
  solution: 'A rapid prototype testing platform that validates features before they are built.',
  hypothesis: 'Prototype testing will save an average of 3 weeks per feature cycle.',
  image_urls: [IMG_ITERATE_LABS_1, IMG_ITERATE_LABS_2],
  status: 'live',
  decision: 'iterate',
  decided_at: '2026-03-28T14:00:00Z',
  created_at: '2026-03-10T10:00:00Z',
  updated_at: '2026-03-28T14:00:00Z',
  target_user: 'Solo founders and small indie teams (1–3 people)',
  demo_url: 'https://example.com/iterate-demo',
  feedback_topics: ['UX flow', 'Performance', 'Pricing'],
  tagline: 'Rapid prototype testing for indie hackers',
  would_use_count: 4,
}

const liveScaleRow: ProjectRow = {
  id: PROJECT_LIVE_SCALE,
  slug: 'scale-engine',
  community_id: COMMUNITY_STARTUP_LAB,
  builder_id: USER_PRIYA,
  title: 'Scale Engine',
  problem: 'Growing startups over-provision infrastructure by 40% due to lack of auto-scaling intelligence.',
  solution: 'ML-powered auto-scaling recommendations that continuously right-size cloud resources.',
  hypothesis: 'Automated scaling decisions will reduce cloud costs by 35% within 2 months of adoption.',
  image_urls: [IMG_SCALE_ENGINE_1, IMG_SCALE_ENGINE_2, IMG_SCALE_ENGINE_3],
  status: 'live',
  decision: 'scale',
  decided_at: '2026-03-30T10:00:00Z',
  created_at: '2026-03-05T09:00:00Z',
  updated_at: '2026-03-30T10:00:00Z',
  target_user: 'CTOs and platform leads at Series A startups',
  demo_url: 'https://example.com/scale-demo',
  feedback_topics: ['Scalability', 'Security', 'API design'],
  tagline: 'Auto-scaling infrastructure optimizer',
  would_use_count: 8,
}

const inactiveIterateRow: ProjectRow = {
  id: PROJECT_INACTIVE_ITERATE,
  slug: 'pivot-tracker',
  community_id: COMMUNITY_STARTUP_LAB,
  builder_id: USER_SARA,
  title: 'Pivot Tracker',
  problem: 'Founding teams lose track of why strategic decisions were made.',
  solution: 'A lightweight log for tracking pivots, context, and outcomes across product iterations.',
  hypothesis: 'A pivot log will cut decision-replay time from days to minutes during investor conversations.',
  image_urls: [IMG_PIVOT_TRACKER_1],
  status: 'inactive',
  decision: 'iterate',
  decided_at: '2026-03-22T09:00:00Z',
  created_at: '2026-02-28T11:00:00Z',
  updated_at: '2026-03-22T09:00:00Z',
  target_user: 'Co-founders at seed-stage startups',
  demo_url: null,
  feedback_topics: ['Feature set', 'Market fit'],
  tagline: 'Track strategic pivots across product teams',
  would_use_count: 1,
}

const inactiveScaleRow: ProjectRow = {
  id: PROJECT_INACTIVE_SCALE,
  slug: 'growth-pulse',
  community_id: COMMUNITY_STARTUP_LAB,
  builder_id: USER_TOM,
  title: 'Growth Pulse',
  problem: 'Early-stage startups lack a single source of truth for growth metrics.',
  solution: 'A unified growth metrics dashboard pulling from Stripe, GA4, and Mixpanel.',
  hypothesis: 'Centralizing metrics will reduce weekly reporting prep from 4 hours to 30 minutes.',
  image_urls: [],
  status: 'inactive',
  decision: 'scale',
  decided_at: '2026-03-20T16:00:00Z',
  created_at: '2026-02-15T10:00:00Z',
  updated_at: '2026-03-20T16:00:00Z',
  target_user: 'Growth leads at startups with first revenue',
  demo_url: null,
  feedback_topics: ['Growth metrics', 'Reporting'],
  tagline: 'Growth metrics dashboard for startups',
  would_use_count: 3,
}

// ── Projects (camelCase — forma interna de la app) ────────────────────────────

export const projectPulseCheck: Project    = projectFromRow(pulseCheckRow)
export const projectDocBridge: Project     = projectFromRow(docBridgeRow)
export const projectCarbonLedger: Project  = projectFromRow(carbonLedgerRow)
export const projectRetroReplay: Project   = projectFromRow(retroReplayRow)
export const projectDraftNew: Project      = projectFromRow(draftNewRow)
export const projectLiveIterate: Project   = projectFromRow(liveIterateRow)
export const projectLiveScale: Project     = projectFromRow(liveScaleRow)
export const projectInactiveIterate: Project = projectFromRow(inactiveIterateRow)
export const projectInactiveScale: Project = projectFromRow(inactiveScaleRow)

// ── ProjectRows (para tests que trabajan con datos crudos de Supabase) ─────────

export const projectPulseCheckRow: ProjectRow    = pulseCheckRow
export const projectDocBridgeRow: ProjectRow     = docBridgeRow
export const projectCarbonLedgerRow: ProjectRow  = carbonLedgerRow
export const projectRetroReplayRow: ProjectRow   = retroReplayRow
export const projectDraftNewRow: ProjectRow      = draftNewRow
export const projectLiveIterateRow: ProjectRow   = liveIterateRow
export const projectLiveScaleRow: ProjectRow     = liveScaleRow
export const projectInactiveIterateRow: ProjectRow = inactiveIterateRow
export const projectInactiveScaleRow: ProjectRow = inactiveScaleRow

// ── Colecciones ───────────────────────────────────────────────────────────────

export const ALL_PROJECTS: Project[] = [
  projectPulseCheck, projectDocBridge, projectCarbonLedger, projectRetroReplay,
  projectDraftNew, projectLiveIterate, projectLiveScale,
  projectInactiveIterate, projectInactiveScale,
]

export const LIVE_PROJECTS: Project[] = ALL_PROJECTS.filter(p => p.status === 'live')
export const DRAFT_PROJECTS: Project[] = ALL_PROJECTS.filter(p => p.status === 'draft')
export const INACTIVE_PROJECTS: Project[] = ALL_PROJECTS.filter(p => p.status === 'inactive')

export const ALPHA_PROJECTS: Project[] = ALL_PROJECTS.filter(
  p => p.communityId === COMMUNITY_ALPHA,
)

export const LAB_PROJECTS: Project[] = ALL_PROJECTS.filter(
  p => p.communityId === COMMUNITY_STARTUP_LAB,
)
