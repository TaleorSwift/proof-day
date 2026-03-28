'use client'

import { useState } from 'react'
import { deleteProjectImage, reorderProjectImages } from '@/lib/api/projects'
import { PROJECT_IMAGES_BUCKET } from '@/lib/types/projects'
import { ImageUpload } from './ImageUpload'

interface GalleryImage {
  path: string   // relative storage path
  url: string    // public URL
}

interface ImageGalleryProps {
  projectId: string
  initialImages: GalleryImage[]
  isEditable: boolean
}

/**
 * Build a public URL from a relative storage path.
 * Uses the NEXT_PUBLIC_SUPABASE_URL env var at runtime.
 */
function buildPublicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) return path
  return `${base}/storage/v1/object/public/${PROJECT_IMAGES_BUCKET}/${path}`
}

export function ImageGallery({ projectId, initialImages, isEditable }: ImageGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages)
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ── Upload ──────────────────────────────────────────────────────────────────

  function handleUploaded(result: { url: string; path: string }) {
    setImages((prev) => [...prev, { path: result.path, url: result.url }])
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  function requestDelete(index: number) {
    // Only allow delete if there are more than 1 image (AC: 7)
    if (images.length <= 1) return
    setConfirmIndex(index)
  }

  function cancelDelete() {
    setConfirmIndex(null)
  }

  async function confirmDelete(index: number) {
    const image = images[index]
    setConfirmIndex(null)
    setDeletingIndex(index)
    setError(null)
    try {
      await deleteProjectImage(projectId, image.path)
      setImages((prev) => prev.filter((_, i) => i !== index))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la imagen')
    } finally {
      setDeletingIndex(null)
    }
  }

  // ── Reorder ─────────────────────────────────────────────────────────────────

  async function move(index: number, direction: -1 | 1) {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= images.length) return

    const reordered = [...images]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, moved)
    setImages(reordered)
    setError(null)

    try {
      await reorderProjectImages(projectId, reordered.map((img) => img.path))
    } catch (err) {
      // Revert on error
      setImages(images)
      setError(err instanceof Error ? err.message : 'Error al reordenar las imágenes')
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Thumbnails row */}
      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          {images.map((image, index) => {
            const isDeleting = deletingIndex === index
            const isConfirming = confirmIndex === index

            return (
              <div key={image.path} style={{ position: 'relative', width: '80px', flexShrink: 0 }}>
                {/* Thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url || buildPublicUrl(image.path)}
                  alt={`Imagen ${index + 1}`}
                  width={80}
                  height={80}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                    border:
                      index === 0
                        ? '2px solid var(--color-accent)'
                        : '1px solid var(--color-border)',
                    opacity: isDeleting ? 0.4 : 1,
                    display: 'block',
                  }}
                />

                {/* "Main" badge for first image */}
                {index === 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                      fontSize: '0.6rem',
                      backgroundColor: 'var(--color-accent)',
                      color: '#fff',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1px 4px',
                      fontWeight: 'var(--font-semibold)',
                      lineHeight: 1.4,
                    }}
                  >
                    Principal
                  </span>
                )}

                {/* Controls overlay */}
                {isEditable && !isDeleting && !isConfirming && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1px',
                    }}
                  >
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        aria-label="Subir imagen"
                        title="Subir"
                        style={controlBtnStyle}
                      >
                        ↑
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        aria-label="Bajar imagen"
                        title="Bajar"
                        style={controlBtnStyle}
                      >
                        ↓
                      </button>
                    )}
                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => requestDelete(index)}
                        aria-label="Eliminar imagen"
                        title="Eliminar"
                        style={{ ...controlBtnStyle, backgroundColor: 'rgba(185,28,28,0.75)' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}

                {/* Inline delete confirmation (AC: 7) */}
                {isEditable && isConfirming && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(255,255,255,0.92)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-primary)',
                        fontWeight: 'var(--font-medium)',
                        textAlign: 'center',
                      }}
                    >
                      Eliminar?
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => confirmDelete(index)}
                        style={{
                          ...confirmBtnStyle,
                          backgroundColor: 'var(--color-weak-bg)',
                          color: 'var(--color-weak-text)',
                        }}
                      >
                        Si
                      </button>
                      <button
                        type="button"
                        onClick={cancelDelete}
                        style={{
                          ...confirmBtnStyle,
                          backgroundColor: 'var(--color-border)',
                          color: 'var(--color-text-secondary)',
                        }}
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading indicator */}
                {isDeleting && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    ...
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Error message */}
      {error && (
        <p role="alert" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-weak-text)', margin: 0 }}>
          {error}
        </p>
      )}

      {/* Upload zone */}
      {isEditable && (
        <ImageUpload
          projectId={projectId}
          currentCount={images.length}
          onUploaded={handleUploaded}
        />
      )}
    </div>
  )
}

// ── Shared button styles ──────────────────────────────────────────────────────

const controlBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  padding: 0,
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: 'rgba(26,26,24,0.65)',
  color: '#fff',
  fontSize: '0.7rem',
  cursor: 'pointer',
  lineHeight: 1,
}

const confirmBtnStyle: React.CSSProperties = {
  padding: '2px 6px',
  fontSize: 'var(--text-xs)',
  fontWeight: 'var(--font-medium)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  lineHeight: 1.4,
}
