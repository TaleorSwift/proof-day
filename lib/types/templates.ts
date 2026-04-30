// Story 10.1 — Tipos para project_templates (Phase 2)

export interface FieldConfig {
  placeholder: string
  example: string
}

export interface DescriptionStructure {
  problem: FieldConfig
  solution: FieldConfig
}

/** Dominio (camelCase) */
export interface ProjectTemplate {
  id: string
  type: string
  name: string
  descriptionStructure: DescriptionStructure
  reviewerContext: string
  createdAt: string
}

/** Row tal como lo devuelve Supabase (snake_case) */
export interface ProjectTemplateRow {
  id: string
  type: string
  name: string
  description_structure: DescriptionStructure
  reviewer_context: string
  created_at: string
}

export function templateFromRow(row: ProjectTemplateRow): ProjectTemplate {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    descriptionStructure: row.description_structure,
    reviewerContext: row.reviewer_context,
    createdAt: row.created_at,
  }
}
