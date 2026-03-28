import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CommunitySwitcherClient } from '@/components/communities/CommunitySwitcherClient'
import { LogoutButton } from '@/components/logout-button'
import { getUserCommunities } from '@/lib/queries/communities'

interface Props {
  children: React.ReactNode
}

export default async function CommunitiesLayout({ children }: Props) {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) redirect('/login')

  const user = authData.user

  // Obtener comunidades del usuario para el CommunitySwitcher.
  // getUserCommunities está memoizada con React.cache — si page.tsx ya la llamó
  // en el mismo request, esta llamada no genera un fetch adicional a Supabase.
  const communityList = await getUserCommunities(user.id)

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
