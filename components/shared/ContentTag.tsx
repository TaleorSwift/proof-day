import { type CSSProperties } from 'react'

type TagVariant = 'default' | 'outline'

interface ContentTagProps {
  label: string
  variant?: TagVariant
}

const VARIANT_STYLES: Record<TagVariant, CSSProperties> = {
  default: {
    backgroundColor: 'var(--color-hypothesis-bg)',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-hypothesis-border)',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'var(--color-text-muted)',
    border: '1px solid var(--color-border)',
  },
}

export function ContentTag({ label, variant = 'default' }: ContentTagProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        ...VARIANT_STYLES[variant],
        borderRadius: 'var(--radius-full)',
        padding: '2px var(--space-3)',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        lineHeight: 'var(--leading-xs)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}
