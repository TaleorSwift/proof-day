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
  // Matches /communities/[slug] (ignora /communities/new, /communities misma)
  const match = pathname.match(/^\/communities\/([^/]+)(?:\/|$)/)
  const activeCommunitySlug = match ? match[1] : undefined

  return (
    <CommunitySwitcher
      communities={communities}
      activeCommunitySlug={activeCommunitySlug}
    />
  )
}
