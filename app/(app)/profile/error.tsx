'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ProfileError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 'var(--space-4)',
        padding: 'var(--space-8)',
        textAlign: 'center',
      }}
    >
      <h2
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
        }}
      >
        Algo salió mal
      </h2>
      <p
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          maxWidth: '400px',
        }}
      >
        No hemos podido cargar tu perfil. Por favor, inténtalo de nuevo.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          padding: 'var(--space-2) var(--space-4)',
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          cursor: 'pointer',
        }}
      >
        Reintentar
      </button>
    </main>
  )
}
