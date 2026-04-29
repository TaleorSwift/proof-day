import 'server-only'
import Link from 'next/link'

// CR3-F6 + CR5-F2: CSS variables for colors, typography, and spacing
// story 2.2 — usuario ya es miembro de la comunidad (AC 6)

// Server Component — sin interactividad de cliente

export function InviteAlreadyMemberState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center" style={{ padding: 'var(--space-6)' }}>
      <div
        className="max-w-md text-center"
        style={{
          width: '100%',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-8)',
        }}
      >
        <h1
          style={{
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-semibold)',
            marginBottom: 'var(--space-3)',
          }}
        >
          Ya eres miembro de esta comunidad
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          Ya formas parte de esta comunidad. Puedes acceder directamente.
        </p>
        <Link
          href="/communities"
          style={{
            display: 'inline-block',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-5)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
          }}
        >
          Ver mis comunidades
        </Link>
      </div>
    </div>
  )
}
