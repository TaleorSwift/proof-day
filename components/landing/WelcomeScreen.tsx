/**
 * WelcomeScreen — componente visual puro de la welcome screen.
 *
 * Extraído de app/page.tsx para permitir testing sin el wrapper async
 * de Server Component y uso en Storybook sin lógica de autenticación.
 */
import Link from 'next/link'
import { BrandHeader } from '@/components/shared/BrandHeader'
import { LegalNotice } from '@/components/shared/LegalNotice'

export function WelcomeScreen() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-6)',
          width: '100%',
          maxWidth: '384px',
          textAlign: 'center',
          padding: '0 var(--space-4)',
        }}
      >
        <BrandHeader />
        <Link
          href="/login"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '44px',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-surface)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: 'var(--font-semibold)',
            fontSize: 'var(--text-base)',
          }}
        >
          Continuar con email
        </Link>
        <LegalNotice />
      </div>
    </main>
  )
}
