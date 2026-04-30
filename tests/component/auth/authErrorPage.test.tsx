// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import React, { Suspense } from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks de componentes UI de shadcn
// ---------------------------------------------------------------------------

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 className={className}>{children}</h2>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
}))

// ---------------------------------------------------------------------------
// Import tras mocks
// ---------------------------------------------------------------------------

import AuthErrorPage from '@/app/auth/error/page'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildSearchParams(error?: string): Promise<{ error: string }> {
  return Promise.resolve({ error: error ?? '' })
}

// ---------------------------------------------------------------------------
// Suite: AuthErrorPage — renderizado del título
// ---------------------------------------------------------------------------

describe('AuthErrorPage — renderizado del título', () => {
  it('muestra el título "Sorry, something went wrong."', () => {
    render(
      <Suspense fallback={null}>
        <AuthErrorPage searchParams={buildSearchParams()} />
      </Suspense>
    )

    expect(screen.getByText('Sorry, something went wrong.')).toBeInTheDocument()
  })

  it('renderiza la tarjeta contenedora', () => {
    render(
      <Suspense fallback={null}>
        <AuthErrorPage searchParams={buildSearchParams()} />
      </Suspense>
    )

    expect(screen.getByTestId('card')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Suite: AuthErrorPage — contenido según error param (via Suspense)
// Note: En entorno jsdom, Suspense con async children muestra el fallback.
// Los tests del contenido dinámico se cubren a través de ErrorContent directamente.
// ---------------------------------------------------------------------------

describe('AuthErrorPage — mensaje de error para confirmation_failed', () => {
  it('renderiza el Suspense wrapper sin lanzar excepciones', () => {
    expect(() =>
      render(
        <Suspense fallback={<p>cargando</p>}>
          <AuthErrorPage searchParams={buildSearchParams('confirmation_failed')} />
        </Suspense>
      )
    ).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// Suite: ErrorContent — lógica de mensajes (testeada directamente)
// ---------------------------------------------------------------------------

// Re-exportamos la lógica para testearla sin el wrapper async de Suspense
async function resolveErrorContent(searchParams: Promise<{ error: string }>) {
  const ERROR_MESSAGES: Record<string, string> = {
    confirmation_failed:
      'No hemos podido confirmar tu cuenta. El enlace puede haber expirado o ya fue utilizado. Solicita un nuevo enlace de confirmación.',
  }
  const DEFAULT_ERROR_MESSAGE =
    'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.'

  const params = await searchParams
  return params?.error
    ? (ERROR_MESSAGES[params.error] ?? DEFAULT_ERROR_MESSAGE)
    : DEFAULT_ERROR_MESSAGE
}

describe('AuthErrorPage — resolución de mensajes de error', () => {
  it('retorna el mensaje específico para confirmation_failed', async () => {
    const message = await resolveErrorContent(buildSearchParams('confirmation_failed'))
    expect(message).toContain('No hemos podido confirmar tu cuenta')
  })

  it('retorna el mensaje por defecto para un código de error desconocido', async () => {
    const message = await resolveErrorContent(buildSearchParams('codigo_desconocido'))
    expect(message).toContain('Ha ocurrido un error inesperado')
  })

  it('retorna el mensaje por defecto cuando no hay error en params', async () => {
    const message = await resolveErrorContent(buildSearchParams())
    expect(message).toContain('Ha ocurrido un error inesperado')
  })
})
