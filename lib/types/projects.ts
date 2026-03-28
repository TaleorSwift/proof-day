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
  }
}
