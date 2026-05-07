// Story 13.2 — POST /api/projects/[id]/iterations
// Publica una nueva iteración para el proyecto dado.
// Patrón: igual que app/api/projects/[id]/decision/route.ts
// Story 13.3 — Dispara notificaciones fire-and-forget a reviewers anteriores.

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createProjectIterationsRepository } from '@/lib/repositories/project-iterations.repository'
import { notifyPreviousReviewers } from '@/lib/notifications/notify-previous-reviewers'

// ── Schema de validación del body ─────────────────────────────────────────────

const publishIterationSchema = z.object({
  title: z.string().max(300).optional(),
  description: z.string().max(2000).optional(),
  hypothesis: z.string().max(1000).optional(),
})

// ── Handler POST ──────────────────────────────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  // 1. Autenticación
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'No autenticado', code: 'AUTH_REQUIRED' },
      { status: 401 }
    )
  }

  const { id } = await params

  // 2. Verificar que el proyecto existe
  const { data: project } = await supabase
    .from('projects')
    .select('id, builder_id, status, title, problem, solution, hypothesis, slug, community_id')
    .eq('id', id)
    .single()

  if (!project) {
    return NextResponse.json(
      { error: 'Proyecto no encontrado', code: 'PROJECT_NOT_FOUND' },
      { status: 404 }
    )
  }

  // 3. Verificar que el usuario es el builder
  if (project.builder_id !== user.id) {
    return NextResponse.json(
      { error: 'No tienes permiso', code: 'PROJECT_FORBIDDEN' },
      { status: 403 }
    )
  }

  // 4. Verificar que el proyecto está en estado live
  if (project.status !== 'live') {
    return NextResponse.json(
      { error: 'El proyecto no está publicado', code: 'PROJECT_NOT_LIVE' },
      { status: 422 }
    )
  }

  // 5. Parsear y validar el body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const result = publishIterationSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // 6. Calcular version_number (latest + 1)
  const repo = createProjectIterationsRepository(supabase)
  const latestVersionNumber = await repo.getLatestVersionNumber(id)
  const versionNumber = latestVersionNumber + 1

  // 7. Usar valores del body si se proporcionan, si no los del proyecto
  const title = result.data.title ?? (project.title as string | null) ?? null
  const rawDescription = result.data.description !== undefined
    ? result.data.description
    : `${project.problem ?? ''}\n\n${project.solution ?? ''}`.trim() || null
  const description = rawDescription ?? null
  const hypothesis = result.data.hypothesis ?? (project.hypothesis as string | null) ?? null

  // 8. Insertar la nueva iteración
  const { data: iteration, error: insertError } = await repo.create({
    projectId: id,
    versionNumber,
    title,
    description,
    hypothesis,
  })

  if (insertError) {
    const pgError = insertError as { code?: string }
    if (pgError.code === '23505') {
      return NextResponse.json(
        { error: 'Conflicto de versión', code: 'VERSION_CONFLICT' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Error al crear la iteración', code: 'ITERATION_CREATE_ERROR' },
      { status: 500 }
    )
  }

  if (!iteration) {
    return NextResponse.json(
      { error: 'Error al crear la iteración', code: 'ITERATION_CREATE_ERROR' },
      { status: 500 }
    )
  }

  // 9. Obtener el slug de la comunidad para el payload de notificación
  const adminClient = createAdminClient()
  const { data: community } = await adminClient
    .from('communities')
    .select('slug')
    .eq('id', project.community_id)
    .single()
  const communitySlug = community?.slug ?? ''

  // 10. Fire-and-forget: notificar a reviewers anteriores — no bloquea el 201
  void notifyPreviousReviewers({
    projectId: id,
    builderId: project.builder_id,
    projectSlug: (project.slug as string | null) ?? '',
    projectTitle: (project.title as string | null) ?? '',
    versionNumber,
    communitySlug,
  })

  return NextResponse.json({ data: { ...iteration, versionNumber } }, { status: 201 })
}
