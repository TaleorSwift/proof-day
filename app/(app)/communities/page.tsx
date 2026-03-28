import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CommunityList } from '@/components/communities/CommunityList'
import { EmptyCommunitiesState } from '@/components/communities/EmptyCommunitiesState'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function CommunitiesPage({ searchParams }: Props) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error: searchError } = await searchParams

  // Obtener comunidades del usuario con filtro explícito de membresía (segunda línea de defensa)
  // RLS ya filtra a nivel BD; aquí lo reforzamos explícitamente (CR2-F2 pattern)
  const { data: rawCommunities, error } = await supabase
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
    console.error('[CommunitiesPage] Error fetching communities:', error)
  }

  const communities = rawCommunities ?? []

  // Obtener conteo de miembros para cada comunidad (AC-4, AC-5)
  let memberCounts: Record<string, number> = {}

  if (communities.length > 0) {
    const communityIds = communities.map((c) => c.id)
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

  // Mapear snake_case → camelCase y añadir member_count
  const communityList = communities.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image_url: c.image_url,
    created_by: c.created_by,
    created_at: c.created_at,
    updated_at: c.updated_at,
    member_count: memberCounts[c.id] ?? 0,
  }))

  // AC-5: Redirect automático si el usuario pertenece a exactamente 1 comunidad
  if (communityList.length === 1) {
    redirect(`/communities/${communityList[0].slug}`)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        padding: 'var(--space-8)',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* AC-2: Banner de error cuando se redirige desde una comunidad sin acceso */}
        {searchError === 'no-access' && (
          <div
            role="alert"
            style={{
              backgroundColor: 'var(--color-hypothesis-bg)',
              border: '1px solid var(--color-hypothesis-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              marginBottom: 'var(--space-6)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
            }}
          >
            No tienes acceso a esta comunidad.
          </div>
        )}

        <h1
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-6)',
          }}
        >
          Mis comunidades
        </h1>

        {communityList.length === 0 ? (
          <EmptyCommunitiesState />
        ) : (
          <CommunityList communities={communityList} />
        )}
      </div>
    </main>
  )
}
