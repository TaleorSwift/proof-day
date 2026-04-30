import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCommunitiesRepository } from '@/lib/repositories/communities.repository'
import { createFeedbackRepository } from '@/lib/repositories/feedback.repository'
import { createGamificationRepository } from '@/lib/repositories/gamification.repository'
import { createProfilesRepository } from '@/lib/repositories/profiles.repository'
import { createProjectsRepository } from '@/lib/repositories/projects.repository'

// ---------------------------------------------------------------------------
// Builder de mock Supabase fluent API
// Los métodos encadenados (from→select→eq→...) retornan el mismo mock
// para permitir encadenamiento arbitrario.
// ---------------------------------------------------------------------------

function buildSupabaseMock() {
  const chain: Record<string, unknown> = {}

  const fluent = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    limit: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    // count queries
    then: undefined as unknown,
  }

  // Permitir await directo en el chain (Promise-like)
  Object.assign(fluent, {
    then: (resolve: (v: { data: unknown; error: null; count: number | null }) => void) =>
      Promise.resolve({ data: [], error: null, count: 0 }).then(resolve),
  })

  const fromMock = vi.fn().mockReturnValue(fluent)

  const supabase = { from: fromMock, _fluent: fluent }
  return { supabase, fromMock, fluent }
}

// ---------------------------------------------------------------------------
// Suite: CommunitiesRepository
// ---------------------------------------------------------------------------

describe('CommunitiesRepository', () => {
  let supabase: ReturnType<typeof buildSupabaseMock>['supabase']
  let fromMock: ReturnType<typeof buildSupabaseMock>['fromMock']
  let fluent: ReturnType<typeof buildSupabaseMock>['fluent']

  beforeEach(() => {
    const mocks = buildSupabaseMock()
    supabase = mocks.supabase
    fromMock = mocks.fromMock
    fluent = mocks.fluent
  })

  it('findByUserId — llama a from("communities") y filtra por userId', async () => {
    const repo = createCommunitiesRepository(supabase as never)

    await repo.findByUserId('user-001')

    expect(fromMock).toHaveBeenCalledWith('communities')
    expect(fluent.eq).toHaveBeenCalledWith('community_members.user_id', 'user-001')
  })

  it('getMemberCounts — llama a from("community_members") con .in()', async () => {
    const repo = createCommunitiesRepository(supabase as never)

    await repo.getMemberCounts(['c1', 'c2'])

    expect(fromMock).toHaveBeenCalledWith('community_members')
    expect(fluent.in).toHaveBeenCalledWith('community_id', ['c1', 'c2'])
  })

  it('findBySlug — llama a from("communities") y eq("slug", slug)', async () => {
    const repo = createCommunitiesRepository(supabase as never)

    await repo.findBySlug('startup-madrid')

    expect(fromMock).toHaveBeenCalledWith('communities')
    expect(fluent.eq).toHaveBeenCalledWith('slug', 'startup-madrid')
  })

  it('create — llama a from("communities").insert() con los campos correctos', async () => {
    const repo = createCommunitiesRepository(supabase as never)
    const data = {
      name: 'Test', slug: 'test', description: 'Desc',
      imageUrl: null, createdBy: 'user-001',
    }

    await repo.create(data)

    expect(fromMock).toHaveBeenCalledWith('communities')
    expect(fluent.insert).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test', slug: 'test', created_by: 'user-001' })
    )
  })

  it('addMember — llama a from("community_members").insert() con role', async () => {
    const repo = createCommunitiesRepository(supabase as never)

    await repo.addMember('c1', 'u1', 'admin')

    expect(fromMock).toHaveBeenCalledWith('community_members')
    expect(fluent.insert).toHaveBeenCalledWith(
      expect.objectContaining({ community_id: 'c1', user_id: 'u1', role: 'admin' })
    )
  })

  it('checkMembership — llama a from("community_members") con dos eq()', async () => {
    const repo = createCommunitiesRepository(supabase as never)

    await repo.checkMembership('c1', 'u1')

    expect(fromMock).toHaveBeenCalledWith('community_members')
    expect(fluent.eq).toHaveBeenCalledWith('community_id', 'c1')
    expect(fluent.eq).toHaveBeenCalledWith('user_id', 'u1')
  })
})

// ---------------------------------------------------------------------------
// Suite: FeedbackRepository
// ---------------------------------------------------------------------------

