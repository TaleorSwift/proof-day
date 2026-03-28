import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CommunityList } from '@/components/communities/CommunityList'
import { EmptyCommunitiesState } from '@/components/communities/EmptyCommunitiesState'
import { getUserCommunities } from '@/lib/queries/communities'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function CommunitiesPage({ searchParams }: Props) {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) redirect('/login')

  const user = authData.user

  const { error: searchError } = await searchParams

  // Obtener comunidades del usuario con filtro explícito de membresía (segunda línea de defensa).
  // getUserCommunities está memoizada con React.cache — si layout.tsx ya la llamó
  // en el mismo request, esta llamada no genera un fetch adicional a Supabase (CR5-F5).
  const communityList = await getUserCommunities(user.id)

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
