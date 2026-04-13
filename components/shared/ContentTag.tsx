import { type CSSProperties } from 'react'

type TagVariant = 'default' | 'outline'

interface ContentTagProps {
  label: string
  variant?: TagVariant
}

const VARIANT_STYLES: Record<TagVariant, CSSProperties> = {
  default: {
    backgroundColor: 'var(--color-border)',
    color: 'var(--color-text-secondary)',
    border: 'none',
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
        padding: '3px 10px',
        fontSize: 'var(--text-xs)',
        fontWeight: 400,
        lineHeight: 'var(--leading-xs)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}
