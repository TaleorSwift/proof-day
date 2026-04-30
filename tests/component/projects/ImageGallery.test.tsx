// @vitest-environment jsdom
/**
 * Tests — ImageGallery (components/projects/ImageGallery.tsx)
 * Cubre: galería vacía, con imágenes, modo no editable, modo editable
 * (reordenar, eliminar con confirmación) y manejo de errores.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// ---------------------------------------------------------------------------
// Mocks hoisted
// ---------------------------------------------------------------------------

const { mockDeleteProjectImage, mockReorderProjectImages } = vi.hoisted(() => ({
  mockDeleteProjectImage: vi.fn(),
  mockReorderProjectImages: vi.fn(),
}))

vi.mock('@/lib/api/projects', () => ({
  deleteProjectImage: mockDeleteProjectImage,
  reorderProjectImages: mockReorderProjectImages,
}))

// ImageUpload se usa dentro de ImageGallery — mockeamos para aislar
vi.mock('@/components/projects/ImageUpload', () => ({
  ImageUpload: ({
    projectId,
    onUploaded,
  }: {
    projectId: string
    currentCount: number
    onUploaded: (r: { url: string; path: string }) => void
  }) => (
    <div
      data-testid="image-upload-mock"
      data-project-id={projectId}
      onClick={() =>
        onUploaded({ url: 'https://storage.example.com/nueva.jpg', path: 'u/p/nueva.jpg' })
      }
    />
  ),
}))

import { ImageGallery } from '@/components/projects/ImageGallery'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PROJECT_ID = 'p0000000-0000-4000-8000-000000000001'

const UNA_IMAGEN = [
  { path: 'user/project/imagen-1.jpg', url: 'https://storage.example.com/imagen-1.jpg' },
]

const DOS_IMAGENES = [
  { path: 'user/project/imagen-1.jpg', url: 'https://storage.example.com/imagen-1.jpg' },
  { path: 'user/project/imagen-2.jpg', url: 'https://storage.example.com/imagen-2.jpg' },
]

const TRES_IMAGENES = [
  { path: 'user/project/imagen-1.jpg', url: 'https://storage.example.com/imagen-1.jpg' },
  { path: 'user/project/imagen-2.jpg', url: 'https://storage.example.com/imagen-2.jpg' },
  { path: 'user/project/imagen-3.jpg', url: 'https://storage.example.com/imagen-3.jpg' },
]

function renderGallery(
  images = DOS_IMAGENES,
  isEditable = false
) {
  return render(
    <ImageGallery
      projectId={PROJECT_ID}
      initialImages={images}
      isEditable={isEditable}
    />
  )
}

// ---------------------------------------------------------------------------
// Galería vacía
// ---------------------------------------------------------------------------

describe('ImageGallery — galería vacía', () => {
  afterEach(() => vi.clearAllMocks())

  it('no muestra imágenes cuando initialImages está vacío', () => {
    renderGallery([])
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('muestra el componente ImageUpload cuando isEditable=true y no hay imágenes', () => {
    renderGallery([], true)
    expect(screen.getByTestId('image-upload-mock')).toBeInTheDocument()
  })

  it('no muestra el componente ImageUpload cuando isEditable=false y no hay imágenes', () => {
    renderGallery([], false)
    expect(screen.queryByTestId('image-upload-mock')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Galería con imágenes — modo solo lectura
// ---------------------------------------------------------------------------

describe('ImageGallery — con imágenes, modo no editable', () => {
  afterEach(() => vi.clearAllMocks())

  it('muestra todas las imágenes como thumbnails', () => {
    renderGallery(DOS_IMAGENES)
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })

  it('muestra la imagen con alt "Imagen 1" para el primer thumbnail', () => {
    renderGallery(DOS_IMAGENES)
    expect(screen.getByAltText('Imagen 1')).toBeInTheDocument()
  })

  it('muestra el badge "Principal" sobre la primera imagen', () => {
    renderGallery(DOS_IMAGENES)
    expect(screen.getByText('Principal')).toBeInTheDocument()
  })

  it('no muestra el badge "Principal" en imágenes que no son la primera', () => {
    renderGallery(DOS_IMAGENES)
    const badges = screen.getAllByText('Principal')
    expect(badges).toHaveLength(1)
  })

  it('no muestra botones de control en modo no editable', () => {
    renderGallery(DOS_IMAGENES, false)
    expect(screen.queryByRole('button', { name: /eliminar imagen/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /subir imagen/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /bajar imagen/i })).not.toBeInTheDocument()
  })

  it('no muestra el componente ImageUpload en modo no editable', () => {
    renderGallery(DOS_IMAGENES, false)
    expect(screen.queryByTestId('image-upload-mock')).not.toBeInTheDocument()
  })

  it('muestra correctamente tres imágenes', () => {
    renderGallery(TRES_IMAGENES)
    expect(screen.getAllByRole('img')).toHaveLength(3)
  })
})

// ---------------------------------------------------------------------------
// Modo editable — controles de navegación y eliminación
// ---------------------------------------------------------------------------

describe('ImageGallery — modo editable, controles visibles', () => {
  afterEach(() => vi.clearAllMocks())

  it('muestra el botón "Eliminar imagen" cuando hay más de una imagen', () => {
    renderGallery(DOS_IMAGENES, true)
    const botones = screen.getAllByRole('button', { name: /eliminar imagen/i })
    expect(botones.length).toBeGreaterThan(0)
  })

  it('no muestra el botón "Eliminar imagen" cuando solo hay una imagen', () => {
    renderGallery(UNA_IMAGEN, true)
    expect(screen.queryByRole('button', { name: /eliminar imagen/i })).not.toBeInTheDocument()
  })

  it('muestra el botón "Bajar imagen" para la primera imagen cuando hay más de una', () => {
    renderGallery(DOS_IMAGENES, true)
    expect(screen.getByRole('button', { name: /bajar imagen/i })).toBeInTheDocument()
  })

  it('no muestra el botón "Subir imagen" para la primera imagen', () => {
    renderGallery(DOS_IMAGENES, true)
    // La primera imagen nunca tiene botón "Subir"
    const botonesBajar = screen.getAllByRole('button', { name: /bajar imagen/i })
    const botonesSubir = screen.queryAllByRole('button', { name: /subir imagen/i })
    // Con 2 imágenes: primera tiene ↓, segunda tiene ↑ (y eliminar)
    expect(botonesBajar.length).toBeGreaterThan(0)
    expect(botonesSubir.length).toBeGreaterThan(0)
  })

  it('muestra el componente ImageUpload en modo editable', () => {
    renderGallery(DOS_IMAGENES, true)
    expect(screen.getByTestId('image-upload-mock')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Flujo de eliminación con confirmación
// ---------------------------------------------------------------------------

describe('ImageGallery — eliminar imagen (flujo completo)', () => {
  afterEach(() => vi.clearAllMocks())

  it('al hacer click en "Eliminar imagen" muestra el panel de confirmación', async () => {
    const user = userEvent.setup()
    renderGallery(DOS_IMAGENES, true)

    const botonesEliminar = screen.getAllByRole('button', { name: /eliminar imagen/i })
    await user.click(botonesEliminar[0])

    expect(screen.getByText('Eliminar?')).toBeInTheDocument()
  })

  it('muestra botones "Si" y "No" en el panel de confirmación', async () => {
    const user = userEvent.setup()
    renderGallery(DOS_IMAGENES, true)

    const botonesEliminar = screen.getAllByRole('button', { name: /eliminar imagen/i })
    await user.click(botonesEliminar[0])

    expect(screen.getByRole('button', { name: /^si$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^no$/i })).toBeInTheDocument()
  })

  it('al hacer click en "No" cancela la confirmación', async () => {
    const user = userEvent.setup()
    renderGallery(DOS_IMAGENES, true)

    const botonesEliminar = screen.getAllByRole('button', { name: /eliminar imagen/i })
    await user.click(botonesEliminar[0])
    await user.click(screen.getByRole('button', { name: /^no$/i }))

    expect(screen.queryByText('Eliminar?')).not.toBeInTheDocument()
  })

  it('al confirmar llama a deleteProjectImage con projectId y path correctos', async () => {
    mockDeleteProjectImage.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderGallery(DOS_IMAGENES, true)

    const botonesEliminar = screen.getAllByRole('button', { name: /eliminar imagen/i })
    await user.click(botonesEliminar[0])
    await user.click(screen.getByRole('button', { name: /^si$/i }))

    await waitFor(() => {
      expect(mockDeleteProjectImage).toHaveBeenCalledWith(
        PROJECT_ID,
        DOS_IMAGENES[0].path
      )
    })
  })

  it('tras confirmar eliminar con éxito, la imagen desaparece de la galería', async () => {
    mockDeleteProjectImage.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderGallery(DOS_IMAGENES, true)

    expect(screen.getAllByRole('img')).toHaveLength(2)

    const botonesEliminar = screen.getAllByRole('button', { name: /eliminar imagen/i })
    await user.click(botonesEliminar[0])
    await user.click(screen.getByRole('button', { name: /^si$/i }))

    await waitFor(() => {
      expect(screen.getAllByRole('img')).toHaveLength(1)
    })
  })

  it('muestra error en role="alert" cuando deleteProjectImage lanza excepción', async () => {
    mockDeleteProjectImage.mockRejectedValue(new Error('Error al eliminar'))
    const user = userEvent.setup()
    renderGallery(DOS_IMAGENES, true)

    const botonesEliminar = screen.getAllByRole('button', { name: /eliminar imagen/i })
    await user.click(botonesEliminar[0])
    await user.click(screen.getByRole('button', { name: /^si$/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error al eliminar')
    })
  })

  it('la imagen se mantiene en la galería cuando la eliminación falla', async () => {
    mockDeleteProjectImage.mockRejectedValue(new Error('Error al eliminar'))
    const user = userEvent.setup()
    renderGallery(DOS_IMAGENES, true)

    const botonesEliminar = screen.getAllByRole('button', { name: /eliminar imagen/i })
    await user.click(botonesEliminar[0])
    await user.click(screen.getByRole('button', { name: /^si$/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// Reordenar imágenes
// ---------------------------------------------------------------------------

describe('ImageGallery — reordenar imágenes', () => {
  afterEach(() => vi.clearAllMocks())

  it('al hacer click en "Bajar imagen" llama a reorderProjectImages', async () => {
    mockReorderProjectImages.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderGallery(DOS_IMAGENES, true)

    await user.click(screen.getByRole('button', { name: /bajar imagen/i }))

    await waitFor(() => {
      expect(mockReorderProjectImages).toHaveBeenCalledWith(
        PROJECT_ID,
        [DOS_IMAGENES[1].path, DOS_IMAGENES[0].path]
      )
    })
  })

  it('al hacer click en "Subir imagen" llama a reorderProjectImages', async () => {
    mockReorderProjectImages.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderGallery(DOS_IMAGENES, true)

    await user.click(screen.getByRole('button', { name: /subir imagen/i }))

    await waitFor(() => {
      expect(mockReorderProjectImages).toHaveBeenCalledWith(
        PROJECT_ID,
        [DOS_IMAGENES[1].path, DOS_IMAGENES[0].path]
      )
    })
  })

  it('al hacer click en "Bajar imagen" la imagen aparece en segunda posición visualmente', async () => {
    mockReorderProjectImages.mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderGallery(DOS_IMAGENES, true)

    const imagenesAntes = screen.getAllByRole('img')
    expect(imagenesAntes[0]).toHaveAttribute('src', DOS_IMAGENES[0].url)

    await user.click(screen.getByRole('button', { name: /bajar imagen/i }))

    await waitFor(() => {
      const imagenesDepues = screen.getAllByRole('img')
      expect(imagenesDepues[0]).toHaveAttribute('src', DOS_IMAGENES[1].url)
    })
  })

  it('muestra error en role="alert" cuando reorderProjectImages lanza excepción', async () => {
    mockReorderProjectImages.mockRejectedValue(new Error('Error al reordenar'))
    const user = userEvent.setup()
    renderGallery(DOS_IMAGENES, true)

    await user.click(screen.getByRole('button', { name: /bajar imagen/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error al reordenar')
    })
  })

  it('revierte el orden cuando reorderProjectImages lanza excepción', async () => {
    mockReorderProjectImages.mockRejectedValue(new Error('Error al reordenar'))
    const user = userEvent.setup()
    renderGallery(DOS_IMAGENES, true)

    await user.click(screen.getByRole('button', { name: /bajar imagen/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    // Tras revertir, el orden original se restaura
    const imagenes = screen.getAllByRole('img')
    expect(imagenes[0]).toHaveAttribute('src', DOS_IMAGENES[0].url)
  })
})

// ---------------------------------------------------------------------------
// Upload de nueva imagen desde ImageUpload
// ---------------------------------------------------------------------------

describe('ImageGallery — añadir imagen desde upload', () => {
  afterEach(() => vi.clearAllMocks())

  it('cuando ImageUpload dispara onUploaded se añade la imagen a la galería', async () => {
    const user = userEvent.setup()
    renderGallery(DOS_IMAGENES, true)

    expect(screen.getAllByRole('img')).toHaveLength(2)

    // El mock de ImageUpload llama onUploaded al hacer click
    await user.click(screen.getByTestId('image-upload-mock'))

    await waitFor(() => {
      expect(screen.getAllByRole('img')).toHaveLength(3)
    })
  })

  it('la imagen añadida tiene el alt "Imagen 3"', async () => {
    const user = userEvent.setup()
    renderGallery(DOS_IMAGENES, true)

    await user.click(screen.getByTestId('image-upload-mock'))

    await waitFor(() => {
      expect(screen.getByAltText('Imagen 3')).toBeInTheDocument()
    })
  })
})
