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
        backgroundColor: 'var(--navbar-bg)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--color-border)',
        height: 'var(--navbar-height)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
      aria-label="Navegación principal"
    >
      {/* Contenedor centrado — maxWidth 1400px igual que el prototipo */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          height: '100%',
          padding: '0 var(--space-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
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
            width={36}
            height={36}
            aria-hidden
            style={{ borderRadius: 'var(--radius-full)', flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-brand)',
            }}
          >
            Proof Day
          </span>
        </Link>

        {/* Acción de autenticación */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {userName && (
              <>
                <div
                  aria-label={`Avatar de ${userName}`}
                  role="img"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(249,115,22,0.12)',
                    color: '#F97316',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    fontWeight: 'var(--font-medium)',
                  }}
                >
                  {userName}
                </span>
              </>
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
      </div>
    </nav>
  )
}
