import Image from 'next/image'
import Link from 'next/link'

interface NavbarProps {
  isAuthenticated: boolean
  userName?: string
  onLogout?: () => void
}

export function Navbar({ isAuthenticated, userName, onLogout }: NavbarProps) {
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
      {/* Logo + nombre producto */}
      <Link
        href="/communities"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          textDecoration: 'none',
        }}
      >
        <Image
          src="/logo.png"
          alt=""
          width={32}
          height={32}
          aria-hidden
          style={{ borderRadius: 'var(--radius-full)', flexShrink: 0 }}
        />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {userName && (
            <span
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                fontWeight: 'var(--font-medium)',
              }}
            >
              {userName}
            </span>
          )}
          <button
            onClick={onLogout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              padding: 'var(--space-1)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
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
