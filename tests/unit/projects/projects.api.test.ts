import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  createProject,
  updateProject,
  getProject,
  uploadProjectImage,
  deleteProjectImage,
  reorderProjectImages,
  publishProject,
  deactivateProject,
  getProjects,
  registerDecision,
} from '@/lib/api/projects'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PROJECT_ID = 'project-uuid-001'
const COMMUNITY_ID = 'community-uuid-001'

const MOCK_PROJECT_ROW = {
  id: PROJECT_ID,
  slug: 'mi-proyecto',
  community_id: COMMUNITY_ID,
  builder_id: 'user-uuid-001',
  title: 'Mi proyecto',
  problem: 'Un problema real',
  solution: 'Una solución concreta',
  hypothesis: 'Si hacemos X, Y mejorará',
  image_urls: [],
  status: 'draft' as const,
  decision: null,
  decided_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  target_user: null,
  demo_url: null,
  feedback_topics: null,
  tagline: null,
  would_use_count: 0,
}

const VALID_CREATE_INPUT = {
  communityId: COMMUNITY_ID,
  title: 'Mi proyecto',
  problem: 'Un problema real',
  solution: 'Una solución concreta',
  hypothesis: 'Si hacemos X, Y mejorará',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchOk(data: unknown, status = 200) {
  return vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    status,
    json: async () => ({ data }),
  } as Response)
}

function mockFetchError(body: Record<string, unknown>) {
  return vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: false,
    json: async () => body,
  } as Response)
}

// ---------------------------------------------------------------------------
// Suite: createProject
// ---------------------------------------------------------------------------

describe('createProject', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a POST /api/projects con Content-Type JSON', async () => {
    const fetchSpy = mockFetchOk(MOCK_PROJECT_ROW, 201)

    await createProject(VALID_CREATE_INPUT as Parameters<typeof createProject>[0])

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/projects',
      expect.objectContaining({ method: 'POST', headers: { 'Content-Type': 'application/json' } })
    )
  })

  it('retorna el ProjectRow creado cuando la respuesta es ok', async () => {
    mockFetchOk(MOCK_PROJECT_ROW)

    const result = await createProject(VALID_CREATE_INPUT as Parameters<typeof createProject>[0])

    expect(result).toEqual(MOCK_PROJECT_ROW)
  })

  it('lanza Error cuando la respuesta no es ok', async () => {
    mockFetchError({ error: 'Error al crear el proyecto' })

    await expect(
      createProject(VALID_CREATE_INPUT as Parameters<typeof createProject>[0])
    ).rejects.toThrow('Error al crear el proyecto')
  })
})

// ---------------------------------------------------------------------------
// Suite: updateProject
// ---------------------------------------------------------------------------

describe('updateProject', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a PUT /api/projects/:id con Content-Type JSON', async () => {
    const fetchSpy = mockFetchOk(MOCK_PROJECT_ROW)

    await updateProject(PROJECT_ID, { title: 'Título actualizado' })

    expect(fetchSpy).toHaveBeenCalledWith(
      `/api/projects/${PROJECT_ID}`,
      expect.objectContaining({ method: 'PUT', headers: { 'Content-Type': 'application/json' } })
    )
  })

  it('retorna el ProjectRow actualizado cuando la respuesta es ok', async () => {
    const updated = { ...MOCK_PROJECT_ROW, title: 'Título actualizado' }
    mockFetchOk(updated)

    const result = await updateProject(PROJECT_ID, { title: 'Título actualizado' })

    expect(result.title).toBe('Título actualizado')
  })

  it('lanza Error cuando la respuesta no es ok', async () => {
    mockFetchError({ error: 'Proyecto no encontrado' })

    await expect(updateProject(PROJECT_ID, { title: 'x' })).rejects.toThrow(
      'Proyecto no encontrado'
    )
  })
})

// ---------------------------------------------------------------------------
// Suite: getProject
// ---------------------------------------------------------------------------

describe('getProject', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a GET /api/projects/:id', async () => {
    const fetchSpy = mockFetchOk(MOCK_PROJECT_ROW)

    await getProject(PROJECT_ID)

    expect(fetchSpy).toHaveBeenCalledWith(`/api/projects/${PROJECT_ID}`)
  })

  it('retorna el ProjectRow cuando la respuesta es ok', async () => {
    mockFetchOk(MOCK_PROJECT_ROW)

    const result = await getProject(PROJECT_ID)

    expect(result).toEqual(MOCK_PROJECT_ROW)
  })

  it('lanza Error cuando la respuesta no es ok', async () => {
    mockFetchError({ error: 'No encontrado' })

    await expect(getProject(PROJECT_ID)).rejects.toThrow('No encontrado')
  })
})

// ---------------------------------------------------------------------------
// Suite: getProjects
// ---------------------------------------------------------------------------

