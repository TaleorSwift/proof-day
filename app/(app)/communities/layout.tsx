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
  if (authError || !authData.user) redirect('/auth/login')

  const user = authData.user

  // Obtener comunidades del usuario para el CommunitySwitcher.
  // getUserCommunities está memoizada con React.cache — si page.tsx ya la llamó
  // en el mismo request, esta llamada no genera un fetch adicional a Supabase.
  const communityList = await getUserCommunities(user.id)

  return (
    <>
      {/* Skip navigation — WCAG 2.4.1 */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'var(--space-2)',
          zIndex: 100,
          padding: 'var(--space-2) var(--space-4)',
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          textDecoration: 'none',
        }}
        onFocus={(e) => { e.currentTarget.style.left = 'var(--space-4)' }}
        onBlur={(e) => { e.currentTarget.style.left = '-9999px' }}
      >
        Saltar al contenido principal
      </a>

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
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none' }}
          >
            {/* Logo naranja circular */}
            <div
              aria-hidden="true"
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a7 7 0 0 1 5 11.9V17a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-3.1A7 7 0 0 1 12 2z"/>
                <path d="M9 21h6"/>
              </svg>
            </div>
            <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-primary)' }}>
              Proof Day
            </span>
          </Link>

          {/* CommunitySwitcher: solo visible con 1+ comunidades (AC-6) */}
          <CommunitySwitcherClient communities={communityList} />
        </div>

        <LogoutButton />
      </nav>

      <div id="main-content">{children}</div>
    </>
  )
}
