import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface Props {
  params: Promise<{ token: string }>
}

// Component: token inválido, ya usado o inexistente
function InviteErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="mb-3 text-xl font-semibold text-red-800">
          Link inválido
        </h1>
        <p className="mb-6 text-red-700">{message}</p>
        <p className="text-sm text-red-600">
          Solicita un nuevo link de invitación al administrador de la comunidad.
        </p>
      </div>
    </div>
  )
}

// Component: usuario ya es miembro de la comunidad (AC 6)
function InviteAlreadyMemberState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-blue-200 bg-blue-50 p-8 text-center">
        <h1 className="mb-3 text-xl font-semibold text-blue-800">
          Ya eres miembro de esta comunidad
        </h1>
        <p className="mb-6 text-blue-700">
          Ya formas parte de esta comunidad. Puedes acceder directamente.
        </p>
        <Link
          href="/communities"
          className="inline-block rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Ver mis comunidades
        </Link>
      </div>
    </div>
  )
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Si no está autenticado → redirect a login con next param (AC 5)
  if (!user) {
    redirect(`/login?next=/invite/${token}`)
  }

  // Delegar mutaciones a API Route (M3 fix — Rejection Criterion: mutaciones van por API Route)
  // Forward cookies para mantener la sesión autenticada
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const res = await fetch(`${siteUrl}/api/invitations/${token}/use`, {
    method: 'POST',
    headers: {
      Cookie: cookieHeader,
    },
  })

  if (res.status === 404 || res.status === 410) {
    return <InviteErrorState message="Este link ya no es válido" />
  }

  if (res.status === 401) {
    redirect(`/login?next=/invite/${token}`)
  }

  if (res.status === 500) {
    return <InviteErrorState message="Error al procesar el link. Por favor, inténtalo de nuevo." />
  }

  if (res.ok) {
    const body = await res.json()
    // Si ya era miembro, mostrar estado correspondiente (AC 6)
    if (body.data?.alreadyMember) {
      return <InviteAlreadyMemberState />
    }
    // Join exitoso → redirect a comunidades (AC 5)
    redirect('/communities')
  }

  // Fallback — error inesperado
  return <InviteErrorState message="Error inesperado. Por favor, inténtalo de nuevo." />
}