describe('FeedbackRepository', () => {
  let supabase: ReturnType<typeof buildSupabaseMock>['supabase']
  let fromMock: ReturnType<typeof buildSupabaseMock>['fromMock']
  let fluent: ReturnType<typeof buildSupabaseMock>['fluent']

  beforeEach(() => {
    const mocks = buildSupabaseMock()
    supabase = mocks.supabase
    fromMock = mocks.fromMock
    fluent = mocks.fluent
  })

  it('findByProject — llama a from("feedbacks") y filtra por project_id', async () => {
    const repo = createFeedbackRepository(supabase as never)

    await repo.findByProject('project-001')

    expect(fromMock).toHaveBeenCalledWith('feedbacks')
    expect(fluent.eq).toHaveBeenCalledWith('project_id', 'project-001')
  })

  it('findByProjectBasic — filtra por project_id (sin join profiles)', async () => {
    const repo = createFeedbackRepository(supabase as never)

    await repo.findByProjectBasic('project-001')

    expect(fromMock).toHaveBeenCalledWith('feedbacks')
    expect(fluent.eq).toHaveBeenCalledWith('project_id', 'project-001')
  })

  it('checkDuplicate — filtra por project_id y reviewer_id', async () => {
    const repo = createFeedbackRepository(supabase as never)

    await repo.checkDuplicate('project-001', 'user-001')

    expect(fluent.eq).toHaveBeenCalledWith('project_id', 'project-001')
    expect(fluent.eq).toHaveBeenCalledWith('reviewer_id', 'user-001')
  })

  it('create — inserta en feedbacks con los campos correctos', async () => {
    const repo = createFeedbackRepository(supabase as never)
    const data = {
      projectId: 'p1', reviewerId: 'u1', communityId: 'c1',
      scores: { p1: 3 } as Record<string, number>,
      textResponses: { p4: 'Texto' } as Record<string, string>,
    }

    await repo.create(data)

    expect(fluent.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        project_id: 'p1', reviewer_id: 'u1', community_id: 'c1',
      })
    )
  })

  it('findWeeklyByCommunity — filtra por community_id y gte created_at', async () => {
    const repo = createFeedbackRepository(supabase as never)
    const weekStart = new Date('2024-01-01T00:00:00Z')

    await repo.findWeeklyByCommunity('c1', weekStart)

    expect(fluent.eq).toHaveBeenCalledWith('community_id', 'c1')
    expect(fluent.gte).toHaveBeenCalledWith('created_at', weekStart.toISOString())
  })
})

// ---------------------------------------------------------------------------
// Suite: GamificationRepository
// ---------------------------------------------------------------------------

describe('GamificationRepository', () => {
  let supabase: ReturnType<typeof buildSupabaseMock>['supabase']
  let fromMock: ReturnType<typeof buildSupabaseMock>['fromMock']
  let fluent: ReturnType<typeof buildSupabaseMock>['fluent']

  beforeEach(() => {
    const mocks = buildSupabaseMock()
    supabase = mocks.supabase
    fromMock = mocks.fromMock
    fluent = mocks.fluent
  })

  it('getWeeklyFeedbacks — filtra por communityId y created_at >= weekStart', async () => {
    const repo = createGamificationRepository(supabase as never)
    const weekStart = new Date('2024-01-01T00:00:00Z')

    await repo.getWeeklyFeedbacks('c1', weekStart)

    expect(fromMock).toHaveBeenCalledWith('feedbacks')
    expect(fluent.eq).toHaveBeenCalledWith('community_id', 'c1')
    expect(fluent.gte).toHaveBeenCalledWith('created_at', weekStart.toISOString())
  })

  it('getFeedbackCountByReviewer — filtra por communityId y reviewerId', async () => {
    const repo = createGamificationRepository(supabase as never)

    await repo.getFeedbackCountByReviewer('c1', 'u1')

    expect(fluent.eq).toHaveBeenCalledWith('community_id', 'c1')
    expect(fluent.eq).toHaveBeenCalledWith('reviewer_id', 'u1')
  })

  it('getAllFeedbacksByCommunity — filtra por communityId', async () => {
    const repo = createGamificationRepository(supabase as never)

    await repo.getAllFeedbacksByCommunity('c1')

    expect(fromMock).toHaveBeenCalledWith('feedbacks')
    expect(fluent.eq).toHaveBeenCalledWith('community_id', 'c1')
  })
})

// ---------------------------------------------------------------------------
// Suite: ProfilesRepository
// ---------------------------------------------------------------------------

