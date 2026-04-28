interface SpinnerProps {
  ariaLabel?: string
}

export function Spinner({ ariaLabel = 'Cargando…' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          animation: 'spinner-rotate 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spinner-rotate { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
