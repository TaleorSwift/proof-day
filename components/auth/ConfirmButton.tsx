'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { buildConfirmParams } from '@/lib/auth/confirm'
import { type EmailOtpType } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface ConfirmButtonProps {
  token: string
  type?: string
  redirectTo?: string
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function ConfirmButton({
  token,
  type,
  redirectTo = '/communities',
}: ConfirmButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const params = buildConfirmParams({ token, type })

    const { error: otpError } = await supabase.auth.verifyOtp({
      token_hash: params.token_hash,
      type: params.type as EmailOtpType,
    })

    if (otpError) {
      setError('El enlace ha expirado. Solicita uno nuevo.')
      setIsLoading(false)
      return
    }

    router.push(redirectTo)
  }

  return (
    <div className="space-y-[var(--space-4)]">
      {error && (
        <p
          role="alert"
          className="text-[var(--color-weak-text)] text-[var(--text-sm)]"
        >
          {error}
        </p>
      )}
      <Button
        type="button"
        onClick={handleConfirm}
        disabled={isLoading}
        aria-busy={isLoading}
        className="w-full"
      >
        <span aria-live="polite" aria-atomic="true">
          {isLoading ? 'Verificando...' : 'Acceder a Proof Day'}
        </span>
      </Button>
    </div>
  )
}