describe('ProfilesRepository', () => {
  let supabase: ReturnType<typeof buildSupabaseMock>['supabase']
  let fromMock: ReturnType<typeof buildSupabaseMock>['fromMock']
  let fluent: ReturnType<typeof buildSupabaseMock>['fluent']

  beforeEach(() => {
    const mocks = buildSupabaseMock()
    supabase = mocks.supabase
    fromMock = mocks.fromMock
    fluent = mocks.fluent
  })

  it('findById — llama a from("profiles") y eq("id", id)', async () => {
    const repo = createProfilesRepository(supabase as never)

    await repo.findById('user-001')

    expect(fromMock).toHaveBeenCalledWith('profiles')
    expect(fluent.eq).toHaveBeenCalledWith('id', 'user-001')
  })

  it('findByIdForWidget — llama a from("profiles") con select reducido', async () => {
    const repo = createProfilesRepository(supabase as never)

    await repo.findByIdForWidget('user-001')

    expect(fromMock).toHaveBeenCalledWith('profiles')
    expect(fluent.eq).toHaveBeenCalledWith('id', 'user-001')
  })

  it('update — llama a from("profiles").update().eq(id)', async () => {
    const repo = createProfilesRepository(supabase as never)

    await repo.update('user-001', { name: 'Nuevo nombre' })

    expect(fromMock).toHaveBeenCalledWith('profiles')
    expect(fluent.update).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Nuevo nombre' })
    )
    expect(fluent.eq).toHaveBeenCalledWith('id', 'user-001')
  })

  it('update — incluye updated_at en el payload', async () => {
    const repo = createProfilesRepository(supabase as never)

    await repo.update('user-001', { bio: 'Mi bio' })

    const [[payload]] = (fluent.update as ReturnType<typeof vi.fn>).mock.calls
    expect(payload).toHaveProperty('updated_at')
    expect(typeof payload.updated_at).toBe('string')
  })

  it('update — no incluye campos undefined en el payload', async () => {
    const repo = createProfilesRepository(supabase as never)

    await repo.update('user-001', {})

    const [[payload]] = (fluent.update as ReturnType<typeof vi.fn>).mock.calls
    expect('name' in payload).toBe(false)
    expect('bio' in payload).toBe(false)
    expect('interests' in payload).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Suite: ProjectsRepository
// ---------------------------------------------------------------------------

describe('ProjectsRepository', () => {
  let supabase: ReturnType<typeof buildSupabaseMock>['supabase']
  let fromMock: ReturnType<typeof buildSupabaseMock>['fromMock']
  let fluent: ReturnType<typeof buildSupabaseMock>['fluent']

  beforeEach(() => {
    const mocks = buildSupabaseMock()
    supabase = mocks.supabase
    fromMock = mocks.fromMock
    fluent = mocks.fluent
  })

  it('findByCommunity — filtra por community_id y ordena por created_at desc', async () => {
    const repo = createProjectsRepository(supabase as never)

    await repo.findByCommunity('c1')

    expect(fromMock).toHaveBeenCalledWith('projects')
    expect(fluent.eq).toHaveBeenCalledWith('community_id', 'c1')
    expect(fluent.order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('findById — llama a from("projects") y eq("id", projectId)', async () => {
    const repo = createProjectsRepository(supabase as never)

    await repo.findById('p1')

    expect(fromMock).toHaveBeenCalledWith('projects')
    expect(fluent.eq).toHaveBeenCalledWith('id', 'p1')
  })

  it('create — inserta con status "draft"', async () => {
    const repo = createProjectsRepository(supabase as never)
    const data = {
      communityId: 'c1', builderId: 'u1', slug: 'mi-proyecto',
      title: 'Mi Proyecto', problem: 'Un problema', solution: 'Una solución',
      hypothesis: 'Mi hipótesis', imageUrls: [],
    }

    await repo.create(data)

    expect(fluent.insert).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'draft' })
    )
  })

  it('create — mapea los campos a snake_case correctamente', async () => {
    const repo = createProjectsRepository(supabase as never)

    await repo.create({
      communityId: 'c1', builderId: 'u1', slug: 'mi-proyecto',
      title: 'Mi Proyecto', problem: 'Problema', solution: 'Solución',
      hypothesis: 'Hipótesis', imageUrls: ['img.jpg'],
    })

    expect(fluent.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        community_id: 'c1', builder_id: 'u1', image_urls: ['img.jpg'],
      })
    )
  })

  it('countByBuilder — filtra por builder_id', async () => {
    const repo = createProjectsRepository(supabase as never)

    await repo.countByBuilder('u1')

    expect(fromMock).toHaveBeenCalledWith('projects')
    expect(fluent.eq).toHaveBeenCalledWith('builder_id', 'u1')
  })
})
