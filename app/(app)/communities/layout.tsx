import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CommunitySwitcherClient } from '@/components/communities/CommunitySwitcherClient'
import { LogoutButton } from '@/components/logout-button'
import { Community } from '@/lib/types/communities'

interface Props {
  children: React.ReactNode
}

export default async function CommunitiesLayout({ children }: Props) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Obtener comunidades del usuario para el CommunitySwitcher
  const { data: rawCommunities } = await supabase
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

  const communities = rawCommunities ?? []

  // Obtener conteo de miembros
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

  const communityList: Community[] = communities.map((c) => ({
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

  return (
    <>
      {/* Navbar con selector de comunidad */}
      <nav
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-3) var(--space-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link
            href="/communities"
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              textDecoration: 'none',
            }}
          >
            Proof Day
          </Link>

          {/* CommunitySwitcher: solo visible con 1+ comunidades (AC-6) */}
          <CommunitySwitcherClient communities={communityList} />
        </div>

        <LogoutButton />
      </nav>

      {children}
    </>
  )
}
