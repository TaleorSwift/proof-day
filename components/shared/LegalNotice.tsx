interface LegalNoticeProps {
  /** Texto alternativo al canónico. Por defecto se muestra el texto legal oficial. */
  children?: React.ReactNode
}

export function LegalNotice({ children }: LegalNoticeProps) {
  return (
    <p
      style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-secondary)',
        lineHeight: '1.4',
      }}
    >
      {children ?? 'Al continuar, aceptas compartir feedback constructivo y ayudar a tu equipo a aprender.'}
    </p>
  )
}
