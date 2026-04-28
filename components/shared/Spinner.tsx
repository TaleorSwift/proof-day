interface SpinnerProps {
  ariaLabel?: string
}

export function Spinner({ ariaLabel = 'Cargando…' }: SpinnerProps) {
  return (
    <main
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
      aria-label={ariaLabel}
      aria-busy="true"
    >
      <div
        role="status"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}
