'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { sendMagicLink } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
}

export function LoginForm({ errorParam }: LoginFormProps) {
  const [sent, setSent] = useState(false)
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
      <Card className="w-full max-w-[420px] p-8 shadow-md rounded-[var(--radius-lg)]">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-[var(--color-text-primary)]">
            Proof Day
          </CardTitle>
          <CardDescription className="text-[var(--color-text-secondary)]">
            Valida tu idea. Toma la decisión.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-[var(--color-text-primary)] text-[var(--text-base)]">
            Revisa tu email — te hemos enviado un link de acceso
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-[420px] p-8 shadow-md rounded-[var(--radius-lg)]">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-[var(--text-2xl)] font-[var(--font-semibold)] text-[var(--color-text-primary)]">
          Proof Day
        </CardTitle>
        <CardDescription className="text-[var(--color-text-secondary)]">
          Valida tu idea. Toma la decisión.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {serverError && (
          <div className="mb-4" role="alert">
            <p className="text-[var(--color-weak-text)] text-[var(--text-sm)]">
              {serverError}
            </p>
            {errorParam === 'link-invalid' && (
              <button
                type="button"
                className="text-[var(--color-primary)] underline text-[var(--text-sm)] mt-1"
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
            >
              {isLoading ? 'Enviando...' : 'Continuar'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
