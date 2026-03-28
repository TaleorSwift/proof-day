import { NextResponse } from 'next/server'
import { createCommunitySchema } from '@/lib/validations/communities'
import { requireAuth } from '@/lib/api/middleware/require-auth'
import { createCommunitiesRepository } from '@/lib/repositories/communities.repository'
import { createCommunitiesService } from '@/lib/services/communities.service'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { user, supabase } = auth
  const communitiesRepo = createCommunitiesRepository(supabase)

  const { data: communities, error } = await communitiesRepo.findByUserId(user.id)

  if (error)
    return NextResponse.json(
      { error: 'Error al obtener comunidades', code: 'COMMUNITIES_FETCH_ERROR' },
      { status: 500 }
    )

  const communityIds = (communities ?? []).map((c: Record<string, unknown>) => c.id as string)

  let memberCounts: Record<string, number> = {}
  if (communityIds.length > 0) {
    const { data: memberData } = await communitiesRepo.getMemberCounts(communityIds)
    if (memberData) {
      memberCounts = (memberData as Record<string, unknown>[]).reduce(
        (acc: Record<string, number>, row) => {
          const id = row.community_id as string
          acc[id] = (acc[id] ?? 0) + 1
          return acc
        },
        {}
      )
    }
  }

  const result = (communities ?? []).map((c: Record<string, unknown>) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.image_url,
    createdBy: c.created_by,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    memberCount: memberCounts[c.id as string] ?? 0,
  }))

  return NextResponse.json({ data: result, count: result.length })
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

  const parsed = createCommunitySchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )

  const { name, description, imageUrl } = parsed.data

  const communitiesService = createCommunitiesService(supabase)
  const slugResult = await communitiesService.generateUniqueSlug(name)
  if (!slugResult.ok)
    return NextResponse.json({ error: slugResult.error, code: slugResult.code }, { status: slugResult.status })

  const communitiesRepo = createCommunitiesRepository(supabase)
  const { data: community, error: insertError } = await communitiesRepo.create({
    name,
    slug: slugResult.slug,
    description: description ?? null,
    imageUrl: imageUrl ?? null,
    createdBy: user.id,
  })

  if (insertError || !community) {
    // Race condition: slug duplicado por requests concurrentes
    if ((insertError as { code?: string })?.code === '23505')
      return NextResponse.json(
        { error: 'Ya existe una comunidad con ese nombre', code: 'COMMUNITY_NAME_TAKEN' },
        { status: 409 }
      )
    return NextResponse.json(
      { error: 'Error al crear la comunidad', code: 'COMMUNITY_CREATE_ERROR' },
      { status: 500 }
    )
  }

  const { error: memberError } = await communitiesRepo.addMember(community.id, user.id, 'admin')
  if (memberError)
    return NextResponse.json(
      { error: 'Error al registrar membresía', code: 'MEMBER_INSERT_ERROR' },
      { status: 500 }
    )

  return NextResponse.json({ data: community }, { status: 201 })
}
