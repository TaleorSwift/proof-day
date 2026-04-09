import { type CSSProperties } from 'react'

type AvatarSize = 'sm' | 'md' | 'lg'

interface UserAvatarProps {
  name: string
  size?: AvatarSize
  showName?: boolean
}

const SIZE_STYLES: Record<AvatarSize, CSSProperties> = {
  sm: { width: 28, height: 28, fontSize: 'var(--text-xs)' },
  md: { width: 36, height: 36, fontSize: 'var(--text-sm)' },
  lg: { width: 48, height: 48, fontSize: 'var(--text-base)' },
}

// Paleta de colores para avatares — seleccionados para contraste y variedad visual.
// Los valores hex se usan directamente en inline styles (no se pueden usar var() aquí).
// #F97316 = primary, #15803D = promising-text, #B45309 = needs-text (mismos valores que tokens).
// Los 4 restantes extienden la paleta más allá de los tokens semánticos existentes.
const AVATAR_PALETTE: string[] = [
  '#F97316', // naranja — color-primary
  '#15803D', // verde — color-promising-text
  '#B45309', // ámbar — color-needs-text
  '#2563EB', // azul — color-insight-text
  '#7C3AED', // violeta
  '#DB2777', // rosa
  '#0891B2', // cyan
]

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function getAvatarColor(name: string): string {
  const index = hashName(name) % AVATAR_PALETTE.length
  return AVATAR_PALETTE[index]
}

function getInitial(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  return trimmed.charAt(0).toUpperCase()
}

export function UserAvatar({ name, size = 'md', showName = false }: UserAvatarProps) {
  const backgroundColor = getAvatarColor(name)
  const sizeStyle = SIZE_STYLES[size]

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}
    >
      <div
        aria-label={`Avatar de ${name}`}
        role="img"
        style={{
          ...sizeStyle,
          backgroundColor,
          color: 'var(--color-surface)',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'var(--font-semibold)' as CSSProperties['fontWeight'],
          flexShrink: 0,
        }}
      >
        {getInitial(name)}
      </div>

      {showName && (
        <span
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            fontWeight: 'var(--font-medium)' as CSSProperties['fontWeight'],
          }}
        >
          {name}
        </span>
      )}
    </div>
  )
}
