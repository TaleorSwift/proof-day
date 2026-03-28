export function DraftBanner() {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-hypothesis-bg)',
        border: '1px solid var(--color-hypothesis-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
      }}
      role="status"
      aria-label="Estado de borrador"
    >
      En borrador — no visible para la comunidad
    </div>
  )
}
