import type { Community, CommunityMember } from '@/lib/types/communities'
import {
  USER_ALEX, USER_SARA, USER_TOM, USER_AVA, USER_KAI, USER_PRIYA,
  COMMUNITY_ALPHA, COMMUNITY_STARTUP_LAB, COMMUNITY_EMPTY,
  MEMBER_ALEX_ALPHA_ADMIN, MEMBER_SARA_ALPHA, MEMBER_TOM_ALPHA,
  MEMBER_AVA_ALPHA, MEMBER_KAI_ALPHA,
  MEMBER_SARA_LAB_ADMIN, MEMBER_ALEX_LAB, MEMBER_PRIYA_LAB,
  MEMBER_ALEX_EMPTY_ADMIN,
} from './_ids'
import { IMG_COMMUNITY_ALPHA, IMG_COMMUNITY_STARTUP_LAB, IMG_COMMUNITY_EMPTY } from './_images'

// ── Communities ───────────────────────────────────────────────────────────────

export const communityAlpha: Community = {
  id: COMMUNITY_ALPHA,
  name: 'Producto Alpha',
  slug: 'producto-alpha',
  description: 'Comunidad de validación del equipo de producto. Ideas en estado temprano, feedback rápido.',
  image_url: IMG_COMMUNITY_ALPHA,
  created_by: USER_ALEX,
  created_at: '2026-01-10T10:00:00Z',
  updated_at: '2026-01-10T10:00:00Z',
  member_count: 5,
}

export const communityStartupLab: Community = {
  id: COMMUNITY_STARTUP_LAB,
  name: 'Startup Lab',
  slug: 'startup-lab',
  description: 'Ideas en validación temprana para fundadores en etapa pre-seed.',
  image_url: IMG_COMMUNITY_STARTUP_LAB,
  created_by: USER_SARA,
  created_at: '2026-02-01T09:00:00Z',
  updated_at: '2026-02-01T09:00:00Z',
  member_count: 3,
}

/** Comunidad sin proyectos ni actividad. Útil para tests de empty state. */
export const communityEmpty: Community = {
  id: COMMUNITY_EMPTY,
  name: 'Empty Space',
  slug: 'empty-space',
  description: 'Comunidad recién creada, sin proyectos todavía.',
  image_url: IMG_COMMUNITY_EMPTY,
  created_by: USER_ALEX,
  created_at: '2026-04-01T00:00:00Z',
  updated_at: '2026-04-01T00:00:00Z',
  member_count: 1,
}

// ── Community Members ─────────────────────────────────────────────────────────

// Producto Alpha (5 miembros)
export const memberAlexAlphaAdmin: CommunityMember = {
  id: MEMBER_ALEX_ALPHA_ADMIN,
  community_id: COMMUNITY_ALPHA,
  user_id: USER_ALEX,
  role: 'admin',
  joined_at: '2026-01-10T10:00:00Z',
}

export const memberSaraAlpha: CommunityMember = {
  id: MEMBER_SARA_ALPHA,
  community_id: COMMUNITY_ALPHA,
  user_id: USER_SARA,
  role: 'member',
  joined_at: '2026-01-12T08:00:00Z',
}

export const memberTomAlpha: CommunityMember = {
  id: MEMBER_TOM_ALPHA,
  community_id: COMMUNITY_ALPHA,
  user_id: USER_TOM,
  role: 'member',
  joined_at: '2026-01-15T10:00:00Z',
}

export const memberAvaAlpha: CommunityMember = {
  id: MEMBER_AVA_ALPHA,
  community_id: COMMUNITY_ALPHA,
  user_id: USER_AVA,
  role: 'member',
  joined_at: '2026-01-20T09:00:00Z',
}

export const memberKaiAlpha: CommunityMember = {
  id: MEMBER_KAI_ALPHA,
  community_id: COMMUNITY_ALPHA,
  user_id: USER_KAI,
  role: 'member',
  joined_at: '2026-01-25T11:00:00Z',
}

// Startup Lab (3 miembros)
export const memberSaraLabAdmin: CommunityMember = {
  id: MEMBER_SARA_LAB_ADMIN,
  community_id: COMMUNITY_STARTUP_LAB,
  user_id: USER_SARA,
  role: 'admin',
  joined_at: '2026-02-01T09:00:00Z',
}

export const memberAlexLab: CommunityMember = {
  id: MEMBER_ALEX_LAB,
  community_id: COMMUNITY_STARTUP_LAB,
  user_id: USER_ALEX,
  role: 'member',
  joined_at: '2026-02-05T10:00:00Z',
}

export const memberPriyaLab: CommunityMember = {
  id: MEMBER_PRIYA_LAB,
  community_id: COMMUNITY_STARTUP_LAB,
  user_id: USER_PRIYA,
  role: 'member',
  joined_at: '2026-02-10T11:00:00Z',
}

// Empty Space (1 miembro)
export const memberAlexEmptyAdmin: CommunityMember = {
  id: MEMBER_ALEX_EMPTY_ADMIN,
  community_id: COMMUNITY_EMPTY,
  user_id: USER_ALEX,
  role: 'admin',
  joined_at: '2026-04-01T00:00:00Z',
}

// ── Colecciones ───────────────────────────────────────────────────────────────

export const ALL_COMMUNITIES: Community[] = [
  communityAlpha, communityStartupLab, communityEmpty,
]

export const ALPHA_MEMBERS: CommunityMember[] = [
  memberAlexAlphaAdmin, memberSaraAlpha, memberTomAlpha, memberAvaAlpha, memberKaiAlpha,
]

export const LAB_MEMBERS: CommunityMember[] = [
  memberSaraLabAdmin, memberAlexLab, memberPriyaLab,
]
