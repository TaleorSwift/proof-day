import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { InvitationTokenResult } from '@/lib/types/invitations'

interface Props {
  params: Promise<{ token: string }>
}

// Component: token inválido, ya usado o inexistente
// CR3-F6 + CR5-F2: CSS variables for colors, typography, and spacing
function InviteErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center" style={{ padding: 'var(--space-6)' }}>
      <div
        className="text-center"
        style={{
          /* max-w-md (28rem) — no hay token CSS equivalente en design-tokens.md (story 2.2) */
          width: '100%',
          maxWidth: '28rem',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-weak-bg)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-8)',
        }}
      >
        <h1
          style={{
            color: 'var(--color-weak-text)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-semibold)',
            marginBottom: 'var(--space-3)',
          }}
        >
          Link inválido
        </h1>
        <p style={{ color: 'var(--color-weak-text)', marginBottom: 'var(--space-6)' }}>
          {message}
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          Solicita un nuevo link de invitación al administrador de la comunidad.
        </p>
      </div>
    </div>
  )
}

// Component: usuario ya es miembro de la comunidad (AC 6)
// CR3-F6 + CR5-F2: CSS variables for colors, typography, and spacing
function InviteAlreadyMemberState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center" style={{ padding: 'var(--space-6)' }}>
      <div
        className="text-center"
        style={{
          /* max-w-md (28rem) — no hay token CSS equivalente en design-tokens.md (story 2.2) */
          width: '100%',
          maxWidth: '28rem',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-promising-bg)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-8)',
        }}
      >
        <h1
          style={{
            color: 'var(--color-promising-text)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-semibold)',
            marginBottom: 'var(--space-3)',
          }}
        >
          Ya eres miembro de esta comunidad
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          Ya formas parte de esta comunidad. Puedes acceder directamente.
        </p>
        <Link
          href="/communities"
          style={{
            display: 'inline-block',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-5)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
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
  // InvitationTokenResult importado de lib/types/invitations.ts (CR7-F3)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invitation, error: rpcError } = await (supabase as any)
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

  // Invalidar token (AC 2) — CR5-F1: capturar error de invalidación para evitar
  // que un fallo silencioso de RLS deje el token reutilizable tras join exitoso.
  const { error: invalidateError } = await supabase
    .from('invitation_links')
    .update({ used_at: new Date().toISOString(), used_by: user.id })
    .eq('id', invitation.id)

  if (invalidateError) {
    // Token no invalidado — revertir membresía para mantener consistencia (AC 2)
    // CR6-F1: capturar error del rollback para loguear estado inconsistente si ambas ops fallan
    const { error: rollbackError } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', invitation.community_id)
      .eq('user_id', user.id)
    if (rollbackError) {
      // Estado inconsistente: membresía insertada + token no invalidado + rollback fallido
      // No hay forma de recuperarse en el servidor — loguear para operaciones
      console.error('[invite] Rollback failed after token invalidation error', {
        invalidateError,
        rollbackError,
        communityId: invitation.community_id,
        // token omitido intencionadamente — Rejection Criterion: no exponer token en logs
      })
    }
    return <InviteErrorState message="Error al procesar el link. Por favor, inténtalo de nuevo." />
  }

  // Join exitoso → redirect a comunidades (AC 5)
  redirect('/communities')
}
