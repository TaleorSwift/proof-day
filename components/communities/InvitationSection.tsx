'use client'

import { useState } from 'react'
import { generateInvitationLink } from '@/lib/api/invitations'

interface Props {
  communityId: string
  communitySlug: string
}

interface GeneratedLink {
  url: string
  copied: boolean
  generatedAt: Date
}

export default function InvitationSection({ communityId }: Props) {
  const [links, setLinks] = useState<GeneratedLink[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setIsGenerating(true)
    setError(null)

    try {
      const url = await generateInvitationLink(communityId)
      setLinks((prev) => [
        { url, copied: false, generatedAt: new Date() },
        ...prev,
      ])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al generar el link'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleCopy(index: number, url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setLinks((prev) =>
        prev.map((link, i) =>
          i === index ? { ...link, copied: true } : link
        )
      )
      // Reset "¡Copiado!" después de 2s (AC 4)
      setTimeout(() => {
        setLinks((prev) =>
          prev.map((link, i) =>
            i === index ? { ...link, copied: false } : link
          )
        )
      }, 2000)
    } catch {
      setError('No se pudo copiar al portapapeles')
    }
  }

  return (
    <section
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Section Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Links de invitación
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          Genera links de un solo uso para incorporar miembros a tu comunidad.
          Cada link solo puede usarse una vez.
        </p>
      </div>

      {/* Generate Button (AC 1) */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        style={{
          backgroundColor: isGenerating
            ? 'var(--color-text-muted)'
            : 'var(--color-primary)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-5)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
          marginBottom: 'var(--space-4)',
          transition: 'background-color 0.15s ease',
        }}
      >
        {isGenerating ? 'Generando...' : 'Generar link de invitación'}
      </button>

      {/* Error message */}
      {error && (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-weak-text)',
            backgroundColor: 'var(--color-weak-bg)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {error}
        </p>
      )}

      {/* Generated Links List */}
      {links.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {links.map((link, index) => (
            <div
              key={link.generatedAt.toISOString()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {/* Status indicator */}
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)',
                  color: link.copied
                    ? 'var(--color-promising-text)'
                    : 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap',
                  minWidth: '48px',
                }}
              >
                {link.copied ? 'Copiado' : 'Activo'}
              </span>

              {/* Link input (readonly) */}
              <input
                type="text"
                value={link.url}
                readOnly
                style={{
                  flex: 1,
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              />

              {/* Copy button (AC 4) */}
              <button
                onClick={() => handleCopy(index, link.url)}
                style={{
                  backgroundColor: link.copied
                    ? 'var(--color-promising-bg)'
                    : 'var(--color-surface)',
                  color: link.copied
                    ? 'var(--color-promising-text)'
                    : 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-1) var(--space-3)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {link.copied ? '¡Copiado!' : 'Copiar link'}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