describe('getProjects', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a GET /api/projects con communityId como query param', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{
          id: PROJECT_ID, slug: 'mi-proyecto', title: 'Mi proyecto',
          image_urls: [], status: 'draft', builder_id: 'user-001',
          created_at: '2024-01-01T00:00:00Z', problem: null,
        }],
      }),
    } as Response)

    await getProjects(COMMUNITY_ID)

    expect(fetchSpy).toHaveBeenCalledWith(`/api/projects?communityId=${COMMUNITY_ID}`)
  })

  it('mapea los campos snake_case a camelCase correctamente', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{
          id: PROJECT_ID, slug: 'mi-proyecto', title: 'Mi proyecto',
          image_urls: ['img/path.jpg'], status: 'live', builder_id: 'user-001',
          created_at: '2024-01-01T00:00:00Z', problem: 'Un problema',
        }],
      }),
    } as Response)

    const result = await getProjects(COMMUNITY_ID)

    expect(result[0]).toMatchObject({
      id: PROJECT_ID,
      slug: 'mi-proyecto',
      title: 'Mi proyecto',
      imageUrls: ['img/path.jpg'],
      status: 'live',
      builderId: 'user-001',
      createdAt: '2024-01-01T00:00:00Z',
      problem: 'Un problema',
    })
  })

  it('omite problem cuando es null', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{
          id: PROJECT_ID, slug: 'mi-proyecto', title: 'Mi proyecto',
          image_urls: [], status: 'draft', builder_id: 'user-001',
          created_at: '2024-01-01T00:00:00Z', problem: null,
        }],
      }),
    } as Response)

    const result = await getProjects(COMMUNITY_ID)

    expect('problem' in result[0]).toBe(false)
  })

  it('lanza Error cuando la respuesta no es ok', async () => {
    mockFetchError({ error: 'Acceso denegado' })

    await expect(getProjects(COMMUNITY_ID)).rejects.toThrow('Acceso denegado')
  })
})

// ---------------------------------------------------------------------------
// Suite: uploadProjectImage
// ---------------------------------------------------------------------------

describe('uploadProjectImage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a POST /api/projects/:id/images con FormData', async () => {
    const fetchSpy = mockFetchOk({ url: 'https://example.com/img.jpg', path: 'u/p/img.jpg' }, 201)
    const file = new File(['content'], 'foto.jpg', { type: 'image/jpeg' })

    await uploadProjectImage(PROJECT_ID, file)

    expect(fetchSpy).toHaveBeenCalledWith(
      `/api/projects/${PROJECT_ID}/images`,
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('retorna url y path cuando la respuesta es ok', async () => {
    const imageData = { url: 'https://example.com/img.jpg', path: 'u/p/img.jpg' }
    mockFetchOk(imageData)
    const file = new File(['content'], 'foto.jpg', { type: 'image/jpeg' })

    const result = await uploadProjectImage(PROJECT_ID, file)

    expect(result).toEqual(imageData)
  })

  it('lanza Error cuando la respuesta no es ok', async () => {
    mockFetchError({ error: 'Formato no válido' })
    const file = new File(['content'], 'foto.bmp', { type: 'image/bmp' })

    await expect(uploadProjectImage(PROJECT_ID, file)).rejects.toThrow('Formato no válido')
  })

  it('usa mensaje genérico cuando el error no tiene campo error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response)
    const file = new File(['content'], 'foto.jpg', { type: 'image/jpeg' })

    await expect(uploadProjectImage(PROJECT_ID, file)).rejects.toThrow('Error al subir la imagen')
  })
})

// ---------------------------------------------------------------------------
// Suite: deleteProjectImage
// ---------------------------------------------------------------------------

describe('deleteProjectImage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a DELETE /api/projects/:id/images con el path en el body', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)
    const imagePath = 'user-001/project-001/imagen.jpg'

    await deleteProjectImage(PROJECT_ID, imagePath)

    expect(fetchSpy).toHaveBeenCalledWith(
      `/api/projects/${PROJECT_ID}/images`,
      expect.objectContaining({
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
    )
    const [, options] = fetchSpy.mock.calls[0]
    expect(JSON.parse((options as RequestInit).body as string)).toEqual({ path: imagePath })
  })

  it('resuelve sin valor cuando la respuesta es ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    await expect(deleteProjectImage(PROJECT_ID, 'some/path.jpg')).resolves.toBeUndefined()
  })

  it('lanza Error cuando la respuesta no es ok', async () => {
    mockFetchError({ error: 'Imagen no encontrada' })

    await expect(deleteProjectImage(PROJECT_ID, 'some/path.jpg')).rejects.toThrow(
      'Imagen no encontrada'
    )
  })
})

