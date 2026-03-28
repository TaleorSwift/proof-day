import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ConfirmButton } from '@/components/auth/ConfirmButton'
import { validateConfirmSearchParams } from '@/lib/auth/confirm'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface ConfirmPageProps {
  searchParams: Promise<{
    token?: string
    type?: string
    redirect_to?: string
  }>
}

// ---------------------------------------------------------------------------
// Page — Server Component
// Página intermedia para magic link auth (anti-scanner de Google Workspace).
// El usuario debe pulsar el botón manualmente — el escáner no puede hacerlo.
// ---------------------------------------------------------------------------

export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const params = await searchParams
  const validation = validateConfirmSearchParams({
    token: params.token,
    type: params.type,
    redirect_to: params.redirect_to,
  })

  if (!validation.valid) {
    redirect('/login?error=link-invalid')
  }

  const { token, type, redirectTo } = validation

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-[var(--space-4)]">
      <Card className="w-full max-w-[420px] p-8 shadow-md rounded-[var(--radius-lg)]">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-[var(--color-text-primary)]">
            Proof Day
          </CardTitle>
          <CardDescription className="text-[var(--color-text-secondary)]">
            Pulsa el botón para acceder con tu link de email.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ConfirmButton
            token={token}
            type={type}
            redirectTo={redirectTo}
          />
        </CardContent>
      </Card>
    </main>
  )
}
