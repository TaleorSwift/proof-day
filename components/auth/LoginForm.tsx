'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { sendMagicLink } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { BrandHeader } from '@/components/shared/BrandHeader'
import { LegalNotice } from '@/components/shared/LegalNotice'

interface LoginFormProps {
  errorParam?: string
  /** Para Storybook: fuerza el estado "check email" sin interacción */
  initialSent?: boolean
  /** Para Storybook/tests: pre-popula el mensaje de error de servidor */
  initialServerError?: string
}

const CONTAINER_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--space-6)',
  width: '100%',
  maxWidth: '384px',
  textAlign: 'center',
}

export function LoginForm({ errorParam, initialSent = false, initialServerError }: LoginFormProps) {
  const [sent, setSent] = useState(initialSent)
  const [serverError, setServerError] = useState<string | null>(
    initialServerError ??
    (errorParam === 'link-invalid' ? 'El link ha expirado o no es válido.' : null)
  )

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
  })

  const isLoading = form.formState.isSubmitting

  async function onSubmit(data: LoginInput) {
    setServerError(null)
    const formData = new FormData()
    formData.set('email', data.email)
    const result = await sendMagicLink(formData)
    if (result?.error) {
      setServerError(result.error)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div style={CONTAINER_STYLE}>
        <BrandHeader subtitle="Revisa tu email — te hemos enviado un link de acceso" />
      </div>
    )
  }

  return (
    <div style={CONTAINER_STYLE}>
      <BrandHeader />

      <div style={{ width: '100%' }}>
        {serverError && (
          <div className="mb-4" role="alert">
            <p style={{ color: 'var(--color-weak-text)', fontSize: 'var(--text-sm)' }}>
              {serverError}
            </p>
            {errorParam === 'link-invalid' && (
              <button
                type="button"
                style={{
                  color: 'var(--color-primary)',
                  textDecoration: 'underline',
                  fontSize: 'var(--text-sm)',
                  marginTop: 'var(--space-1)',
                }}
                onClick={() => {
                  setServerError(null)
                  window.history.replaceState({}, '', '/login')
                }}
              >
                Solicitar un nuevo link
              </button>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Tu email de trabajo</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@empresa.com"
                      aria-describedby={form.formState.errors.email ? 'email-error' : undefined}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="email-error" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? undefined : 'var(--color-primary)',
                color: isLoading ? undefined : 'var(--color-surface)',
                height: '44px',
                borderRadius: '10px',
                fontSize: 'var(--text-base)',
              }}
            >
              {isLoading ? 'Enviando...' : 'Continuar'}
            </Button>
          </form>
        </Form>
      </div>

      <LegalNotice />
    </div>
  )
}
