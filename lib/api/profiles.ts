import type { Profile, ProfileWithStats } from '@/lib/types/profiles'
import type { UpdateProfileInput } from '@/lib/validations/profiles'

export async function getProfile(id: string): Promise<ProfileWithStats> {
  const res = await fetch(`/api/profiles/${id}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Error al obtener el perfil')
  }
  return (await res.json()).data as ProfileWithStats
}

export async function updateProfile(id: string, data: UpdateProfileInput): Promise<Profile> {
  const res = await fetch(`/api/profiles/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Error al actualizar el perfil')
  }
  return (await res.json()).data as Profile
}
