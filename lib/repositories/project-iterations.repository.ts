// Story 13.2 — Repositorio de iteraciones de proyecto
// Patrón factory: igual que createFeedbackRepository y createProjectsRepository

import { createClient } from '@/lib/supabase/server'
import { projectIterationFromRow } from '@/lib/types/project-iterations'
import type { ProjectIteration, ProjectIterationRow } from '@/lib/types/project-iterations'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export interface CreateProjectIterationData {
  projectId: string
  versionNumber: number
  title: string | null
  description: string | null
  hypothesis: string | null
}

export function createProjectIterationsRepository(supabase: SupabaseClient) {
  return {
    /**
     * Obtiene el version_number más alto para el proyecto dado.
     * Retorna 0 si no hay iteraciones previas.
     */
    async getLatestVersionNumber(projectId: string): Promise<number> {
      const { data } = await supabase
        .from('project_iterations')
        .select('version_number')
        .eq('project_id', projectId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single()

      return data?.version_number ?? 0
    },

    /**
     * Inserta una nueva iteración en project_iterations.
     * Retorna el objeto mapeado a camelCase o error.
     */
    async create(data: CreateProjectIterationData): Promise<{ data: ProjectIteration | null; error: unknown }> {
      const { data: row, error } = await supabase
        .from('project_iterations')
        .insert({
          project_id: data.projectId,
          version_number: data.versionNumber,
          title: data.title,
          description: data.description,
          hypothesis: data.hypothesis,
        })
        .select()
        .single()

      if (error || !row) return { data: null, error }

      return { data: projectIterationFromRow(row as ProjectIterationRow), error: null }
    },
  }
}
