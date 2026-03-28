import { Community } from '@/lib/types/communities'
import { CommunityCard } from './CommunityCard'

interface Props {
  communities: Community[]
}

export function CommunityList({ communities }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--space-6)',
      }}
    >
      {communities.map((community) => (
        <CommunityCard key={community.id} community={community} />
      ))}
    </div>
  )
}