// ---------------------------------------------------------------------------
// Suite: reorderProjectImages
// ---------------------------------------------------------------------------

describe('reorderProjectImages', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a PATCH /api/projects/:id/images/reorder con el array de paths', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)
    const paths = ['u/p/a.jpg', 'u/p/b.jpg']

    await reorderProjectImages(PROJECT_ID, paths)

    expect(fetchSpy).toHaveBeenCalledWith(
      `/api/projects/${PROJECT_ID}/images/reorder`,
      expect.objectContaining({ method: 'PATCH' })
    )
    const [, options] = fetchSpy.mock.calls[0]
    expect(JSON.parse((options as RequestInit).body as string)).toEqual({ imagePaths: paths })
  })

  it('resuelve sin valor cuando la respuesta es ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    await expect(reorderProjectImages(PROJECT_ID, [])).resolves.toBeUndefined()
  })

  it('lanza Error cuando la respuesta no es ok', async () => {
    mockFetchError({ error: 'Error al reordenar' })

    await expect(reorderProjectImages(PROJECT_ID, [])).rejects.toThrow('Error al reordenar')
  })
})

// ---------------------------------------------------------------------------
// Suite: publishProject
// ---------------------------------------------------------------------------

describe('publishProject', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a PATCH /api/projects/:id/status con status live', async () => {
    const fetchSpy = mockFetchOk(MOCK_PROJECT_ROW)

    await publishProject(PROJECT_ID)

    expect(fetchSpy).toHaveBeenCalledWith(
      `/api/projects/${PROJECT_ID}/status`,
      expect.objectContaining({ method: 'PATCH' })
    )
    const [, options] = fetchSpy.mock.calls[0]
    expect(JSON.parse((options as RequestInit).body as string)).toEqual({ status: 'live' })
  })

  it('retorna el ProjectRow actualizado cuando la respuesta es ok', async () => {
    const liveProject = { ...MOCK_PROJECT_ROW, status: 'live' as const }
    mockFetchOk(liveProject)

    const result = await publishProject(PROJECT_ID)

    expect(result.status).toBe('live')
  })

  it('lanza Error cuando la respuesta no es ok', async () => {
    mockFetchError({ error: 'Proyecto no encontrado' })

    await expect(publishProject(PROJECT_ID)).rejects.toThrow('Proyecto no encontrado')
  })
})

// ---------------------------------------------------------------------------
// Suite: deactivateProject
// ---------------------------------------------------------------------------

describe('deactivateProject', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a PATCH /api/projects/:id/status con status inactive', async () => {
    const fetchSpy = mockFetchOk(MOCK_PROJECT_ROW)

    await deactivateProject(PROJECT_ID)

    const [, options] = fetchSpy.mock.calls[0]
    expect(JSON.parse((options as RequestInit).body as string)).toEqual({ status: 'inactive' })
  })

  it('lanza Error cuando la respuesta no es ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Error al desactivar el proyecto' }),
    } as Response)

    await expect(deactivateProject(PROJECT_ID)).rejects.toThrow('Error al desactivar el proyecto')
  })
})

// ---------------------------------------------------------------------------
// Suite: registerDecision
// ---------------------------------------------------------------------------

describe('registerDecision', () => {
  afterEach(() => vi.restoreAllMocks())

  it('llama a POST /api/projects/:id/decision con la decisión en el body', async () => {
    const projectRow = { ...MOCK_PROJECT_ROW, decision: 'iterate', decided_at: '2024-01-02T00:00:00Z' }
    const fetchSpy = mockFetchOk(projectRow)

    await registerDecision(PROJECT_ID, 'iterate')

    expect(fetchSpy).toHaveBeenCalledWith(
      `/api/projects/${PROJECT_ID}/decision`,
      expect.objectContaining({ method: 'POST', headers: { 'Content-Type': 'application/json' } })
    )
    const [, options] = fetchSpy.mock.calls[0]
    expect(JSON.parse((options as RequestInit).body as string)).toEqual({ decision: 'iterate' })
  })

  it('retorna el Project (camelCase) cuando la respuesta es ok', async () => {
    const projectRow = {
      ...MOCK_PROJECT_ROW,
      decision: 'scale',
      decided_at: '2024-01-02T00:00:00Z',
    }
    mockFetchOk(projectRow)

    const result = await registerDecision(PROJECT_ID, 'scale')

    // projectFromRow convierte el row a camelCase
    expect(result.decision).toBe('scale')
    expect(result.id).toBe(PROJECT_ID)
  })

  it('lanza Error cuando la respuesta no es ok', async () => {
    mockFetchError({ error: 'Ya existe una decisión registrada' })

    await expect(registerDecision(PROJECT_ID, 'abandon')).rejects.toThrow(
      'Ya existe una decisión registrada'
    )
  })
})
