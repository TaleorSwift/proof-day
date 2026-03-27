import type { Community } from '@/lib/types/communities'
import type { CreateCommunityInput } from '@/lib/validations/communities'

export async function createCommunity(data: CreateCommunityInput): Promise<Community> {
  const res = await fetch('/api/communities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error((await res.json()).error)
  return (await res.json()).data
}

export async function getCommunities(): Promise<Community[]> {
  const res = await fetch('/api/communities')
  if (!res.ok) throw new Error((await res.json()).error)
  return (await res.json()).data
}
