'use client'

import { useRef, useState } from 'react'
import { uploadProjectImage } from '@/lib/api/projects'
import {
  validateImageFile,
  validateImageCount,
  PROJECT_IMAGES_MAX_COUNT,
} from '@/lib/types/projects'

interface ImageUploadProps {
  projectId: string
  currentCount: number
  onUploaded: (result: { url: string; path: string }) => void
}

export function ImageUpload({ projectId, currentCount, onUploaded }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const isDisabled = loading || currentCount >= PROJECT_IMAGES_MAX_COUNT

  function handleClick() {
    if (!isDisabled) {
      inputRef.current?.click()
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Reset input so the same file can be re-selected if needed
    e.target.value = ''

    if (!file) return

    setError(null)

    // Client-side validation
    const fileValidation = validateImageFile(file)
    if (!fileValidation.valid) {
      setError(fileValidation.error ?? 'Archivo inválido')
      return
    }
    const countValidation = validateImageCount(currentCount)
    if (!countValidation.valid) {
      setError(countValidation.error ?? 'Límite alcanzado')
      return
    }

    // Immediate preview before upload completes
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setLoading(true)

    try {
      const result = await uploadProjectImage(projectId, file)
      onUploaded(result)
      setPreviewUrl(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen')
      setPreviewUrl(null)
    } finally {
      setLoading(false)
      URL.revokeObjectURL(objectUrl)
    }
  }

  if (currentCount >= PROJECT_IMAGES_MAX_COUNT) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-label="Seleccionar imagen"
      />

      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          width: '100%',
          minHeight: '80px',
          border: '2px dashed var(--color-border)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-background)',
          color: loading ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          padding: 'var(--space-4)',
          transition: 'border-color 0.15s, background-color 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-accent)'
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor =
              'var(--color-hypothesis-bg)'
          }
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)'
          ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--color-background)'
        }}
      >
        {loading && previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Vista previa"
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-sm)',
                opacity: 0.6,
              }}
            />
            <span>Subiendo...</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>+</span>
            <span>
              {currentCount === 0
                ? 'Añadir imagen'
                : `Añadir imagen (${currentCount}/${PROJECT_IMAGES_MAX_COUNT})`}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              JPG, PNG o WebP · máx. 5MB
            </span>
          </>
        )}
      </button>

      {error && (
        <p role="alert" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-weak-text)', margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  )
}
