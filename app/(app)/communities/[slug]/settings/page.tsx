import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import InvitationSection from '@/components/communities/InvitationSection'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CommunitySettingsPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Obtener comunidad por slug
  const { data: community } = await supabase
    .from('communities')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (!community) redirect('/communities')

  // Verificar que el usuario es admin de la comunidad (AC 1)
  const { data: membership } = await supabase
    .from('community_members')
    .select('role')
    .eq('community_id', community.id)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') redirect('/communities')

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        padding: 'var(--space-8)',
      }}
    >
      {/* maxWidth: 640px — no hay token CSS equivalente en design-tokens.md (story 2.2) */}
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          {/* CR4-F3: Enlace de vuelta a la lista de comunidades */}
          <Link
            href="/communities"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              marginBottom: 'var(--space-4)',
            }}
          >
            ← Mis comunidades
          </Link>
          <h1
            style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Configuración — {community.name}
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
            Gestiona las opciones de tu comunidad
          </p>
        </div>

        {/* Invitation Links Section */}
        <InvitationSection communityId={community.id} />
      </div>
    </div>
  )
}
