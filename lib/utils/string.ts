/**
 * Returns up to 2 uppercase initials from a display name.
 * Returns '?' for empty/whitespace-only strings.
 */
export function getInitials(name: string): string {
  if (!name.trim()) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
