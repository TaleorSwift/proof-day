import Link from 'next/link'

interface NavbarProps {
  isAuthenticated: boolean
  onLogout?: () => void
}

export function Navbar({ isAuthenticated, onLogout }: NavbarProps) {
  return (
    <nav
      style={{
        backgroundColor: 'var(--color-background)',
        borderBottom: '1px solid var(--color-border)',
        padding: 'var(--space-3) var(--space-8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
      aria-label="Navegación principal"
    >
      {/* Logo + nombre */}
      <Link
        href="/communities"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          textDecoration: 'none',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-background)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 2a7 7 0 0 1 5 11.9V17a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-3.1A7 7 0 0 1 12 2z" />
            <path d="M9 21h6" />
          </svg>
        </div>
        <span
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-primary)',
          }}
        >
          Proof Day
        </span>
      </Link>

      {/* Acción de autenticación */}
      {isAuthenticated ? (
        <button
          onClick={onLogout}
          style={{
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
            background: 'transparent',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-4)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            cursor: 'pointer',
          }}
        >
          Cerrar sesión
        </button>
      ) : (
        <a
          href="/login"
          style={{
            border: '1px solid var(--color-accent)',
            color: 'var(--color-accent)',
            background: 'transparent',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-4)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Iniciar sesión
        </a>
      )}
    </nav>
  )
}
