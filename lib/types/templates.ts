// Story 10.1 — Tipos para project_templates (Phase 2)

export type TemplateType = 'saas' | 'feature' | 'internal_process' | 'physical_product' | 'service'

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
  type: TemplateType
  name: string
  descriptionStructure: DescriptionStructure
  reviewerContext: string
  createdAt: string
}

/** Row tal como lo devuelve Supabase (snake_case) */
export interface ProjectTemplateRow {
  id: string
  type: TemplateType
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
