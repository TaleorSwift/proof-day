import { NextResponse } from 'next/server'
import { createProjectSchema } from '@/lib/validations/projects'
import { requireAuth } from '@/lib/api/middleware/require-auth'
import { createProjectsRepository } from '@/lib/repositories/projects.repository'
import { createProjectsService } from '@/lib/services/projects.service'

export async function GET(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { user, supabase } = auth
  const { searchParams } = new URL(request.url)
  const communityId = searchParams.get('communityId')

  if (!communityId)
    return NextResponse.json(
      { error: 'communityId es requerido', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )

  const projectsService = createProjectsService(supabase)
  const membership = await projectsService.validateMembership(communityId, user.id)
  if (!membership.ok)
    return NextResponse.json({ error: membership.error, code: membership.code }, { status: membership.status })

  const projectsRepo = createProjectsRepository(supabase)
  const { data: projects, error } = await projectsRepo.findByCommunity(communityId)

  if (error)
    return NextResponse.json(
      { error: 'Error al obtener proyectos', code: 'PROJECTS_FETCH_ERROR' },
      { status: 500 }
    )

  return NextResponse.json({ data: projects ?? [], count: projects?.length ?? 0 })
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { user, supabase } = auth

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de la petición inválido', code: 'INVALID_BODY' },
      { status: 400 }
    )
  }

  const result = createProjectSchema.safeParse(body)
  if (!result.success)
    return NextResponse.json(
      { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )

  const { communityId, ...projectData } = result.data

  const projectsService = createProjectsService(supabase)
  const membership = await projectsService.validateMembership(communityId, user.id)
  if (!membership.ok)
    return NextResponse.json({ error: membership.error, code: membership.code }, { status: membership.status })

  const projectsRepo = createProjectsRepository(supabase)
  const { data: project, error } = await projectsRepo.create({
    communityId,
    builderId: user.id,
    title: projectData.title,
    problem: projectData.problem,
    solution: projectData.solution,
    hypothesis: projectData.hypothesis,
    imageUrls: projectData.imageUrls ?? [],
    // En create: se omiten campos vacíos (Supabase usará NULL por defecto)
    // En update (route [id]): se envía null explícito para borrar el valor almacenado
    // Esta asimetría es intencional — ver app/api/projects/[id]/route.ts
    ...(projectData.targetUser && { targetUser: projectData.targetUser }),
    ...(projectData.demoUrl && { demoUrl: projectData.demoUrl }),
    ...(projectData.feedbackTopics?.length && { feedbackTopics: projectData.feedbackTopics }),
  })

  if (error || !project)
    return NextResponse.json(
      { error: 'Error al crear el proyecto', code: 'PROJECT_CREATE_ERROR' },
      { status: 500 }
    )

  return NextResponse.json({ data: project }, { status: 201 })
}
