import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createProjectSchema } from '@/lib/validations/projects'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json(
    { error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 }
  )

  const { searchParams } = new URL(request.url)
  const communityId = searchParams.get('communityId')
  if (!communityId) return NextResponse.json(
    { error: 'communityId es requerido', code: 'VALIDATION_ERROR' }, { status: 400 }
  )

  // Verificar membresía
  const { data: member } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .single()
  if (!member) return NextResponse.json(
    { error: 'No eres miembro de esta comunidad', code: 'COMMUNITY_ACCESS_DENIED' }, { status: 403 }
  )

  // El RLS ya filtra: los miembros ven live+inactive, el builder ve sus drafts
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, title, image_urls, status, builder_id, created_at')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json(
    { error: 'Error al obtener proyectos', code: 'PROJECTS_FETCH_ERROR' }, { status: 500 }
  )

  return NextResponse.json({ data: projects ?? [], count: projects?.length ?? 0 })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json(
    { error: 'No autenticado', code: 'AUTH_REQUIRED' }, { status: 401 }
  )

  const body = await request.json()
  const result = createProjectSchema.safeParse(body)
  if (!result.success) return NextResponse.json(
    { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' }, { status: 400 }
  )

  const { communityId, ...projectData } = result.data

  // Verificar membresía
  const { data: member } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', communityId)
    .eq('user_id', user.id)
    .single()
  if (!member) return NextResponse.json(
    { error: 'No eres miembro de esta comunidad', code: 'COMMUNITY_ACCESS_DENIED' }, { status: 403 }
  )

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      community_id: communityId,
      builder_id: user.id,
      title: projectData.title,
      problem: projectData.problem,
      solution: projectData.solution,
      hypothesis: projectData.hypothesis,
      image_urls: projectData.imageUrls,
      status: 'draft',
    })
    .select()
    .single()

  if (error || !project) return NextResponse.json(
    { error: 'Error al crear el proyecto', code: 'PROJECT_CREATE_ERROR' }, { status: 500 }
  )

  return NextResponse.json({ data: project }, { status: 201 })
}
