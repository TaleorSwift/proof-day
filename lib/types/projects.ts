export type ProjectStatus = 'draft' | 'live' | 'inactive'
export type ProjectDecision = 'iterate' | 'scale' | 'abandon'

export interface Project {
  id: string
  communityId: string
  builderId: string
  title: string
  problem: string
  solution: string
  hypothesis: string
  imageUrls: string[]
  status: ProjectStatus
  decision: ProjectDecision | null
  decidedAt: string | null
  createdAt: string
  updatedAt: string
  // Story 8.1 — campos opcionales de detalle
  targetUser: string | null
  demoUrl: string | null
  feedbackTopics: string[] | null
}

/** Forma del row tal como lo devuelve Supabase (snake_case) */
export interface ProjectRow {
  id: string
  community_id: string
  builder_id: string
  title: string
  problem: string
  solution: string
  hypothesis: string
  image_urls: string[]
  status: ProjectStatus
  decision: ProjectDecision | null
  decided_at: string | null
  created_at: string
  updated_at: string
  // Story 8.1 — campos opcionales de detalle
  target_user: string | null
  demo_url: string | null
  feedback_topics: string[] | null
}

export function projectFromRow(row: ProjectRow): Project {
  return {
    id: row.id,
    communityId: row.community_id,
    builderId: row.builder_id,
    title: row.title,
    problem: row.problem,
    solution: row.solution,
    hypothesis: row.hypothesis,
    imageUrls: row.image_urls,
    status: row.status,
    decision: row.decision,
    decidedAt: row.decided_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Story 8.1 — campos opcionales de detalle
    targetUser: row.target_user,
    demoUrl: row.demo_url,
    feedbackTopics: row.feedback_topics,
  }
}

// ── Story 3.2: Image Gallery ─────────────────────────────────────────────────

/** Storage bucket name — NEVER hardcode this value elsewhere */
export const PROJECT_IMAGES_BUCKET = 'project-images'

/** Allowed MIME types for project images */
export const PROJECT_IMAGE_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/** Maximum file size per image in bytes (5MB) */
export const PROJECT_IMAGE_MAX_SIZE = 5 * 1024 * 1024

/** Maximum number of images per project */
export const PROJECT_IMAGES_MAX_COUNT = 5

export interface ProjectImage {
  id: string       // filename in Storage
  url: string      // public URL
  path: string     // relative path in Storage: {userId}/{projectId}/{filename}
  order: number
}

export interface ImageValidationResult {
  valid: boolean
  error?: string
}

export function validateImageFile(file: File): ImageValidationResult {
  if (!PROJECT_IMAGE_ALLOWED_TYPES.includes(file.type as typeof PROJECT_IMAGE_ALLOWED_TYPES[number])) {
    return { valid: false, error: 'Formato no válido. Usa JPG, PNG o WebP' }
  }
  if (file.size > PROJECT_IMAGE_MAX_SIZE) {
    return { valid: false, error: 'La imagen no puede superar 5MB' }
  }
  return { valid: true }
}

export function validateImageCount(currentCount: number): ImageValidationResult {
  if (currentCount >= PROJECT_IMAGES_MAX_COUNT) {
    return { valid: false, error: `Límite de ${PROJECT_IMAGES_MAX_COUNT} imágenes alcanzado` }
  }
  return { valid: true }
}

export function reorderImageUrls(urls: string[], fromIndex: number, toIndex: number): string[] {
  if (
    fromIndex < 0 || fromIndex >= urls.length ||
    toIndex < 0 || toIndex >= urls.length ||
    fromIndex === toIndex
  ) {
    return urls
  }
  const result = [...urls]
  const [moved] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, moved)
  return result
}
