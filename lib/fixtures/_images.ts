/**
 * URLs de imágenes placeholder usando picsum.photos con seeds determinísticos.
 * El mismo seed siempre devuelve la misma imagen → tests visuales estables.
 */

export const avatar = (seed: string): string =>
  `https://picsum.photos/seed/${seed}/200/200`

export const projectImage = (seed: string): string =>
  `https://picsum.photos/seed/${seed}/800/600`

export const communityImage = (seed: string): string =>
  `https://picsum.photos/seed/${seed}/400/400`

// ── Avatares ─────────────────────────────────────────────────────────────────
export const AVATAR_ALEX  = avatar('alex-rivera')
export const AVATAR_SARA  = avatar('sara-medina')
export const AVATAR_TOM   = avatar('tom-eriksen')
export const AVATAR_AVA   = avatar('ava-chen')
export const AVATAR_KAI   = avatar('kai-nakamura')
export const AVATAR_PRIYA = avatar('priya-sharma')

// ── Imágenes de proyectos ─────────────────────────────────────────────────────
export const IMG_PULSE_CHECK_1     = projectImage('pulse-check-1')
export const IMG_DOC_BRIDGE_1      = projectImage('doc-bridge-1')
export const IMG_RETRO_REPLAY_1    = projectImage('retro-replay-1')
export const IMG_ITERATE_LABS_1    = projectImage('iterate-labs-1')
export const IMG_ITERATE_LABS_2    = projectImage('iterate-labs-2')
export const IMG_SCALE_ENGINE_1    = projectImage('scale-engine-1')
export const IMG_SCALE_ENGINE_2    = projectImage('scale-engine-2')
export const IMG_SCALE_ENGINE_3    = projectImage('scale-engine-3')
export const IMG_PIVOT_TRACKER_1   = projectImage('pivot-tracker-1')

// ── Imágenes de comunidades ───────────────────────────────────────────────────
export const IMG_COMMUNITY_ALPHA       = communityImage('producto-alpha')
export const IMG_COMMUNITY_STARTUP_LAB = communityImage('startup-lab')
