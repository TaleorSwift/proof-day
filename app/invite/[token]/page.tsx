import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface Props {
  params: Promise<{ token: string }>
}

// Component: token inválido, ya usado o inexistente
// CR3-F6: CSS variables instead of Tailwind hardcoded colors
function InviteErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div
        className="w-full max-w-md rounded-lg p-8 text-center"
        style={{
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-weak-bg)',
        }}
      >
        <h1
          className="mb-3 text-xl font-semibold"
          style={{ color: 'var(--color-weak-text)' }}
        >
          Link inválido
        </h1>
        <p className="mb-6" style={{ color: 'var(--color-weak-text)' }}>
          {message}
        </p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Solicita un nuevo link de invitación al administrador de la comunidad.
        </p>
      </div>
    </div>
  )
}

// Component: usuario ya es miembro de la comunidad (AC 6)
// CR3-F6: CSS variables instead of Tailwind hardcoded colors
function InviteAlreadyMemberState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div
        className="w-full max-w-md rounded-lg p-8 text-center"
        style={{
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-promising-bg)',
        }}
      >
        <h1
          className="mb-3 text-xl font-semibold"
          style={{ color: 'var(--color-promising-text)' }}
        >
          Ya eres miembro de esta comunidad
        </h1>
        <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Ya formas parte de esta comunidad. Puedes acceder directamente.
        </p>
        <Link
          href="/communities"
          className="inline-block rounded-md px-5 py-2.5 text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-surface)',
          }}
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

  // CR4-F1 fix: implementar lógica directamente con createClient() en lugar de
  // fetch interno que expone el token en URL logs (Rejection Criterion violado).
  // El token solo aparece en la query SQL parametrizada — no en logs de URL.

  // Validar token via RPC SECURITY DEFINER (evita enumeración de tokens)
  // Tipo explícito para el resultado del RPC (DB types no generados en este proyecto)
  type InvitationTokenResult = { id: string; community_id: string; used_at: string | null }
  const { data: invitation, error: rpcError } = await supabase
    .rpc('validate_invitation_token', { p_token: token })
    .maybeSingle() as { data: InvitationTokenResult | null; error: unknown }

  if (rpcError || !invitation) {
    return <InviteErrorState message="Este link ya no es válido" />
  }

  if (invitation.used_at) {
    return <InviteErrorState message="Este link ya no es válido" />
  }

  // Verificar si ya es miembro (AC 6)
  const { data: existingMember } = await supabase
    .from('community_members')
    .select('id')
    .eq('community_id', invitation.community_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingMember) {
    return <InviteAlreadyMemberState />
  }

  // Unirse a la comunidad (AC 5)
  const { error: memberError } = await supabase
    .from('community_members')
    .insert({
      community_id: invitation.community_id,
      user_id: user.id,
      role: 'member',
    })

  if (memberError) {
    return <InviteErrorState message="Error al procesar el link. Por favor, inténtalo de nuevo." />
  }

  // Invalidar token (AC 2) — policy use_invitation permite UPDATE a usuario autenticado
  await supabase
    .from('invitation_links')
    .update({ used_at: new Date().toISOString(), used_by: user.id })
    .eq('id', invitation.id)

  // Join exitoso → redirect a comunidades (AC 5)
  redirect('/communities')
}
