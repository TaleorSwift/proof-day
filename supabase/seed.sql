-- ============================================================
-- SEED DATA — datos de muestra para desarrollo local
-- Derivado de lib/mock/data.ts
-- ============================================================

-- ── Auth users ──────────────────────────────────────────────
-- El trigger on_auth_user_created (migration 010) auto-crea profiles vacíos
-- Contraseña de ambos usuarios: password123

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  created_at,
  updated_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000001',
    'authenticated',
    'authenticated',
    'demo@proofday.local',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    '', '', '', '',
    '2026-01-01T00:00:00Z',
    '2026-01-01T00:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000002',
    'authenticated',
    'authenticated',
    'sara@proofday.local',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    '', '', '', '',
    '2026-01-12T08:00:00Z',
    '2026-01-12T08:00:00Z'
  );

-- ── Auth identities ─────────────────────────────────────────
-- GoTrue necesita auth.identities para procesar OTP/magic link

INSERT INTO auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  (
    gen_random_uuid(),
    'demo@proofday.local',
    'a0000000-0000-4000-8000-000000000001',
    '{"sub":"a0000000-0000-4000-8000-000000000001","email":"demo@proofday.local","email_verified":true,"phone_verified":false}',
    'email',
    now(), now(), now()
  ),
  (
    gen_random_uuid(),
    'sara@proofday.local',
    'a0000000-0000-4000-8000-000000000002',
    '{"sub":"a0000000-0000-4000-8000-000000000002","email":"sara@proofday.local","email_verified":true,"phone_verified":false}',
    'email',
    now(), now(), now()
  );

-- ── Profiles ─────────────────────────────────────────────────
-- El trigger crea filas vacías; actualizamos con datos reales

UPDATE profiles SET
  name       = 'Demo User',
  bio        = 'Product builder apasionado por la validación rápida de ideas.',
  interests  = ARRAY['product', 'design', 'startups'],
  updated_at = '2026-01-01T00:00:00Z'
WHERE id = 'a0000000-0000-4000-8000-000000000001';

UPDATE profiles SET
  name       = 'Sara Medina',
  bio        = 'Engineering manager con enfoque en team health.',
  interests  = ARRAY['engineering', 'teams', 'remote-work'],
  updated_at = '2026-01-12T08:00:00Z'
WHERE id = 'a0000000-0000-4000-8000-000000000002';

-- ── Communities ──────────────────────────────────────────────

INSERT INTO communities (id, name, slug, description, created_by, created_at) VALUES
  (
    'b0000000-0000-4000-8000-000000000001',
    'Producto Alpha',
    'producto-alpha',
    'Comunidad de validación del equipo de producto',
    'a0000000-0000-4000-8000-000000000001',
    '2026-01-10T10:00:00Z'
  ),
  (
    'b0000000-0000-4000-8000-000000000002',
    'Startup Lab',
    'startup-lab',
    'Ideas en validación temprana',
    'a0000000-0000-4000-8000-000000000001',
    '2026-02-01T09:00:00Z'
  );

-- ── Community members ────────────────────────────────────────

INSERT INTO community_members (id, community_id, user_id, role, joined_at) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'admin',  '2026-01-10T10:00:00Z'),
  ('d0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'member', '2026-02-01T09:00:00Z'),
  ('d0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'member', '2026-01-12T08:00:00Z');

-- ── Projects ─────────────────────────────────────────────────

INSERT INTO projects (id, community_id, builder_id, title, problem, solution, hypothesis, image_urls, status, decision, created_at, updated_at) VALUES
  (
    'c0000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'PulseCheck',
    'Los equipos remotos no detectan el burnout a tiempo.',
    'Una encuesta semanal de pulso con visualización de tendencias para managers.',
    'Si los managers ven tendencias de ánimo semanalmente, intervendrán 2x más rápido en caídas de moral.',
    '{}',
    'live',
    NULL,
    '2026-02-10T10:00:00Z',
    '2026-02-15T12:00:00Z'
  ),
  (
    'c0000000-0000-4000-8000-000000000002',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'DocBridge',
    'El conocimiento tribal se pierde cuando alguien sale del equipo.',
    'Auto-generar documentación desde hilos de Slack con IA.',
    'Si el onboarding se documenta automáticamente, la curva de aprendizaje de nuevos empleados baja un 40%.',
    '{}',
    'draft',
    NULL,
    '2026-03-01T08:00:00Z',
    '2026-03-01T08:00:00Z'
  ),
  (
    'c0000000-0000-4000-8000-000000000003',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000002',
    'Carbon Ledger',
    'Los equipos de ingeniería no tienen visibilidad del impacto ambiental de su infra.',
    'Dashboard de emisiones CO2 integrado con AWS, GCP y Azure.',
    'Con visibilidad de emisiones en tiempo real, los equipos optimizan recursos un 20% más.',
    '{}',
    'live',
    NULL,
    '2026-02-20T11:00:00Z',
    '2026-03-20T15:00:00Z'
  );

-- ── Feedbacks ────────────────────────────────────────────────

INSERT INTO feedbacks (id, project_id, community_id, reviewer_id, scores, text_responses, created_at) VALUES
  (
    'e0000000-0000-4000-8000-000000000001',
    'c0000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000002',
    '{"p1": "yes", "p2": "yes", "p3": "maybe"}',
    '{"p1": null, "p2": null, "p3": null, "p4": "Integración con Slack sería clave para la adopción."}',
    '2026-02-20T14:00:00Z'
  );

-- ── Invitation links ─────────────────────────────────────────

INSERT INTO invitation_links (id, token, community_id, created_by, created_at) VALUES
  (
    'f0000000-0000-4000-8000-000000000001',
    'mock-invite-token-abc123',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    '2026-01-15T10:00:00Z'
  );
