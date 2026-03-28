/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================
// MOCK DATA — datos de muestra para desarrollo local sin Supabase
// IDs son UUIDs válidos para pasar validación Zod
// ============================================================

// ── IDs estáticos (exportados para usarlos en tests y referencias) ──
export const MOCK_USER_ID    = '00000000-0000-0000-0000-000000000001'
export const MOCK_USER_2_ID  = '00000000-0000-0000-0000-000000000002'
export const MOCK_COMM_1_ID  = '00000000-0000-0000-1000-000000000001'
export const MOCK_COMM_2_ID  = '00000000-0000-0000-1000-000000000002'
export const MOCK_PROJ_1_ID  = '00000000-0000-0000-2000-000000000001'
export const MOCK_PROJ_2_ID  = '00000000-0000-0000-2000-000000000002'
export const MOCK_PROJ_3_ID  = '00000000-0000-0000-2000-000000000003'

export const MOCK_USER = {
  id: MOCK_USER_ID,
  email: 'demo@proofday.local',
  created_at: '2026-01-01T00:00:00Z',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated',
}

export const MOCK_DB: Record<string, any[]> = {
  communities: [
    {
      id: MOCK_COMM_1_ID,
      name: 'Producto Alpha',
      slug: 'producto-alpha',
      description: 'Comunidad de validación del equipo de producto',
      created_by: MOCK_USER_ID,
      created_at: '2026-01-10T10:00:00Z',
    },
    {
      id: MOCK_COMM_2_ID,
      name: 'Startup Lab',
      slug: 'startup-lab',
      description: 'Ideas en validación temprana',
      created_by: MOCK_USER_ID,
      created_at: '2026-02-01T09:00:00Z',
    },
  ],

  community_members: [
    { id: '00000000-0000-0000-3000-000000000001', community_id: MOCK_COMM_1_ID, user_id: MOCK_USER_ID,   role: 'admin',  joined_at: '2026-01-10T10:00:00Z' },
    { id: '00000000-0000-0000-3000-000000000002', community_id: MOCK_COMM_2_ID, user_id: MOCK_USER_ID,   role: 'member', joined_at: '2026-02-01T09:00:00Z' },
    { id: '00000000-0000-0000-3000-000000000003', community_id: MOCK_COMM_1_ID, user_id: MOCK_USER_2_ID, role: 'member', joined_at: '2026-01-12T08:00:00Z' },
  ],

  projects: [
    {
      id: MOCK_PROJ_1_ID,
      community_id: MOCK_COMM_1_ID,
      builder_id: MOCK_USER_ID,
      name: 'PulseCheck',
      tagline: 'Seguimiento anónimo del estado del equipo cada semana',
      problem: 'Los equipos remotos no detectan el burnout a tiempo.',
      solution: 'Una encuesta semanal de pulso con visualización de tendencias para managers.',
      target_user: 'Managers de ingeniería con 5+ reportes remotos.',
      hypothesis: 'Si los managers ven tendencias de ánimo semanalmente, intervendrán 2x más rápido en caídas de moral.',
      status: 'live',
      decision: null,
      decided_at: null,
      image_urls: [],
      created_at: '2026-02-10T10:00:00Z',
      updated_at: '2026-02-15T12:00:00Z',
    },
    {
      id: MOCK_PROJ_2_ID,
      community_id: MOCK_COMM_1_ID,
      builder_id: MOCK_USER_ID,
      name: 'DocBridge',
      tagline: 'Genera onboarding docs desde conversaciones de Slack',
      problem: 'El conocimiento tribal se pierde cuando alguien sale del equipo.',
      solution: 'Auto-generar documentación desde hilos de Slack con IA.',
      target_user: 'CTOs de startups de 10-50 personas.',
      hypothesis: 'Si el onboarding se documenta automáticamente, la curva de aprendizaje de nuevos empleados baja un 40%.',
      status: 'draft',
      decision: null,
      decided_at: null,
      image_urls: [],
      created_at: '2026-03-01T08:00:00Z',
      updated_at: '2026-03-01T08:00:00Z',
    },
    {
      id: MOCK_PROJ_3_ID,
      community_id: MOCK_COMM_1_ID,
      builder_id: MOCK_USER_2_ID,
      name: 'Carbon Ledger',
      tagline: 'Rastrea la huella de carbono de tu infraestructura cloud',
      problem: 'Los equipos de ingeniería no tienen visibilidad del impacto ambiental de su infra.',
      solution: 'Dashboard de emisiones CO2 integrado con AWS, GCP y Azure.',
      target_user: 'Engineering leads en empresas con objetivos ESG.',
      hypothesis: 'Con visibilidad de emisiones en tiempo real, los equipos optimizan recursos un 20% más.',
      status: 'live',
      decision: null,
      decided_at: null,
      image_urls: [],
      created_at: '2026-02-20T11:00:00Z',
      updated_at: '2026-03-20T15:00:00Z',
    },
  ],

  feedbacks: [
    {
      id: '00000000-0000-0000-4000-000000000001',
      project_id: MOCK_PROJ_1_ID,
      community_id: MOCK_COMM_1_ID,
      reviewer_id: MOCK_USER_2_ID,
      understands_problem: 5,
      would_use: 4,
      relevance: 4,
      suggestion: 'Integración con Slack sería clave para la adopción.',
      created_at: '2026-02-20T14:00:00Z',
    },
  ],

  profiles: [
    {
      id: MOCK_USER_ID,
      name: 'Demo User',
      bio: 'Product builder apasionado por la validación rápida de ideas.',
      interests: ['product', 'design', 'startups'],
      avatar_url: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    {
      id: MOCK_USER_2_ID,
      name: 'Sara Medina',
      bio: 'Engineering manager con enfoque en team health.',
      interests: ['engineering', 'teams', 'remote-work'],
      avatar_url: null,
      created_at: '2026-01-12T08:00:00Z',
      updated_at: '2026-01-12T08:00:00Z',
    },
  ],

  invitation_links: [
    {
      id: '00000000-0000-0000-5000-000000000001',
      community_id: MOCK_COMM_1_ID,
      token: 'mock-invite-token-abc123',
      created_by: MOCK_USER_ID,
      expires_at: '2027-01-01T00:00:00Z',
      max_uses: null,
      use_count: 2,
      created_at: '2026-01-15T10:00:00Z',
    },
  ],
}
