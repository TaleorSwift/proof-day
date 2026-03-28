import { describe, it, expect } from 'vitest'
import {
  validateImageFile,
  validateImageCount,
  reorderImageUrls,
  PROJECT_IMAGE_MAX_SIZE,
  PROJECT_IMAGES_MAX_COUNT,
} from '@/lib/types/projects'

// ── Helper factories ──────────────────────────────────────────────────────────

function makeFile(name: string, type: string, sizeBytes: number): File {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type })
  return new File([blob], name, { type })
}

// ── validateImageFile — format ───────────────────────────────────────────────

describe('validateImageFile — formato', () => {
  it('acepta image/jpeg', () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 1024)
    const result = validateImageFile(file)
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('acepta image/png', () => {
    const file = makeFile('photo.png', 'image/png', 1024)
    expect(validateImageFile(file).valid).toBe(true)
  })

  it('acepta image/webp', () => {
    const file = makeFile('photo.webp', 'image/webp', 1024)
    expect(validateImageFile(file).valid).toBe(true)
  })

  it('rechaza image/gif', () => {
    const file = makeFile('anim.gif', 'image/gif', 1024)
    const result = validateImageFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/JPG.*PNG.*WebP/i)
  })

  it('rechaza application/pdf', () => {
    const file = makeFile('doc.pdf', 'application/pdf', 1024)
    expect(validateImageFile(file).valid).toBe(false)
  })

  it('rechaza image/svg+xml', () => {
    const file = makeFile('icon.svg', 'image/svg+xml', 512)
    expect(validateImageFile(file).valid).toBe(false)
  })
})

// ── validateImageFile — size ──────────────────────────────────────────────────

describe('validateImageFile — tamaño', () => {
  it('acepta archivo exactamente en el límite (5MB)', () => {
    const file = makeFile('big.jpg', 'image/jpeg', PROJECT_IMAGE_MAX_SIZE)
    expect(validateImageFile(file).valid).toBe(true)
  })

  it('rechaza archivo de 5MB + 1 byte', () => {
    const file = makeFile('toobig.jpg', 'image/jpeg', PROJECT_IMAGE_MAX_SIZE + 1)
    const result = validateImageFile(file)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/5MB/i)
  })

  it('rechaza archivo de 10MB', () => {
    const file = makeFile('huge.png', 'image/png', PROJECT_IMAGE_MAX_SIZE * 2)
    expect(validateImageFile(file).valid).toBe(false)
  })

  it('acepta archivo pequeño (100KB)', () => {
    const file = makeFile('small.webp', 'image/webp', 100 * 1024)
    expect(validateImageFile(file).valid).toBe(true)
  })
})

// ── validateImageCount ────────────────────────────────────────────────────────

describe('validateImageCount — límite de imágenes', () => {
  it('acepta 0 imágenes (proyecto nuevo)', () => {
    expect(validateImageCount(0).valid).toBe(true)
  })

  it('acepta hasta 4 imágenes (1 más disponible)', () => {
    expect(validateImageCount(4).valid).toBe(true)
  })

  it('rechaza exactamente PROJECT_IMAGES_MAX_COUNT (5)', () => {
    const result = validateImageCount(PROJECT_IMAGES_MAX_COUNT)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/5/i)
  })

  it('rechaza más de 5 imágenes (6)', () => {
    expect(validateImageCount(6).valid).toBe(false)
  })
})

// ── reorderImageUrls ──────────────────────────────────────────────────────────

describe('reorderImageUrls — reordenamiento', () => {
  const urls = [
    'user/proj/1.jpg',
    'user/proj/2.jpg',
    'user/proj/3.jpg',
  ]

  it('mueve el primer elemento al segundo lugar', () => {
    const result = reorderImageUrls(urls, 0, 1)
    expect(result).toEqual([
      'user/proj/2.jpg',
      'user/proj/1.jpg',
      'user/proj/3.jpg',
    ])
  })

  it('mueve el último elemento al primero', () => {
    const result = reorderImageUrls(urls, 2, 0)
    expect(result).toEqual([
      'user/proj/3.jpg',
      'user/proj/1.jpg',
      'user/proj/2.jpg',
    ])
  })

  it('no modifica el array si fromIndex === toIndex', () => {
    expect(reorderImageUrls(urls, 1, 1)).toEqual(urls)
  })

  it('no modifica el array si índices son inválidos', () => {
    expect(reorderImageUrls(urls, -1, 1)).toEqual(urls)
    expect(reorderImageUrls(urls, 0, 99)).toEqual(urls)
  })

  it('no muta el array original', () => {
    const original = [...urls]
    reorderImageUrls(urls, 0, 2)
    expect(urls).toEqual(original)
  })

  it('maneja array de un solo elemento', () => {
    const single = ['user/proj/1.jpg']
    expect(reorderImageUrls(single, 0, 0)).toEqual(single)
  })
})
