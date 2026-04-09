import type { ProjectStatus } from '@/lib/types/projects'

const STATUS_CONFIG: Record<ProjectStatus, { label: string; bg: string; color: string }> = {
  draft: {
    label: 'Borrador',
    bg: 'var(--color-hypothesis-bg)',
    color: 'var(--color-text-secondary)',
  },
  live: {
    label: 'Live',
    bg: 'var(--color-promising-bg)',
    color: 'var(--color-promising-text)',
  },
  inactive: {
    label: 'Cerrado',
    bg: 'var(--color-surface)',
    color: 'var(--color-text-muted)',
  },
}

interface StatusBadgeProps {
  status: ProjectStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderRadius: 'var(--radius-sm)',
        padding: '2px var(--space-2)',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
      }}
      aria-label={`Estado: ${config.label}`}
    >
      {config.label}
    </span>
  )
}
