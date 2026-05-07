// Story 13.2 — Tests TDD Outside-In: projectIterationsRepository
// Task 2 — Tests unitarios del repositorio

import { describe, it, expect, vi } from 'vitest'
import { createProjectIterationsRepository } from '@/lib/repositories/project-iterations.repository'
import type { ProjectIterationRow } from '@/lib/types/project-iterations'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const PROJECT_ID = 'project-uuid-001'

const MOCK_ROW: ProjectIterationRow = {
  id: 'iteration-uuid-001',
  project_id: PROJECT_ID,
  version_number: 1,
  title: 'Mi primera iteración',
  description: 'Descripción de la iteración',
  hypothesis: 'Hipótesis actualizada',
  published_at: '2026-05-07T10:00:00Z',
  created_at: '2026-05-07T10:00:00Z',
}

// ── Helpers de mock ───────────────────────────────────────────────────────────

function buildGetLatestMock(returnValue: { data: { version_number: number } | null; error: unknown }) {
  const singleMock = vi.fn().mockResolvedValue(returnValue)
  const orderMock = vi.fn().mockReturnValue({ limit: vi.fn().mockReturnValue({ single: singleMock }) })
  const eqMock = vi.fn().mockReturnValue({ order: orderMock })
  const selectMock = vi.fn().mockReturnValue({ eq: eqMock })
  const fromMock = vi.fn().mockReturnValue({ select: selectMock })

  return { from: fromMock, _spies: { singleMock, orderMock, eqMock, selectMock } }
}

function buildCreateMock(returnValue: { data: ProjectIterationRow | null; error: unknown }) {
  const singleMock = vi.fn().mockResolvedValue(returnValue)
  const selectMock = vi.fn().mockReturnValue({ single: singleMock })
  const insertMock = vi.fn().mockReturnValue({ select: selectMock })
  const fromMock = vi.fn().mockReturnValue({ insert: insertMock })

  return { from: fromMock, _spies: { singleMock, selectMock, insertMock } }
}

// ── Suite: getLatestVersionNumber ─────────────────────────────────────────────

describe('projectIterationsRepository.getLatestVersionNumber', () => {
  it('retorna 0 cuando no hay registros previos', async () => {
    const supabaseMock = buildGetLatestMock({ data: null, error: null })
    const repo = createProjectIterationsRepository(supabaseMock as never)

    const result = await repo.getLatestVersionNumber(PROJECT_ID)

    expect(result).toBe(0)
  })

  it('retorna el version_number máximo cuando hay registros', async () => {
    const supabaseMock = buildGetLatestMock({ data: { version_number: 3 }, error: null })
    const repo = createProjectIterationsRepository(supabaseMock as never)

    const result = await repo.getLatestVersionNumber(PROJECT_ID)

    expect(result).toBe(3)
  })

  it('filtra por project_id correctamente', async () => {
    const supabaseMock = buildGetLatestMock({ data: { version_number: 2 }, error: null })
    const repo = createProjectIterationsRepository(supabaseMock as never)

    await repo.getLatestVersionNumber(PROJECT_ID)

    expect(supabaseMock.from).toHaveBeenCalledWith('project_iterations')
    expect(supabaseMock._spies.eqMock).toHaveBeenCalledWith('project_id', PROJECT_ID)
  })
})

// ── Suite: create ─────────────────────────────────────────────────────────────

describe('projectIterationsRepository.create', () => {
  it('llama a supabase.from con los campos en snake_case correctos', async () => {
    const supabaseMock = buildCreateMock({ data: MOCK_ROW, error: null })
    const repo = createProjectIterationsRepository(supabaseMock as never)

    await repo.create({
      projectId: PROJECT_ID,
      versionNumber: 1,
      title: 'Mi primera iteración',
      description: 'Descripción de la iteración',
      hypothesis: 'Hipótesis actualizada',
    })

    expect(supabaseMock.from).toHaveBeenCalledWith('project_iterations')
    expect(supabaseMock._spies.insertMock).toHaveBeenCalledWith({
      project_id: PROJECT_ID,
      version_number: 1,
      title: 'Mi primera iteración',
      description: 'Descripción de la iteración',
      hypothesis: 'Hipótesis actualizada',
    })
  })

  it('retorna el objeto mapeado con projectIterationFromRow tras inserción exitosa', async () => {
    const supabaseMock = buildCreateMock({ data: MOCK_ROW, error: null })
    const repo = createProjectIterationsRepository(supabaseMock as never)

    const result = await repo.create({
      projectId: PROJECT_ID,
      versionNumber: 1,
      title: MOCK_ROW.title,
      description: MOCK_ROW.description,
      hypothesis: MOCK_ROW.hypothesis,
    })

    expect(result.data).not.toBeNull()
    expect(result.data?.id).toBe(MOCK_ROW.id)
    expect(result.data?.projectId).toBe(PROJECT_ID)
    expect(result.data?.versionNumber).toBe(1)
    expect(result.data?.title).toBe(MOCK_ROW.title)
  })

  it('retorna { data: null, error } cuando la inserción falla', async () => {
    const dbError = new Error('insert failed')
    const supabaseMock = buildCreateMock({ data: null, error: dbError })
    const repo = createProjectIterationsRepository(supabaseMock as never)

    const result = await repo.create({
      projectId: PROJECT_ID,
      versionNumber: 1,
      title: null,
      description: null,
      hypothesis: null,
    })

    expect(result.data).toBeNull()
    expect(result.error).toBe(dbError)
  })
})
