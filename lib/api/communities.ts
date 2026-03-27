import type { Community } from '@/lib/types/communities'
import type { CreateCommunityInput } from '@/lib/validations/communities'

export async function createCommunity(data: CreateCommunityInput): Promise<Community> {
  const res = await fetch('/api/communities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    let message = 'Error al crear la comunidad'
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // La respuesta de error no es JSON válido — usar mensaje genérico
    }
    throw new Error(message)
  }
  return (await res.json()).data
}

export async function getCommunities(): Promise<Community[]> {
  const res = await fetch('/api/communities')
  if (!res.ok) {
    let message = 'Error al obtener comunidades'
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // La respuesta de error no es JSON válido — usar mensaje genérico
    }
    throw new Error(message)
  }
  return (await res.json()).data
}
