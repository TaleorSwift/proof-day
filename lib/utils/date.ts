/**
 * Returns a human-readable relative time string in Spanish.
 * e.g. "hace 3 minutos", "hace 2 días"
 */
export function getRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)

  if (diffSeconds < 60) return 'hace un momento'
  if (diffMinutes < 60) return `hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`
  if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  if (diffDays < 7) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
  if (diffWeeks < 4) return `hace ${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'}`
  return `hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`
}
