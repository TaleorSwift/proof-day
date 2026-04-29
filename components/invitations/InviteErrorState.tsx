// CR3-F6 + CR5-F2: CSS variables for colors, typography, and spacing
// story 2.2 — token inválido, ya usado o inexistente

// Server Component — sin interactividad de cliente

interface Props {
  message: string
}

export function InviteErrorState({ message }: Props) {
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
          Link inválido
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          {message}
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Solicita un nuevo link de invitación al administrador de la comunidad.
        </p>
      </div>
    </div>
  )
}
