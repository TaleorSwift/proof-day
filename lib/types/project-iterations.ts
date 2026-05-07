// Story 13.1 — Iteración, Cierre del Loop y Copiloto IA

export interface ProjectIteration {
  id: string
  projectId: string
  versionNumber: number
  title: string | null
  description: string | null
  hypothesis: string | null
  publishedAt: string
  createdAt: string
}

/** Forma del row tal como lo devuelve Supabase (snake_case) */
export interface ProjectIterationRow {
  id: string
  project_id: string
  version_number: number
  title: string | null
  description: string | null
  hypothesis: string | null
  published_at: string
  created_at: string
}

export function projectIterationFromRow(row: ProjectIterationRow): ProjectIteration {
  return {
    id: row.id,
    projectId: row.project_id,
    versionNumber: row.version_number,
    title: row.title,
    description: row.description,
    hypothesis: row.hypothesis,
    publishedAt: row.published_at,
    createdAt: row.created_at,
  }
}
