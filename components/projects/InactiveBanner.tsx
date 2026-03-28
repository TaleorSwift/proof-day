export function InactiveBanner() {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-decision-bg)',
        border: '1px solid var(--color-decision-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
      }}
    >
      Proyecto inactivo — el feedback está cerrado
    </div>
  )
}
