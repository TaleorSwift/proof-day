import { Star, Lightbulb, RefreshCw } from 'lucide-react'
import { type CSSProperties, type ReactNode } from 'react'

type ContributorType = 'top-reviewer' | 'insightful' | 'changed-thinking'

interface ContributorBadgeProps {
  type: ContributorType
}

interface BadgeConfig {
  icon: ReactNode
  label: string
  backgroundColor: string
  color: string
}

const BADGE_CONFIG: Record<ContributorType, BadgeConfig> = {
  'top-reviewer': {
    icon: <Star size={10} aria-hidden="true" />,
    label: 'Top Reviewer',
    backgroundColor: 'var(--color-hypothesis-bg)',
    color: 'var(--color-primary)',
  },
  insightful: {
    icon: <Lightbulb size={10} aria-hidden="true" />,
    label: 'Perspicaz',
    backgroundColor: 'var(--color-promising-bg)',
    color: 'var(--color-promising-text)',
  },
  'changed-thinking': {
    icon: <RefreshCw size={10} aria-hidden="true" />,
    label: 'Cambió mi perspectiva',
    backgroundColor: 'var(--color-insight-bg)',
    color: 'var(--color-insight-text)',
  },
}

export function ContributorBadge({ type }: ContributorBadgeProps) {
  const config = BADGE_CONFIG[type]

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        backgroundColor: config.backgroundColor,
        color: config.color,
        borderRadius: 'var(--radius-full)',
        padding: '2px 6px',
        fontSize: '11px',
        fontWeight: 500 as CSSProperties['fontWeight'],
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {config.icon}
      {config.label}
    </span>
  )
}
