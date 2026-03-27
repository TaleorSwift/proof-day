import { redirect } from 'next/navigation'
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

// Component: usuario ya es miembro de la comunidad
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

  // Validar token — buscar en invitation_links (AC 7)
  const { data: invitation } = await supabase
    .from('invitation_links')
    .select('id, community_id, used_at')
    .eq('token', token)
    .single()

  if (!invitation) {
    return <InviteErrorState message="Este link ya no es válido" />
  }

  if (invitation.used_at) {
    return <InviteErrorState message="Este link ya ha sido usado" />
  }

  // Verificar si ya es miembro (AC 6)
  const { data: existing } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', invitation.community_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    return <InviteAlreadyMemberState />
  }

  // Unirse a la comunidad (AC 2)
  const { error: memberError } = await supabase
    .from('community_members')
    .insert({
      community_id: invitation.community_id,
      user_id: user.id,
      role: 'member',
    })

  if (memberError) {
    return <InviteErrorState message="Error al unirse a la comunidad. Por favor, inténtalo de nuevo." />
  }

  // Invalidar el token — single use (AC 2)
  await supabase
    .from('invitation_links')
    .update({
      used_at: new Date().toISOString(),
      used_by: user.id,
    })
    .eq('id', invitation.id)

  // Redirect a comunidades tras join exitoso (AC 5)
  redirect('/communities')
}
