import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock de next/cache
// ---------------------------------------------------------------------------

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Mock de Supabase (hoisted para que vi.mock lo use)
// ---------------------------------------------------------------------------

const { supabaseMock } = vi.hoisted(() => {
  const supabaseMock = {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  }
  return { supabaseMock }
})

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(supabaseMock),
}))

// ---------------------------------------------------------------------------
// Imports — después de los mocks
// ---------------------------------------------------------------------------

import { launchProject, type LaunchProjectInput } from '@/actions/projects/launchProject'
import { revalidatePath } from 'next/cache'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-uuid-test' }
const MOCK_COMMUNITY = { id: 'community-uuid-test' }
const MOCK_PROJECT = { id: 'project-uuid-test', slug: 'mi-proyecto-test' }

const VALID_INPUT: LaunchProjectInput = {
  communitySlug: 'startup-madrid',
  title: 'Mi proyecto test',
  tagline: 'Tagline de test',
  problem: 'El problema a resolver',
  solution: 'La solución propuesta',
  hypothesis: 'Si implemento esto, funciona',
  imageUrls: [],
  feedbackTopics: [],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockAuthOk() {
  supabaseMock.auth.getUser.mockResolvedValue({
    data: { user: MOCK_USER },
  })
}

function mockAuthNotAuthenticated() {
  supabaseMock.auth.getUser.mockResolvedValue({
    data: { user: null },
  })
}

function mockCommunityFound() {
  supabaseMock.from.mockImplementation((table: string) => {
    if (table === 'communities') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_COMMUNITY, error: null }),
      }
    }
    if (table === 'projects') {
      return {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_PROJECT, error: null }),
      }
    }
    return {}
  })
}

function mockCommunityNotFound() {
  supabaseMock.from.mockImplementation((table: string) => {
    if (table === 'communities') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
    }
    return {}
  })
}

function mockProjectInsertError(message: string) {
  supabaseMock.from.mockImplementation((table: string) => {
    if (table === 'communities') {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: MOCK_COMMUNITY, error: null }),
      }
    }
    if (table === 'projects') {
      return {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message } }),
      }
    }
    return {}
  })
}

// ---------------------------------------------------------------------------
// Suite 1: Usuario no autenticado
// ---------------------------------------------------------------------------

describe('launchProject — no autenticado', () => {
  beforeEach(mockAuthNotAuthenticated)
  afterEach(() => vi.clearAllMocks())

  it('devuelve success:false con error "No autenticado"', async () => {
    const result = await launchProject(VALID_INPUT)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('No autenticado')
    }
  })
})

// ---------------------------------------------------------------------------
// Suite 2: Comunidad no encontrada
// ---------------------------------------------------------------------------

