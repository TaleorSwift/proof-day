import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CommunityHeader } from '@/components/communities/CommunityHeader'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CommunityPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) redirect('/login')
  const user = authData.user

  // RLS garantiza que solo miembros pueden leer.
  // Si el usuario no es miembro (o la comunidad no existe), data será null — sin exposición de datos.
  const { data: community } = await supabase
    .from('communities')
    .select('id, name, slug, description, image_url, created_at')
    .eq('slug', slug)
    .single()

  // AC-2: Si no hay acceso (no miembro o no existe) → redirect a /communities con mensaje
  if (!community) {
    redirect('/communities?error=no-access')
  }

  // Obtener conteo de miembros y rol del usuario en paralelo (queries independientes)
  const [{ count: memberCount }, { data: membership }] = await Promise.all([
    supabase
      .from('community_members')
      .select('*', { count: 'exact', head: true })
      .eq('community_id', community.id),
    supabase
      .from('community_members')
      .select('role')
      .eq('community_id', community.id)
      .eq('user_id', user.id)
      .single(),
  ])

  const isAdmin = membership?.role === 'admin'

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        padding: 'var(--space-8)',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <CommunityHeader
          community={{
            ...community,
            updated_at: '',
            created_by: '',
            member_count: memberCount ?? 0,
          }}
          isAdmin={isAdmin}
        />

        {/* Placeholder para proyectos — se añade en story 3.4 */}
        <div style={{ marginTop: 'var(--space-8)' }}>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            Los proyectos de esta comunidad aparecerán aquí.
          </p>
        </div>
      </div>
    </main>
  )
}
