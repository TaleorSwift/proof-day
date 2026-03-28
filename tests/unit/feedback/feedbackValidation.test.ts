/**
 * Tests unitarios — Story 4.2: Feedback Submission & Association
 * Validan la lógica de negocio pura (sin Supabase) relacionada con
 * las reglas de asociación de feedback.
 */

import { describe, it, expect } from 'vitest'

// ─── Lógica de validación pura (simula las reglas del API handler) ───────────

type ProjectStatus = 'draft' | 'live' | 'inactive'

interface Project {
  id: string
  builder_id: string
  status: ProjectStatus
  community_id: string
}

interface FeedbackRecord {
  id: string
  project_id: string
  reviewer_id: string
}

/**
 * Valida si un reviewer puede dar feedback a un proyecto.
 * Replica la lógica de POST /api/feedback sin dependencias externas.
 */
function validateFeedbackSubmission(params: {
  reviewerId: string
  project: Project
  existingFeedbacks: FeedbackRecord[]
  communityId: string
}): { valid: true } | { valid: false; code: string; message: string } {
  const { reviewerId, project, existingFeedbacks, communityId } = params

  // Proyecto debe estar live
  if (project.status !== 'live') {
    return {
      valid: false,
      code: 'PROJECT_NOT_LIVE',
      message: 'Solo se puede dar feedback en proyectos Live',
    }
  }

  // El builder no puede dar feedback en su propio proyecto
  if (project.builder_id === reviewerId) {
    return {
      valid: false,
      code: 'FEEDBACK_SELF_NOT_ALLOWED',
      message: 'No puedes dar feedback en tu propio proyecto',
    }
  }

  // La comunidad debe coincidir
  if (project.community_id !== communityId) {
    return {
      valid: false,
      code: 'COMMUNITY_MISMATCH',
      message: 'La comunidad indicada no corresponde al proyecto',
    }
  }

  // Reviewer no puede dar feedback dos veces en el mismo proyecto
  const alreadySubmitted = existingFeedbacks.some(
    (f) => f.project_id === project.id && f.reviewer_id === reviewerId
  )
  if (alreadySubmitted) {
    return {
      valid: false,
      code: 'FEEDBACK_ALREADY_SUBMITTED',
      message: 'Ya has dado feedback en este proyecto',
    }
  }

  return { valid: true }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

const VALID_UUID_1 = '00000000-0000-0000-0000-000000000001'
const VALID_UUID_2 = '00000000-0000-0000-0000-000000000002'
const VALID_UUID_3 = '00000000-0000-0000-0000-000000000003'
const VALID_UUID_4 = '00000000-0000-0000-0000-000000000004'

const liveProject: Project = {
  id: VALID_UUID_1,
  builder_id: VALID_UUID_2,
  status: 'live',
  community_id: VALID_UUID_3,
}

describe('validateFeedbackSubmission — reglas de asociacion', () => {
  // Test 1 (AC-3): El builder no puede dar feedback en su propio proyecto
  it('rechaza cuando el reviewer es el builder del proyecto', () => {
    const result = validateFeedbackSubmission({
      reviewerId: liveProject.builder_id, // mismo que builder_id
      project: liveProject,
      existingFeedbacks: [],
      communityId: liveProject.community_id,
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.code).toBe('FEEDBACK_SELF_NOT_ALLOWED')
    }
  })

  // Test 2 (AC-4): Proyectos en estado 'draft' son rechazados con PROJECT_NOT_LIVE
  it('rechaza feedback en proyecto con estado draft', () => {
    const draftProject: Project = { ...liveProject, status: 'draft' }

    const result = validateFeedbackSubmission({
      reviewerId: VALID_UUID_4,
      project: draftProject,
      existingFeedbacks: [],
      communityId: draftProject.community_id,
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.code).toBe('PROJECT_NOT_LIVE')
    }
  })

  // Test 3 (AC-4): Proyectos en estado 'inactive' son rechazados con PROJECT_NOT_LIVE
  it('rechaza feedback en proyecto con estado inactive', () => {
    const inactiveProject: Project = { ...liveProject, status: 'inactive' }

    const result = validateFeedbackSubmission({
      reviewerId: VALID_UUID_4,
      project: inactiveProject,
      existingFeedbacks: [],
      communityId: inactiveProject.community_id,
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.code).toBe('PROJECT_NOT_LIVE')
    }
  })

  // Test 4 (AC-2): Un reviewer solo puede dar feedback UNA vez por proyecto
  it('rechaza segundo feedback del mismo reviewer en el mismo proyecto', () => {
    const existingFeedback: FeedbackRecord = {
      id: 'fb-001',
      project_id: liveProject.id,
      reviewer_id: VALID_UUID_4,
    }

    const result = validateFeedbackSubmission({
      reviewerId: VALID_UUID_4,
      project: liveProject,
      existingFeedbacks: [existingFeedback],
      communityId: liveProject.community_id,
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.code).toBe('FEEDBACK_ALREADY_SUBMITTED')
    }
  })

  // Test 5: Caso válido — reviewer diferente al builder, proyecto live, sin feedback previo
  it('acepta feedback de reviewer valido en proyecto live sin feedback previo', () => {
    const result = validateFeedbackSubmission({
      reviewerId: VALID_UUID_4,
      project: liveProject,
      existingFeedbacks: [],
      communityId: liveProject.community_id,
    })

    expect(result.valid).toBe(true)
  })

  // Test 6: Comunidad incorrecta es rechazada
  it('rechaza feedback cuando la communityId no coincide con la del proyecto', () => {
    const result = validateFeedbackSubmission({
      reviewerId: VALID_UUID_4,
      project: liveProject,
      existingFeedbacks: [],
      communityId: 'ffffffff-ffff-ffff-ffff-ffffffffffff', // comunidad incorrecta
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.code).toBe('COMMUNITY_MISMATCH')
    }
  })

  // Test 7: El mismo reviewer puede dar feedback en distintos proyectos
  it('permite al reviewer dar feedback en proyectos distintos', () => {
    const otherProject: Project = {
      ...liveProject,
      id: VALID_UUID_2,
    }

    const feedbackInOtherProject: FeedbackRecord = {
      id: 'fb-002',
      project_id: VALID_UUID_2,
      reviewer_id: VALID_UUID_4,
    }

    // El feedback existente es en OTRO proyecto, este es en liveProject (VALID_UUID_1)
    const result = validateFeedbackSubmission({
      reviewerId: VALID_UUID_4,
      project: liveProject, // proyecto VALID_UUID_1
      existingFeedbacks: [feedbackInOtherProject], // feedback en VALID_UUID_2
      communityId: liveProject.community_id,
    })

    expect(result.valid).toBe(true)
  })

  // Test 8: La prioridad de validacion es status antes que self-feedback
  it('devuelve PROJECT_NOT_LIVE aunque el reviewer sea el builder (prioridad de status)', () => {
    const draftProject: Project = {
      ...liveProject,
      status: 'draft',
      builder_id: VALID_UUID_4,
    }

    const result = validateFeedbackSubmission({
      reviewerId: VALID_UUID_4, // es el builder
      project: draftProject,
      existingFeedbacks: [],
      communityId: draftProject.community_id,
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      // El status se valida primero en nuestra funcion
      expect(result.code).toBe('PROJECT_NOT_LIVE')
    }
  })
})