describe('launchProject — comunidad no encontrada', () => {
  beforeEach(() => {
    mockAuthOk()
    mockCommunityNotFound()
  })
  afterEach(() => vi.clearAllMocks())

  it('devuelve success:false con error "Comunidad no encontrada"', async () => {
    const result = await launchProject({ ...VALID_INPUT, communitySlug: 'slug-inexistente' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Comunidad no encontrada')
    }
  })
})

// ---------------------------------------------------------------------------
// Suite 3: Error de base de datos al insertar el proyecto
// ---------------------------------------------------------------------------

describe('launchProject — error de DB al insertar proyecto', () => {
  beforeEach(() => {
    mockAuthOk()
    mockProjectInsertError('duplicate key value violates unique constraint')
  })
  afterEach(() => vi.clearAllMocks())

  it('devuelve success:false con el mensaje de error de DB', async () => {
    const result = await launchProject(VALID_INPUT)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('duplicate key value violates unique constraint')
    }
  })

  it('no llama a revalidatePath cuando falla el insert', async () => {
    await launchProject(VALID_INPUT)
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Suite 4: Inserción exitosa
// ---------------------------------------------------------------------------

describe('launchProject — inserción exitosa', () => {
  beforeEach(() => {
    mockAuthOk()
    mockCommunityFound()
  })
  afterEach(() => vi.clearAllMocks())

  it('devuelve success:true con projectId y projectSlug', async () => {
    const result = await launchProject(VALID_INPUT)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.projectId).toBe(MOCK_PROJECT.id)
      expect(result.projectSlug).toBe(MOCK_PROJECT.slug)
    }
  })

  it('inserta el proyecto con status "live"', async () => {
    const insertSpy = vi.fn().mockReturnThis()
    const selectSpy = vi.fn().mockReturnThis()
    const singleSpy = vi.fn().mockResolvedValue({ data: MOCK_PROJECT, error: null })

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'communities') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: MOCK_COMMUNITY, error: null }),
        }
      }
      if (table === 'projects') {
        return { insert: insertSpy, select: selectSpy, single: singleSpy }
      }
      return {}
    })

    await launchProject(VALID_INPUT)

    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'live',
        community_id: MOCK_COMMUNITY.id,
        builder_id: MOCK_USER.id,
        title: VALID_INPUT.title,
        slug: expect.any(String), // derivado de toSlug(input.title)
        image_urls: VALID_INPUT.imageUrls,
        feedback_topics: VALID_INPUT.feedbackTopics,
      })
    )
  })

  it('mapea imageUrls y feedbackTopics correctamente al insert', async () => {
    const insertSpy = vi.fn().mockReturnThis()
    const selectSpy = vi.fn().mockReturnThis()
    const singleSpy = vi.fn().mockResolvedValue({ data: MOCK_PROJECT, error: null })

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'communities') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: MOCK_COMMUNITY, error: null }),
        }
      }
      if (table === 'projects') {
        return { insert: insertSpy, select: selectSpy, single: singleSpy }
      }
      return {}
    })

    const inputConMedia = {
      ...VALID_INPUT,
      imageUrls: ['https://picsum.photos/200'],
      feedbackTopics: ['ux', 'product'],
    }

    await launchProject(inputConMedia)

    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        image_urls: ['https://picsum.photos/200'],
        feedback_topics: ['ux', 'product'],
      })
    )
  })

  it('llama a revalidatePath con la ruta de la comunidad', async () => {
    await launchProject(VALID_INPUT)
    expect(revalidatePath).toHaveBeenCalledWith(`/communities/${VALID_INPUT.communitySlug}`)
  })

  it('incluye targetUser y demoLink opcionales en el insert cuando se proporcionan', async () => {
    const insertSpy = vi.fn().mockReturnThis()
    const selectSpy = vi.fn().mockReturnThis()
    const singleSpy = vi.fn().mockResolvedValue({ data: MOCK_PROJECT, error: null })

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'communities') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: MOCK_COMMUNITY, error: null }),
        }
      }
      if (table === 'projects') {
        return { insert: insertSpy, select: selectSpy, single: singleSpy }
      }
      return {}
    })

    await launchProject({
      ...VALID_INPUT,
      targetUser: 'Emprendedores técnicos',
      demoLink: 'https://demo.example.com',
    })

    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        target_user: 'Emprendedores técnicos',
        demo_url: 'https://demo.example.com',
      })
    )
  })

  it('pasa null a target_user y demo_url cuando no se proporcionan opcionales', async () => {
    const insertSpy = vi.fn().mockReturnThis()
    const selectSpy = vi.fn().mockReturnThis()
    const singleSpy = vi.fn().mockResolvedValue({ data: MOCK_PROJECT, error: null })

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'communities') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: MOCK_COMMUNITY, error: null }),
        }
      }
      if (table === 'projects') {
        return { insert: insertSpy, select: selectSpy, single: singleSpy }
      }
      return {}
    })

    await launchProject(VALID_INPUT)

    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        target_user: null,
        demo_url: null,
      })
    )
  })
})
