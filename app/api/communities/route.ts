import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCommunitySchema } from '@/lib/validations/communities'

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json(
      { error: 'No autenticado', code: 'AUTH_REQUIRED' },
      { status: 401 }
    )
  }

  // RLS filtra automáticamente las comunidades del usuario.
  // Filtro explícito como segunda línea de defensa (CR2-F2):
  // obtenemos solo comunidades donde el usuario tiene membresía activa.
  // story 2.3: incluimos conteo de miembros por comunidad (AC-7)
  const { data: communities, error } = await supabase
    .from('communities')
    .select(`
      id,
      name,
      slug,
      description,
      image_url,
      created_by,
      created_at,
      updated_at,
      community_members!inner(user_id)
    `)
    .eq('community_members.user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'Error al obtener comunidades', code: 'COMMUNITIES_FETCH_ERROR' },
      { status: 500 }
    )
  }

  // Obtener conteo de miembros para cada comunidad (story 2.3, AC-7)
  // Query separada para evitar problemas de formato con el join de conteo
  const communityIds = (communities ?? []).map((c) => c.id)

  let memberCounts: Record<string, number> = {}

  if (communityIds.length > 0) {
    const { data: memberData } = await supabase
      .from('community_members')
      .select('community_id')
      .in('community_id', communityIds)

    if (memberData) {
      memberCounts = memberData.reduce<Record<string, number>>((acc, row) => {
        acc[row.community_id] = (acc[row.community_id] ?? 0) + 1
        return acc
      }, {})
    }
  }

  // Mapear snake_case → camelCase y añadir memberCount (AC-7)
  const result = (communities ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.image_url,
    createdBy: c.created_by,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    memberCount: memberCounts[c.id] ?? 0,
  }))

  return NextResponse.json({ data: result, count: result.length })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json(
      { error: 'No autenticado', code: 'AUTH_REQUIRED' },
      { status: 401 }
    )
  }

  // Validación Zod
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de la petición inválido', code: 'INVALID_BODY' },
      { status: 400 }
    )
  }

  const result = createCommunitySchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { name, description, imageUrl } = result.data
  const slug = toSlug(name)

  // Validar que el slug no esté vacío (p.ej. nombre con solo caracteres especiales)
  if (!slug) {
    return NextResponse.json(
      { error: 'El nombre no produce un identificador válido. Usa letras o números.', code: 'INVALID_SLUG' },
      { status: 400 }
    )
  }

  // Verificar unicidad del slug/nombre
  const { data: existing } = await supabase
    .from('communities')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'Ya existe una comunidad con ese nombre', code: 'COMMUNITY_NAME_TAKEN' },
      { status: 409 }
    )
  }

  // Crear comunidad
  const { data: community, error: insertError } = await supabase
    .from('communities')
    .insert({
      name,
      slug,
      description,
      image_url: imageUrl || null,
      created_by: user.id,
    })
    .select()
    .single()

  if (insertError || !community) {
    // Race condition: si dos requests concurrentes pasan el check de unicidad,
    // el segundo falla con error UNIQUE de PostgreSQL (code 23505) → retornar 409
    if (insertError?.code === '23505') {
      return NextResponse.json(
        { error: 'Ya existe una comunidad con ese nombre', code: 'COMMUNITY_NAME_TAKEN' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Error al crear la comunidad', code: 'COMMUNITY_CREATE_ERROR' },
      { status: 500 }
    )
  }

  // Insertar creador como admin en community_members
  const { error: memberError } = await supabase
    .from('community_members')
    .insert({
      community_id: community.id,
      user_id: user.id,
      role: 'admin',
    })

  if (memberError) {
    return NextResponse.json(
      { error: 'Error al registrar membresía', code: 'MEMBER_INSERT_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: community }, { status: 201 })
}
