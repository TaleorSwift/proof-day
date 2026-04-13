'use client'

import { useState } from 'react'
import Image from 'next/image'
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

interface LoginFormProps {
  errorParam?: string
  /** Para Storybook: fuerza el estado "check email" sin interacción */
  initialSent?: boolean
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

export function LoginForm({ errorParam, initialSent = false }: LoginFormProps) {
  const [sent, setSent] = useState(initialSent)
  const [serverError, setServerError] = useState<string | null>(
    errorParam === 'link-invalid'
      ? 'El link ha expirado o no es válido.'
      : null
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
        <Image src="/logo.png" alt="Proof Day" width={192} height={192} priority />
        <h1
          style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
          }}
        >
          Bienvenido a Proof Day
        </h1>
        <p style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-base)' }}>
          Revisa tu email — te hemos enviado un link de acceso
        </p>
      </div>
    )
  }

  return (
    <div style={CONTAINER_STYLE}>
      <Image src="/logo.png" alt="Proof Day" width={128} height={128} priority />

      <h1
        style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
        }}
      >
        Bienvenido a Proof Day
      </h1>

      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
        Valida ideas. Aprende más rápido. Construye lo que importa.
      </p>

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

      <p
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-secondary)',
          lineHeight: '1.4',
        }}
      >
        Al continuar, aceptas compartir feedback constructivo y ayudar a tu equipo a aprender.
      </p>
    </div>
  )
}
