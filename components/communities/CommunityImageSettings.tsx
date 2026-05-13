'use client'

import { useState } from 'react'
import { CommunityImageInput } from './CommunityImageInput'
import { updateCommunityImage, ApiError } from '@/lib/api/communities'

interface Props {
  communityId: string
  currentImageUrl: string | null
}

export function CommunityImageSettings({ communityId, currentImageUrl }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await updateCommunityImage(communityId, imageUrl)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Error al guardar la imagen',
      )
    } finally {
      setSaving(false)
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
        marginBottom: 'var(--space-6)',
      }}
    >
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Imagen de portada
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          Sube un archivo o pega una URL. La imagen se descargará y guardará en nuestro servidor.
        </p>
      </div>

      <CommunityImageInput
        value={imageUrl}
        onChange={setImageUrl}
        communityId={communityId}
      />

      {error && (
        <p
          role="alert"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-weak-text)',
            marginTop: 'var(--space-3)',
          }}
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        style={{
          marginTop: 'var(--space-4)',
          padding: 'var(--space-3) var(--space-5)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          backgroundColor: saved
            ? 'var(--color-promising-bg)'
            : saving
              ? 'var(--color-text-muted)'
              : 'var(--color-primary)',
          color: saved ? 'var(--color-promising-text)' : 'var(--color-surface)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: saving ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.15s ease',
        }}
      >
        {saved ? 'Guardado' : saving ? 'Guardando...' : 'Guardar imagen'}
      </button>
    </section>
  )
}
