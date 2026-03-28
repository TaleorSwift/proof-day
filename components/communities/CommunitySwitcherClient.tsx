'use client'

import { usePathname } from 'next/navigation'
import { CommunitySwitcher } from './CommunitySwitcher'
import { Community } from '@/lib/types/communities'

interface Props {
  communities: Community[]
}

export function CommunitySwitcherClient({ communities }: Props) {
  const pathname = usePathname()

  // Extraer el slug activo de la ruta /communities/[slug]
  // Excluye explícitamente rutas reservadas como /communities/new
  const RESERVED_SLUGS = ['new']
  const match = pathname.match(/^\/communities\/([^/]+)(?:\/|$)/)
  const slug = match ? match[1] : undefined
  const activeCommunitySlug = slug && !RESERVED_SLUGS.includes(slug) ? slug : undefined

  return (
    <CommunitySwitcher
      communities={communities}
      activeCommunitySlug={activeCommunitySlug}
    />
  )
}
