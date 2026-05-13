'use client'

import { useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { uploadCommunityImageToStorage } from '@/lib/utils/communityImageUpload'
import { validateCommunityImageFile, COMMUNITY_IMAGE_ALLOWED_TYPES } from '@/lib/types/communities'

type Tab = 'upload' | 'url'

interface Props {
  value: string | null
  onChange: (url: string | null) => void
  communityId?: string
}

export function CommunityImageInput({ value, onChange, communityId }: Props) {
  const [tab, setTab] = useState<Tab>('upload')
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError(null)

    const validation = validateCommunityImageFile(file)
    if (!validation.valid) {
      setError(validation.error ?? 'Archivo inválido')
      return
    }

    setUploading(true)
    try {
      const { url } = await uploadCommunityImageToStorage(file, communityId)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  function handleUrlConfirm() {
    const trimmed = urlInput.trim()
    if (!trimmed) {
      setError('Introduce una URL válida')
      return
    }
    try {
      new URL(trimmed)
    } catch {
      setError('URL inválida')
      return
    }
    setError(null)
    onChange(trimmed)
  }

  function handleRemove() {
    onChange(null)
    setUrlInput('')
    setError(null)
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: 'var(--space-2) var(--space-4)',
    fontSize: 'var(--text-sm)',
    fontWeight: active ? 'var(--font-semibold)' : 'var(--font-normal)',
    color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
    background: 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
        <button type="button" style={tabStyle(tab === 'upload')} onClick={() => { setTab('upload'); setError(null) }}>
          Subir archivo
        </button>
        <button type="button" style={tabStyle(tab === 'url')} onClick={() => { setTab('url'); setError(null) }}>
          Desde URL
        </button>
      </div>

      {/* Preview de imagen seleccionada */}
      {value && (
        <div style={{ position: 'relative', width: '80px', height: '80px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview de imagen"
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
            onClick={handleRemove}
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
      )}

      {/* Tab: Subir archivo */}
      {tab === 'upload' && !value && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={COMMUNITY_IMAGE_ALLOWED_TYPES.join(',')}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            aria-label="Seleccionar imagen"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-label="Seleccionar imagen desde archivo"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-1)',
              width: '80px',
              height: '80px',
              border: '1.5px dashed var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-xs)',
              cursor: uploading ? 'wait' : 'pointer',
            }}
          >
            <ImagePlus size={20} aria-hidden="true" />
            <span>{uploading ? '...' : 'Añadir'}</span>
          </button>
        </>
      )}

      {/* Tab: Desde URL */}
      {tab === 'url' && !value && (
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlConfirm())}
            placeholder="https://ejemplo.com/imagen.jpg"
            aria-label="URL de imagen externa"
            style={{
              flex: 1,
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--text-sm)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={handleUrlConfirm}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-surface)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Usar URL
          </button>
        </div>
      )}

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
