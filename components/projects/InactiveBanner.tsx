export function InactiveBanner() {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
      }}
      role="status"
      aria-label="Proyecto inactivo"
    >
      Este proyecto está inactivo — el desarrollo ha sido detenido.
    </div>
  )
}
