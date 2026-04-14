/**
 * WelcomeScreen — componente visual puro de la welcome screen.
 *
 * Extraído de app/page.tsx para permitir testing sin el wrapper async
 * de Server Component y uso en Storybook sin lógica de autenticación.
 */
import Image from 'next/image'
import Link from 'next/link'

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
        <Image
          src="/logo.png"
          alt="Proof Day"
          width={192}
          height={192}
          priority
        />
        <h1
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
          }}
        >
          Bienvenido a Proof Day
        </h1>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Valida ideas. Aprende más rápido. Construye lo que importa.
        </p>
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
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.4',
          }}
        >
          Al continuar, aceptas compartir feedback constructivo y ayudar a tu equipo a aprender.
        </p>
      </div>
    </main>
  )
}
