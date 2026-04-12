// @vitest-environment jsdom
/**
 * Tests — ImageUploader (Story 9.8)
 * AC-6: subida de imágenes, límite de 3, botón desactivado al límite.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

vi.mock('@/lib/utils/imageUpload', () => ({
  uploadImageToStorage: vi.fn(),
}))

import { ImageUploader } from '@/components/projects/ImageUploader'
import { PROJECT_IMAGE_ALLOWED_TYPES } from '@/lib/types/projects'

describe('ImageUploader — render', () => {
  it('renderiza el contenedor con data-testid="modal-field-images"', () => {
    render(<ImageUploader images={[]} onImagesChange={vi.fn()} maxImages={3} />)
    expect(screen.getByTestId('modal-field-images')).toBeInTheDocument()
  })

  it('muestra el botón "Añadir imagen" cuando no se ha alcanzado el límite', () => {
    render(<ImageUploader images={[]} onImagesChange={vi.fn()} maxImages={3} />)
    expect(screen.getByText('Añadir imagen')).toBeInTheDocument()
  })
})

describe('ImageUploader — AC-6: límite de imágenes', () => {
  it('el botón está desactivado cuando se alcanzan 3 imágenes', () => {
    const images = [
      { url: 'https://example.com/a.jpg', path: 'path/a.jpg' },
      { url: 'https://example.com/b.jpg', path: 'path/b.jpg' },
      { url: 'https://example.com/c.jpg', path: 'path/c.jpg' },
    ]
    render(<ImageUploader images={images} onImagesChange={vi.fn()} maxImages={3} />)
    const btn = screen.getByRole('button', { name: /límite alcanzado/i })
    expect(btn).toBeDisabled()
  })

  it('el input acepta solo los tipos MIME permitidos (JPEG, PNG, WebP)', () => {
    render(<ImageUploader images={[]} onImagesChange={vi.fn()} maxImages={3} />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toHaveAttribute('accept', PROJECT_IMAGE_ALLOWED_TYPES.join(','))
  })
})

describe('ImageUploader — previews', () => {
  it('muestra previews de las imágenes existentes', () => {
    const images = [
      { url: 'https://example.com/a.jpg', path: 'path/a.jpg' },
      { url: 'https://example.com/b.jpg', path: 'path/b.jpg' },
    ]
    render(<ImageUploader images={images} onImagesChange={vi.fn()} maxImages={3} />)
    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(2)
  })

  it('cada preview tiene botón de eliminar', () => {
    const images = [{ url: 'https://example.com/a.jpg', path: 'path/a.jpg' }]
    render(<ImageUploader images={images} onImagesChange={vi.fn()} maxImages={3} />)
    const removeBtn = screen.getByRole('button', { name: /eliminar imagen/i })
    expect(removeBtn).toBeInTheDocument()
  })

  it('al hacer clic en eliminar, llama onImagesChange sin esa imagen', () => {
    const onImagesChange = vi.fn()
    const images = [
      { url: 'https://example.com/a.jpg', path: 'path/a.jpg' },
      { url: 'https://example.com/b.jpg', path: 'path/b.jpg' },
    ]
    render(
      <ImageUploader images={images} onImagesChange={onImagesChange} maxImages={3} />
    )
    const removeBtns = screen.getAllByRole('button', { name: /eliminar imagen/i })
    fireEvent.click(removeBtns[0])
    expect(onImagesChange).toHaveBeenCalledWith([
      { url: 'https://example.com/b.jpg', path: 'path/b.jpg' },
    ])
  })
})
