import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavbarClient } from '@/components/layout/NavbarClient'

interface Props {
  children: React.ReactNode
}

export default async function CommunitiesLayout({ children }: Props) {
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) redirect('/login')

  return (
    <>
      {/* Skip navigation — WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="skip-link"
        style={{
          padding: 'var(--space-2) var(--space-4)',
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          textDecoration: 'none',
        }}
      >
        Saltar al contenido principal
      </a>

      <NavbarClient isAuthenticated={true} />

      <div id="main-content">{children}</div>
    </>
  )
}
