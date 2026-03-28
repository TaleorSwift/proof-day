import { Badge } from '@/components/ui/badge'
import type { ProjectStatus } from '@/lib/types/projects'

const STATUS_CONFIG: Record<ProjectStatus, { label: string; variant: 'default' | 'outline' | 'secondary' }> = {
  draft:    { label: 'Borrador', variant: 'outline' },
  live:     { label: 'Live',     variant: 'default' },
  inactive: { label: 'Inactivo', variant: 'secondary' },
}

interface StatusBadgeProps {
  status: ProjectStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, variant } = STATUS_CONFIG[status]
  return <Badge variant={variant}>{label}</Badge>
}
