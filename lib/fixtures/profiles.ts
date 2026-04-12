import type { Profile, ProfileWithStats } from '@/lib/types/profiles'
import {
  USER_ALEX, USER_SARA, USER_TOM, USER_AVA, USER_KAI, USER_PRIYA,
} from './_ids'
import {
  AVATAR_ALEX, AVATAR_SARA, AVATAR_TOM, AVATAR_AVA, AVATAR_KAI, AVATAR_PRIYA,
} from './_images'

export const profileAlex: Profile = {
  id: USER_ALEX,
  name: 'Alex Rivera',
  bio: 'Product builder focused on team tools and async collaboration.',
  interests: ['product', 'remote-work', 'saas'],
  avatarUrl: AVATAR_ALEX,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

export const profileSara: Profile = {
  id: USER_SARA,
  name: 'Sara Medina',
  bio: 'Engineering manager with focus on team health and sustainable practices.',
  interests: ['engineering', 'teams', 'remote-work'],
  avatarUrl: AVATAR_SARA,
  createdAt: '2026-01-12T08:00:00Z',
  updatedAt: '2026-01-12T08:00:00Z',
}

export const profileTom: Profile = {
  id: USER_TOM,
  name: 'Tom Eriksen',
  bio: 'Platform engineer passionate about sustainability and cloud efficiency.',
  interests: ['platform-eng', 'sustainability', 'cloud'],
  avatarUrl: AVATAR_TOM,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
}

export const profileAva: Profile = {
  id: USER_AVA,
  name: 'Ava Chen',
  bio: 'Scrum master and agile coach helping teams improve their retrospectives.',
  interests: ['agile', 'retrospectives', 'team-dynamics'],
  avatarUrl: AVATAR_AVA,
  createdAt: '2026-01-20T09:00:00Z',
  updatedAt: '2026-01-20T09:00:00Z',
}

export const profileKai: Profile = {
  id: USER_KAI,
  name: 'Kai Nakamura',
  bio: 'UX researcher exploring validation methods for early-stage products.',
  interests: ['ux-research', 'validation', 'user-testing'],
  avatarUrl: AVATAR_KAI,
  createdAt: '2026-01-25T11:00:00Z',
  updatedAt: '2026-01-25T11:00:00Z',
}

export const profilePriya: Profile = {
  id: USER_PRIYA,
  name: 'Priya Sharma',
  bio: 'Data scientist turned product builder obsessed with growth metrics.',
  interests: ['data-science', 'product', 'analytics'],
  avatarUrl: AVATAR_PRIYA,
  createdAt: '2026-02-01T08:00:00Z',
  updatedAt: '2026-02-01T08:00:00Z',
}

/** Usuario recién registrado — sin datos de perfil. Útil para tests de empty state. */
export const profileNewUser: Profile = {
  id: 'a0000000-0000-4000-8000-000000000099',
  name: null,
  bio: null,
  interests: [],
  avatarUrl: null,
  createdAt: '2026-04-01T00:00:00Z',
  updatedAt: '2026-04-01T00:00:00Z',
}

// ── ProfileWithStats ──────────────────────────────────────────────────────────

export const profileAlexWithStats: ProfileWithStats = {
  ...profileAlex,
  feedbackCount: 5,
  projectCount: 2,
}

export const profileSaraWithStats: ProfileWithStats = {
  ...profileSara,
  feedbackCount: 4,
  projectCount: 2,
}

export const profileNewUserWithStats: ProfileWithStats = {
  ...profileNewUser,
  feedbackCount: 0,
  projectCount: 0,
}

// ── Colecciones ───────────────────────────────────────────────────────────────

export const ALL_PROFILES: Profile[] = [
  profileAlex, profileSara, profileTom, profileAva, profileKai, profilePriya,
]
