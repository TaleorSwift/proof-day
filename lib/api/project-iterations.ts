// Story 13.2 — Cliente HTTP para iteraciones de proyecto
// Patrón: igual que publishProject / registerDecision en lib/api/projects.ts

export interface PublishIterationInput {
  title?: string
  description?: string
  hypothesis?: string
}

export interface PublishIterationResult {
  versionNumber: number
}

/**
 * Publica una nueva iteración del proyecto.
 * Llama a POST /api/projects/:id/iterations con los datos del formulario.
 * Retorna el número de versión recién creado.
 */
export async function publishIteration(
  projectId: string,
  data: PublishIterationInput
): Promise<PublishIterationResult> {
  const res = await fetch(`/api/projects/${projectId}/iterations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error((await res.json()).error)
  return (await res.json()).data
}
