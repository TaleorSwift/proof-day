'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { buildConfirmParams, DEFAULT_REDIRECT } from '@/lib/auth/confirm'

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
  redirectTo = DEFAULT_REDIRECT,
}: ConfirmButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // CSRF: el token es de un solo uso y se verifica contra Supabase desde el
  // navegador del usuario — los bots no pueden completar el flujo porque no
  // pasan por este onClick (solo hacen GET a la URL del email).
  async function handleConfirm() {
    if (!token || token.trim() === '') {
      setError('El enlace ha expirado. Solicita uno nuevo.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const params = buildConfirmParams({ token, type })

      const { error: otpError } = await supabase.auth.verifyOtp({
        token_hash: params.token_hash,
        type: params.type as 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email',
      })

      if (otpError) {
        console.error('[ConfirmButton] verifyOtp error:', otpError)
        setError('El enlace ha expirado. Solicita uno nuevo.')
        return
      }

      router.push(redirectTo)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-(--space-4)">
      {error && (
        <p
          role="alert"
          className="text-(--color-weak-text) text-(--text-sm)"
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
