'use client'

import { useRef, useState } from 'react'
import { uploadImageToStorage } from '@/lib/utils/imageUpload'
import { validateImageFile } from '@/lib/types/projects'

export interface UploaderImage {
  url: string
  path: string
}

interface Props {
  images: UploaderImage[]
  onImagesChange: (images: UploaderImage[]) => void
  maxImages?: number
}

export function ImageUploader({ images, onImagesChange, maxImages = 3 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAtLimit = images.length >= maxImages

  function handleAddClick() {
    if (!isAtLimit) {
      inputRef.current?.click()
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError(null)

    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error ?? 'Archivo inválido')
      return
    }

    if (images.length >= maxImages) {
      setError(`Máximo ${maxImages} imágenes`)
      return
    }

    setUploading(true)
    try {
      const uploaded = await uploadImageToStorage(file)
      onImagesChange([...images, uploaded])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  function handleRemove(index: number) {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  return (
    <div data-testid="modal-field-images" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-label="Seleccionar imagen"
      />

      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {images.map((img, index) => (
            <div
              key={img.path}
              style={{ position: 'relative', width: '80px', height: '80px' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={`Imagen ${index + 1}`}
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                }}
              />
              <button
                type="button"
                aria-label="Eliminar imagen"
                onClick={() => handleRemove(index)}
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  width: '20px',
                  height: '20px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-text-primary)',
                  color: 'var(--color-surface)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--text-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleAddClick}
        disabled={isAtLimit || uploading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          border: '2px dashed var(--color-border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-background)',
          color: isAtLimit ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)',
          cursor: isAtLimit ? 'not-allowed' : 'pointer',
          width: 'fit-content',
        }}
      >
        <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span>
        <span>
          {uploading
            ? 'Subiendo...'
            : isAtLimit
            ? `Límite alcanzado (${maxImages})`
            : `Añadir imagen${images.length > 0 ? ` (${images.length}/${maxImages})` : ''}`}
        </span>
      </button>

      {error && (
        <p
          role="alert"
          style={{ fontSize: 'var(--text-sm)', color: 'var(--color-weak-text)', margin: 0 }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
