import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  href: string
  label?: string
}

export function BackButton({ href, label = 'Volver al feed' }: BackButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-medium no-underline
        text-[color:var(--color-text-muted)] transition-colors duration-150
        hover:text-[color:var(--color-text-secondary)]"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  )
}
