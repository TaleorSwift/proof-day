-- ============================================================
-- SEED DATA — datos de muestra para desarrollo local
-- Sincronizado con lib/fixtures/ — 6 usuarios, 9 proyectos, 12 feedbacks
-- ============================================================

-- ── Auth users ──────────────────────────────────────────────
-- El trigger on_auth_user_created (migration 010) auto-crea profiles vacíos

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  created_at, updated_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000001',
    'authenticated', 'authenticated', 'demo@proofday.local',
    crypt('password123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    '', '', '', '',
    '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000002',
    'authenticated', 'authenticated', 'sara@proofday.local',
    crypt('password123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    '', '', '', '',
    '2026-01-12T08:00:00Z', '2026-01-12T08:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000003',
    'authenticated', 'authenticated', 'tom@proofday.local',
    crypt('password123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    '', '', '', '',
    '2026-01-15T10:00:00Z', '2026-01-15T10:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000004',
    'authenticated', 'authenticated', 'ava@proofday.local',
    crypt('password123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    '', '', '', '',
    '2026-01-20T09:00:00Z', '2026-01-20T09:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000005',
    'authenticated', 'authenticated', 'kai@proofday.local',
    crypt('password123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    '', '', '', '',
    '2026-01-25T11:00:00Z', '2026-01-25T11:00:00Z'
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-4000-8000-000000000006',
    'authenticated', 'authenticated', 'priya@proofday.local',
    crypt('password123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    '', '', '', '',
    '2026-02-01T08:00:00Z', '2026-02-01T08:00:00Z'
  );

-- ── Auth identities ─────────────────────────────────────────
-- GoTrue necesita auth.identities para procesar OTP/magic link

INSERT INTO auth.identities (
  id, provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES
  (
    gen_random_uuid(), 'demo@proofday.local',
    'a0000000-0000-4000-8000-000000000001',
    '{"sub":"a0000000-0000-4000-8000-000000000001","email":"demo@proofday.local","email_verified":true,"phone_verified":false}',
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(), 'sara@proofday.local',
    'a0000000-0000-4000-8000-000000000002',
    '{"sub":"a0000000-0000-4000-8000-000000000002","email":"sara@proofday.local","email_verified":true,"phone_verified":false}',
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(), 'tom@proofday.local',
    'a0000000-0000-4000-8000-000000000003',
    '{"sub":"a0000000-0000-4000-8000-000000000003","email":"tom@proofday.local","email_verified":true,"phone_verified":false}',
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(), 'ava@proofday.local',
    'a0000000-0000-4000-8000-000000000004',
    '{"sub":"a0000000-0000-4000-8000-000000000004","email":"ava@proofday.local","email_verified":true,"phone_verified":false}',
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(), 'kai@proofday.local',
    'a0000000-0000-4000-8000-000000000005',
    '{"sub":"a0000000-0000-4000-8000-000000000005","email":"kai@proofday.local","email_verified":true,"phone_verified":false}',
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(), 'priya@proofday.local',
    'a0000000-0000-4000-8000-000000000006',
    '{"sub":"a0000000-0000-4000-8000-000000000006","email":"priya@proofday.local","email_verified":true,"phone_verified":false}',
    'email', now(), now(), now()
  );

-- ── Profiles ─────────────────────────────────────────────────
-- El trigger crea filas vacías; actualizamos con datos reales

UPDATE profiles SET
  name       = 'Alex Rivera',
  bio        = 'Product builder focused on team tools and async collaboration.',
  interests  = ARRAY['product', 'remote-work', 'saas'],
  updated_at = '2026-01-01T00:00:00Z'
WHERE id = 'a0000000-0000-4000-8000-000000000001';

UPDATE profiles SET
  name       = 'Sara Medina',
  bio        = 'Engineering manager with focus on team health and sustainable practices.',
  interests  = ARRAY['engineering', 'teams', 'remote-work'],
  updated_at = '2026-01-12T08:00:00Z'
WHERE id = 'a0000000-0000-4000-8000-000000000002';

UPDATE profiles SET
  name       = 'Tom Eriksen',
  bio        = 'Platform engineer passionate about sustainability and cloud efficiency.',
  interests  = ARRAY['platform-eng', 'sustainability', 'cloud'],
  updated_at = '2026-01-15T10:00:00Z'
WHERE id = 'a0000000-0000-4000-8000-000000000003';

UPDATE profiles SET
  name       = 'Ava Chen',
  bio        = 'Scrum master and agile coach helping teams improve their retrospectives.',
  interests  = ARRAY['agile', 'retrospectives', 'team-dynamics'],
  updated_at = '2026-01-20T09:00:00Z'
WHERE id = 'a0000000-0000-4000-8000-000000000004';

UPDATE profiles SET
  name       = 'Kai Nakamura',
  bio        = 'UX researcher exploring validation methods for early-stage products.',
  interests  = ARRAY['ux-research', 'validation', 'user-testing'],
  updated_at = '2026-01-25T11:00:00Z'
WHERE id = 'a0000000-0000-4000-8000-000000000005';

UPDATE profiles SET
  name       = 'Priya Sharma',
  bio        = 'Data scientist turned product builder obsessed with growth metrics.',
  interests  = ARRAY['data-science', 'product', 'analytics'],
  updated_at = '2026-02-01T08:00:00Z'
WHERE id = 'a0000000-0000-4000-8000-000000000006';

-- ── Communities ──────────────────────────────────────────────

INSERT INTO communities (id, name, slug, description, created_by, created_at, updated_at) VALUES
  (
    'b0000000-0000-4000-8000-000000000001',
    'Producto Alpha', 'producto-alpha',
    'Comunidad de validación del equipo de producto. Ideas en estado temprano, feedback rápido.',
    'a0000000-0000-4000-8000-000000000001',
    '2026-01-10T10:00:00Z', '2026-01-10T10:00:00Z'
  ),
  (
    'b0000000-0000-4000-8000-000000000002',
    'Startup Lab', 'startup-lab',
    'Ideas en validación temprana para fundadores en etapa pre-seed.',
    'a0000000-0000-4000-8000-000000000002',
    '2026-02-01T09:00:00Z', '2026-02-01T09:00:00Z'
  ),
  (
    'b0000000-0000-4000-8000-000000000003',
    'Empty Space', 'empty-space',
    'Comunidad recién creada, sin proyectos todavía.',
    'a0000000-0000-4000-8000-000000000001',
    '2026-04-01T00:00:00Z', '2026-04-01T00:00:00Z'
  );

-- ── Community members ────────────────────────────────────────
-- Producto Alpha (5): Alex admin, Sara, Tom, Ava, Kai
-- Startup Lab (3): Sara admin, Alex, Priya
-- Empty Space (1): Alex admin

INSERT INTO community_members (id, community_id, user_id, role, joined_at) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'admin',  '2026-01-10T10:00:00Z'),
  ('d0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'member', '2026-01-12T08:00:00Z'),
  ('d0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', 'member', '2026-01-15T10:00:00Z'),
  ('d0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000004', 'member', '2026-01-20T09:00:00Z'),
  ('d0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000005', 'member', '2026-01-25T11:00:00Z'),
  ('d0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'admin',  '2026-02-01T09:00:00Z'),
  ('d0000000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'member', '2026-02-05T10:00:00Z'),
  ('d0000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000006', 'member', '2026-02-10T11:00:00Z'),
  ('d0000000-0000-4000-8000-000000000009', 'b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'admin',  '2026-04-01T00:00:00Z');

-- ── Projects ─────────────────────────────────────────────────
-- would_use_count se recalcula automáticamente por el trigger tras insertar feedbacks

INSERT INTO projects (
  id, community_id, builder_id, slug, title, tagline,
  problem, solution, hypothesis,
  target_user, demo_url, feedback_topics,
  image_urls, status, decision, decided_at,
  created_at, updated_at
) VALUES
  -- Producto Alpha
  (
    'c0000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'pulse-check',
    'Pulse Check',
    'Anonymous weekly mood tracking for distributed teams',
    'Remote teams struggle to surface burnout and morale issues before they escalate.',
    'A lightweight weekly pulse survey with trend visualization for team leads.',
    'If team leads see mood trends weekly, they will intervene 2x faster on morale dips.',
    'Engineering managers with 5+ remote reports',
    'https://example.com/pulse-demo',
    ARRAY['Problem clarity', 'Willingness to use', 'Missing features'],
    ARRAY['https://picsum.photos/seed/pulse-check-1/800/600'], 'live', NULL, NULL,
    '2026-03-20T10:00:00Z', '2026-03-20T10:00:00Z'
  ),
  (
    'c0000000-0000-4000-8000-000000000002',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000002',
    'docbridge',
    'DocBridge',
    'Auto-generate onboarding docs from Slack conversations',
    'New hires spend weeks piecing together tribal knowledge scattered across Slack.',
    'ML-powered extraction of key decisions and processes from Slack history into structured docs.',
    'Auto-generated docs will reduce onboarding time-to-productivity by 30%.',
    'People Ops teams at companies with 50–200 employees',
    NULL,
    ARRAY['Onboarding speed', 'AI accuracy', 'Integration needs'],
    ARRAY['https://picsum.photos/seed/doc-bridge-1/800/600'], 'live', NULL, NULL,
    '2026-03-19T08:00:00Z', '2026-03-19T08:00:00Z'
  ),
  (
    'c0000000-0000-4000-8000-000000000003',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000003',
    'carbon-ledger',
    'Carbon Ledger',
    'Track your team''s carbon footprint from cloud infrastructure',
    'Engineering teams have no visibility into the environmental cost of their cloud usage.',
    'Dashboard that maps AWS/GCP spend to estimated CO₂ output with reduction suggestions.',
    'Visibility into carbon cost will drive 15% infrastructure optimization within 3 months.',
    'Platform engineering teams at sustainability-conscious companies',
    NULL,
    ARRAY['Carbon accuracy', 'Cloud coverage', 'Action suggestions'],
    '{}', 'live', NULL, NULL,
    '2026-03-18T15:00:00Z', '2026-03-18T15:00:00Z'
  ),
  (
    'c0000000-0000-4000-8000-000000000004',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000004',
    'retro-replay',
    'Retro Replay',
    'AI-powered summaries of sprint retrospectives with action tracking',
    'Retro action items get lost and the same issues resurface every sprint.',
    'Record retros, auto-summarize themes, and track action item completion across sprints.',
    'Tracked action items will have 2x higher completion rate than untracked ones.',
    'Scrum masters and agile coaches',
    NULL,
    ARRAY['Summary quality', 'Action tracking', 'Integrations'],
    ARRAY['https://picsum.photos/seed/retro-replay-1/800/600'], 'inactive', 'abandon', '2026-03-25T10:00:00Z',
    '2026-03-15T10:00:00Z', '2026-03-25T10:00:00Z'
  ),
  (
    'c0000000-0000-4000-8000-000000000005',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    'idea-sketch',
    'Idea Sketch',
    NULL,
    '', '', '',
    NULL, NULL, NULL,
    '{}', 'draft', NULL, NULL,
    '2026-04-01T09:00:00Z', '2026-04-01T09:00:00Z'
  ),
  -- Startup Lab
  (
    'c0000000-0000-4000-8000-000000000006',
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000005',
    'iterate-labs',
    'Iterate Labs',
    'Rapid prototype testing for indie hackers',
    'Indie hackers waste weeks building features users did not ask for.',
    'A rapid prototype testing platform that validates features before they are built.',
    'Prototype testing will save an average of 3 weeks per feature cycle.',
    'Solo founders and small indie teams (1–3 people)',
    'https://example.com/iterate-demo',
    ARRAY['UX flow', 'Performance', 'Pricing'],
    ARRAY['https://picsum.photos/seed/iterate-labs-1/800/600', 'https://picsum.photos/seed/iterate-labs-2/800/600'], 'live', 'iterate', '2026-03-28T14:00:00Z',
    '2026-03-10T10:00:00Z', '2026-03-28T14:00:00Z'
  ),
  (
    'c0000000-0000-4000-8000-000000000007',
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000006',
    'scale-engine',
    'Scale Engine',
    'Auto-scaling infrastructure optimizer',
    'Growing startups over-provision infrastructure by 40% due to lack of auto-scaling intelligence.',
    'ML-powered auto-scaling recommendations that continuously right-size cloud resources.',
    'Automated scaling decisions will reduce cloud costs by 35% within 2 months of adoption.',
    'CTOs and platform leads at Series A startups',
    'https://example.com/scale-demo',
    ARRAY['Scalability', 'Security', 'API design'],
    ARRAY['https://picsum.photos/seed/scale-engine-1/800/600', 'https://picsum.photos/seed/scale-engine-2/800/600', 'https://picsum.photos/seed/scale-engine-3/800/600'], 'live', 'scale', '2026-03-30T10:00:00Z',
    '2026-03-05T09:00:00Z', '2026-03-30T10:00:00Z'
  ),
  (
    'c0000000-0000-4000-8000-000000000008',
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000002',
    'pivot-tracker',
    'Pivot Tracker',
    'Track strategic pivots across product teams',
    'Founding teams lose track of why strategic decisions were made.',
    'A lightweight log for tracking pivots, context, and outcomes across product iterations.',
    'A pivot log will cut decision-replay time from days to minutes during investor conversations.',
    'Co-founders at seed-stage startups',
    NULL,
    ARRAY['Feature set', 'Market fit'],
    ARRAY['https://picsum.photos/seed/pivot-tracker-1/800/600'], 'inactive', 'iterate', '2026-03-22T09:00:00Z',
    '2026-02-28T11:00:00Z', '2026-03-22T09:00:00Z'
  ),
  (
    'c0000000-0000-4000-8000-000000000009',
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000003',
    'growth-pulse',
    'Growth Pulse',
    'Growth metrics dashboard for startups',
    'Early-stage startups lack a single source of truth for growth metrics.',
    'A unified growth metrics dashboard pulling from Stripe, GA4, and Mixpanel.',
    'Centralizing metrics will reduce weekly reporting prep from 4 hours to 30 minutes.',
    'Growth leads at startups with first revenue',
    NULL,
    ARRAY['Growth metrics', 'Reporting'],
    '{}', 'inactive', 'scale', '2026-03-20T16:00:00Z',
    '2026-02-15T10:00:00Z', '2026-03-20T16:00:00Z'
  );

-- ── Feedbacks ────────────────────────────────────────────────
-- El trigger recomputa would_use_count en projects tras cada INSERT
-- p2 = 3 → "lo usaría" → suma al contador

INSERT INTO feedbacks (id, project_id, community_id, reviewer_id, scores, text_responses, created_at) VALUES
  -- Pulse Check (3 feedbacks — Sara, Kai, Priya)
  (
    'e0000000-0000-4000-8000-000000000001',
    'c0000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000002',
    '{"p1": 3, "p2": 3, "p3": 2}',
    '{"p1": "The problem is real — our team does manual check-ins every Friday and it takes 30 minutes.", "p2": "The trend visualization is the key differentiator. I would use this over a spreadsheet.", "p3": "Slack integration would make adoption seamless for remote teams.", "p4": "We already do informal check-ins — this would save time and be more honest."}',
    '2026-03-20T14:00:00Z'
  ),
  (
    'e0000000-0000-4000-8000-000000000002',
    'c0000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000005',
    '{"p1": 3, "p2": 2, "p3": 3}',
    '{"p4": "I worry people will not be honest even anonymously if the team is small."}',
    '2026-03-21T09:00:00Z'
  ),
  (
    'e0000000-0000-4000-8000-000000000003',
    'c0000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000006',
    '{"p1": 2, "p2": 3, "p3": 2}',
    '{"p1": "The problem resonates but I would want to see data on how it compares to 1:1s.", "p4": "Would love a comparison mode against existing team health tools."}',
    '2026-03-21T11:00:00Z'
  ),
  -- DocBridge (1 feedback — Tom)
  (
    'e0000000-0000-4000-8000-000000000004',
    'c0000000-0000-4000-8000-000000000002',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000003',
    '{"p1": 3, "p2": 3, "p3": 3}',
    '{"p1": "This is literally the biggest pain point in our onboarding process.", "p2": "Would save weeks of senior engineer time answering repeated questions.", "p3": "Need to address privacy — not all Slack convos should be indexed.", "p4": "Address privacy concerns and this becomes a must-have for teams over 20 people."}',
    '2026-03-19T12:00:00Z'
  ),
  -- Retro Replay (2 feedbacks — Alex, Sara)
  (
    'e0000000-0000-4000-8000-000000000005',
    'c0000000-0000-4000-8000-000000000004',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    '{"p1": 1, "p2": 1, "p3": 2}',
    '{"p4": "Our team already uses Miro + Notion — I am not sure this adds enough value."}',
    '2026-03-16T14:00:00Z'
  ),
  (
    'e0000000-0000-4000-8000-000000000006',
    'c0000000-0000-4000-8000-000000000004',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000002',
    '{"p1": 2, "p2": 1, "p3": 1}',
    '{"p3": "The AI summary accuracy would need to be very high for this to be trusted.", "p4": "Clarify what this does that Miro + Notion cannot do better."}',
    '2026-03-16T16:00:00Z'
  ),
  -- Iterate Labs (3 feedbacks — Alex, Sara, Tom)
  (
    'e0000000-0000-4000-8000-000000000007',
    'c0000000-0000-4000-8000-000000000006',
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    '{"p1": 2, "p2": 2, "p3": 2}',
    '{"p1": "I understand the problem but it happens less often than I expected.", "p2": "The prototype testing flow needs to be simpler before I commit.", "p3": "Pricing could block solo founders — needs a free tier.", "p4": "Solid concept but needs more polish before I would switch from my current tools."}',
    '2026-03-15T10:00:00Z'
  ),
  (
    'e0000000-0000-4000-8000-000000000008',
    'c0000000-0000-4000-8000-000000000006',
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000002',
    '{"p1": 3, "p2": 2, "p3": 2}',
    '{"p4": "The problem is real but the solution needs more differentiation from existing tools."}',
    '2026-03-15T14:00:00Z'
  ),
  (
    'e0000000-0000-4000-8000-000000000009',
    'c0000000-0000-4000-8000-000000000006',
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000003',
    '{"p1": 2, "p2": 3, "p3": 2}',
    '{"p2": "The value proposition for saving weeks of work is compelling and well articulated.", "p4": "Focus on the time-saving angle — that is the strongest hook for this audience."}',
    '2026-03-16T09:00:00Z'
  ),
  -- Scale Engine (3 feedbacks — Alex, Sara, Kai)
  (
    'e0000000-0000-4000-8000-000000000010',
    'c0000000-0000-4000-8000-000000000007',
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000001',
    '{"p1": 3, "p2": 3, "p3": 3}',
    '{"p1": "Cloud waste is a constant pain. Every company I know is overpaying.", "p2": "ML-driven recommendations are the right approach — rule-based tools always break.", "p3": "Would pay for this immediately if the API coverage is solid.", "p4": "One of the strongest ideas I have reviewed. Ship it."}',
    '2026-03-08T10:00:00Z'
  ),
  (
    'e0000000-0000-4000-8000-000000000011',
    'c0000000-0000-4000-8000-000000000007',
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000002',
    '{"p1": 3, "p2": 3, "p3": 2}',
    '{"p4": "Security and compliance will be the main objection — address that early."}',
    '2026-03-08T14:00:00Z'
  ),
  (
    'e0000000-0000-4000-8000-000000000012',
    'c0000000-0000-4000-8000-000000000007',
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000005',
    '{"p1": 3, "p2": 2, "p3": 3}',
    '{"p1": "I did not realize how bad cloud waste was until I saw the numbers in the demo.", "p4": "Changed my perspective on how actionable infrastructure data can be."}',
    '2026-03-09T10:00:00Z'
  );

-- ============================================================
-- E2E TEST DATA — datos para tests automatizados Playwright
-- UUID fijo del test user: e2e00000-0000-4000-8000-000000000099
-- ============================================================

-- ── Usuario de test E2E ──────────────────────────────────────

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'e2e00000-0000-4000-8000-000000000099',
  'authenticated', 'authenticated', 'e2e-community@proofday.local',
  crypt('E2eTest_Pass_123!', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"email_verified":true}',
  '', '', '', '',
  now(), now()
);

INSERT INTO auth.identities (
  id, provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(), 'e2e-community@proofday.local',
  'e2e00000-0000-4000-8000-000000000099',
  '{"sub":"e2e00000-0000-4000-8000-000000000099","email":"e2e-community@proofday.local","email_verified":true,"phone_verified":false}',
  'email', now(), now(), now()
);

UPDATE profiles SET
  name       = 'E2E Test User',
  bio        = 'Usuario de test automatizado para Playwright E2E.',
  interests  = ARRAY['testing'],
  updated_at = now()
WHERE id = 'e2e00000-0000-4000-8000-000000000099';

-- ── Membresía del test user en producto-alpha ────────────────
-- Necesaria para: project-detail, team-perspectives, feedback-cta, validation-signal-card

INSERT INTO community_members (id, community_id, user_id, role, joined_at) VALUES
  ('d0000000-0000-4000-8000-000000000099',
   'b0000000-0000-4000-8000-000000000001',
   'e2e00000-0000-4000-8000-000000000099',
   'member', now());

-- ── Proyecto owned by test user (para FeedbackCTA "owner" test) ─

INSERT INTO projects (
  id, community_id, builder_id, slug, title, tagline,
  problem, solution, hypothesis,
  target_user, demo_url, feedback_topics,
  image_urls, status, decision, decided_at,
  created_at, updated_at
) VALUES (
  'c0000000-0000-4000-8000-000000000011',
  'b0000000-0000-4000-8000-000000000001',
  'e2e00000-0000-4000-8000-000000000099',
  'e2e-own-project',
  'E2E Own Project',
  'Proyecto propio del usuario de test',
  'A test problem.', 'A test solution.', 'A test hypothesis.',
  'Early adopters', 'https://example.com/e2e-demo',
  ARRAY['UX', 'Performance'],
  ARRAY['https://picsum.photos/seed/e2e-own-1/800/600'], 'live', NULL, NULL,
  now(), now()
);

-- ── Proyecto minimal (para project-detail: sin campos opcionales) ─

INSERT INTO projects (
  id, community_id, builder_id, slug, title, tagline,
  problem, solution, hypothesis,
  target_user, demo_url, feedback_topics,
  image_urls, status, decision, decided_at,
  created_at, updated_at
) VALUES (
  'c0000000-0000-4000-8000-000000000010',
  'b0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'minimal-project',
  'Minimal Project',
  NULL,
  'A problem.', 'A solution.', 'A hypothesis.',
  NULL, NULL, NULL,
  '{}', 'live', NULL, NULL,
  now(), now()
);

-- ── startup-madrid (para project-feed y top-contributors) ────

INSERT INTO communities (id, name, slug, description, created_by, created_at, updated_at) VALUES
  ('b0000000-0000-4000-8000-000000000010',
   'Startup Madrid', 'startup-madrid',
   'Comunidad de validación de startups de Madrid.',
   'a0000000-0000-4000-8000-000000000001', now(), now());

INSERT INTO community_members (id, community_id, user_id, role, joined_at) VALUES
  ('d0000000-0000-4000-8000-000000000010', 'b0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000001', 'admin',  now()),
  ('d0000000-0000-4000-8000-000000000011', 'b0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000002', 'member', now()),
  ('d0000000-0000-4000-8000-000000000012', 'b0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000003', 'member', now()),
  ('d0000000-0000-4000-8000-000000000013', 'b0000000-0000-4000-8000-000000000010', 'e2e00000-0000-4000-8000-000000000099', 'member', now());

INSERT INTO projects (
  id, community_id, builder_id, slug, title, tagline,
  problem, solution, hypothesis,
  target_user, demo_url, feedback_topics,
  image_urls, status, decision, decided_at,
  created_at, updated_at
) VALUES
  (
    'c0000000-0000-4000-8000-000000000012',
    'b0000000-0000-4000-8000-000000000010',
    'a0000000-0000-4000-8000-000000000001',
    'madrid-live',
    'Madrid Live Project', 'Ideas en validación activa',
    'Problem.', 'Solution.', 'Hypothesis.',
    'Startup founders', NULL, ARRAY['Clarity', 'Market fit'],
    ARRAY['https://picsum.photos/seed/madrid-live/800/600'], 'live', NULL, NULL,
    now(), now()
  ),
  (
    'c0000000-0000-4000-8000-000000000013',
    'b0000000-0000-4000-8000-000000000010',
    'a0000000-0000-4000-8000-000000000002',
    'madrid-inactive',
    'Madrid Inactive Project', 'Proyecto cerrado',
    'Problem.', 'Solution.', 'Hypothesis.',
    NULL, NULL, NULL,
    '{}', 'inactive', 'abandon', now(),
    now(), now()
  );

-- Feedbacks en startup-madrid (para que el leaderboard no esté vacío)
INSERT INTO feedbacks (id, project_id, community_id, reviewer_id, scores, text_responses, created_at) VALUES
  (
    'e0000000-0000-4000-8000-000000000020',
    'c0000000-0000-4000-8000-000000000012',
    'b0000000-0000-4000-8000-000000000010',
    'a0000000-0000-4000-8000-000000000002',
    '{"p1": 3, "p2": 2, "p3": 2}',
    '{"p4": "Buen concepto, necesita más diferenciación."}',
    now()
  ),
  (
    'e0000000-0000-4000-8000-000000000021',
    'c0000000-0000-4000-8000-000000000012',
    'b0000000-0000-4000-8000-000000000010',
    'a0000000-0000-4000-8000-000000000003',
    '{"p1": 2, "p2": 3, "p3": 2}',
    '{"p4": "Interesante pero falta validación de mercado."}',
    now()
  );

-- ── sin-revisores (para top-contributors empty state) ────────

INSERT INTO communities (id, name, slug, description, created_by, created_at, updated_at) VALUES
  ('b0000000-0000-4000-8000-000000000011',
   'Sin Revisores', 'sin-revisores',
   'Comunidad sin revisores — para el empty state del leaderboard.',
   'a0000000-0000-4000-8000-000000000001', now(), now());

INSERT INTO community_members (id, community_id, user_id, role, joined_at) VALUES
  ('d0000000-0000-4000-8000-000000000014', 'b0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000001', 'admin',  now()),
  ('d0000000-0000-4000-8000-000000000015', 'b0000000-0000-4000-8000-000000000011', 'e2e00000-0000-4000-8000-000000000099', 'member', now());

INSERT INTO projects (
  id, community_id, builder_id, slug, title, tagline,
  problem, solution, hypothesis,
  target_user, demo_url, feedback_topics,
  image_urls, status, decision, decided_at,
  created_at, updated_at
) VALUES (
  'c0000000-0000-4000-8000-000000000014',
  'b0000000-0000-4000-8000-000000000011',
  'a0000000-0000-4000-8000-000000000001',
  'sin-revisores-project',
  'Project Without Reviewers', NULL,
  'Problem.', 'Solution.', 'Hypothesis.',
  NULL, NULL, NULL,
  '{}', 'live', NULL, NULL,
  now(), now()
);
-- Sin feedbacks (intencional — empty leaderboard state)

-- ── comunidad-sin-live (solo proyectos inactive) ─────────────

INSERT INTO communities (id, name, slug, description, created_by, created_at, updated_at) VALUES
  ('b0000000-0000-4000-8000-000000000012',
   'Sin Proyectos Live', 'comunidad-sin-live',
   'Comunidad solo con proyectos inactivos — para ocultar sección "En validación".',
   'a0000000-0000-4000-8000-000000000001', now(), now());

INSERT INTO community_members (id, community_id, user_id, role, joined_at) VALUES
  ('d0000000-0000-4000-8000-000000000016', 'b0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000001', 'admin',  now()),
  ('d0000000-0000-4000-8000-000000000017', 'b0000000-0000-4000-8000-000000000012', 'e2e00000-0000-4000-8000-000000000099', 'member', now());

INSERT INTO projects (
  id, community_id, builder_id, slug, title, tagline,
  problem, solution, hypothesis,
  target_user, demo_url, feedback_topics,
  image_urls, status, decision, decided_at,
  created_at, updated_at
) VALUES (
  'c0000000-0000-4000-8000-000000000015',
  'b0000000-0000-4000-8000-000000000012',
  'a0000000-0000-4000-8000-000000000001',
  'only-inactive-project',
  'Only Inactive Project', NULL,
  'Problem.', 'Solution.', 'Hypothesis.',
  NULL, NULL, NULL,
  '{}', 'inactive', 'abandon', now(),
  now(), now()
);

-- ── comunidad-sin-inactive (solo proyectos live) ──────────────

INSERT INTO communities (id, name, slug, description, created_by, created_at, updated_at) VALUES
  ('b0000000-0000-4000-8000-000000000013',
   'Sin Proyectos Inactivos', 'comunidad-sin-inactive',
   'Comunidad solo con proyectos live — para ocultar sección "Cerrados".',
   'a0000000-0000-4000-8000-000000000001', now(), now());

INSERT INTO community_members (id, community_id, user_id, role, joined_at) VALUES
  ('d0000000-0000-4000-8000-000000000018', 'b0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000001', 'admin',  now()),
  ('d0000000-0000-4000-8000-000000000019', 'b0000000-0000-4000-8000-000000000013', 'e2e00000-0000-4000-8000-000000000099', 'member', now());

INSERT INTO projects (
  id, community_id, builder_id, slug, title, tagline,
  problem, solution, hypothesis,
  target_user, demo_url, feedback_topics,
  image_urls, status, decision, decided_at,
  created_at, updated_at
) VALUES (
  'c0000000-0000-4000-8000-000000000016',
  'b0000000-0000-4000-8000-000000000013',
  'a0000000-0000-4000-8000-000000000001',
  'only-live-project',
  'Only Live Project', NULL,
  'Problem.', 'Solution.', 'Hypothesis.',
  NULL, NULL, NULL,
  ARRAY['https://picsum.photos/seed/only-live/800/600'], 'live', NULL, NULL,
  now(), now()
);

-- ── comunidad-vacia (sin proyectos — empty state) ─────────────

INSERT INTO communities (id, name, slug, description, created_by, created_at, updated_at) VALUES
  ('b0000000-0000-4000-8000-000000000014',
   'Comunidad Vacía', 'comunidad-vacia',
   'Comunidad sin proyectos — para el empty state global.',
   'a0000000-0000-4000-8000-000000000001', now(), now());

INSERT INTO community_members (id, community_id, user_id, role, joined_at) VALUES
  ('d0000000-0000-4000-8000-000000000020', 'b0000000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000001', 'admin',  now()),
  ('d0000000-0000-4000-8000-000000000021', 'b0000000-0000-4000-8000-000000000014', 'e2e00000-0000-4000-8000-000000000099', 'member', now());
-- Sin proyectos (intencional — empty state)

-- ── test-community (para project-card tests) ──────────────────

INSERT INTO communities (id, name, slug, description, created_by, created_at, updated_at) VALUES
  ('b0000000-0000-4000-8000-000000000015',
   'Test Community', 'test-community',
   'Comunidad de test para ProjectCard E2E tests.',
   'a0000000-0000-4000-8000-000000000001', now(), now());

INSERT INTO community_members (id, community_id, user_id, role, joined_at) VALUES
  ('d0000000-0000-4000-8000-000000000022', 'b0000000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000001', 'admin',  now()),
  ('d0000000-0000-4000-8000-000000000023', 'b0000000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000002', 'member', now()),
  ('d0000000-0000-4000-8000-000000000024', 'b0000000-0000-4000-8000-000000000015', 'e2e00000-0000-4000-8000-000000000099', 'member', now());

INSERT INTO projects (
  id, community_id, builder_id, slug, title, tagline,
  problem, solution, hypothesis,
  target_user, demo_url, feedback_topics,
  image_urls, status, decision, decided_at,
  created_at, updated_at
) VALUES
  (
    'c0000000-0000-4000-8000-000000000017',
    'b0000000-0000-4000-8000-000000000015',
    'a0000000-0000-4000-8000-000000000001',
    'test-project-with-image',
    'Test Project With Image', 'Proyecto con imagen para tests de tarjeta',
    'Problem.', 'Solution.', 'Hypothesis.',
    'Test users', NULL, ARRAY['Clarity', 'UX'],
    ARRAY['https://picsum.photos/seed/test-proj-img/800/600'], 'live', NULL, NULL,
    now(), now()
  ),
  (
    'c0000000-0000-4000-8000-000000000018',
    'b0000000-0000-4000-8000-000000000015',
    'a0000000-0000-4000-8000-000000000002',
    'test-project-no-image',
    'Test Project No Image', 'Proyecto sin imagen — para el placeholder test',
    'Problem.', 'Solution.', 'Hypothesis.',
    'Test users', NULL, NULL,
    '{}', 'live', NULL, NULL,
    now(), now()
  );

-- Feedback en test-community (para project-card-feedback-count)
INSERT INTO feedbacks (id, project_id, community_id, reviewer_id, scores, text_responses, created_at) VALUES
  (
    'e0000000-0000-4000-8000-000000000022',
    'c0000000-0000-4000-8000-000000000017',
    'b0000000-0000-4000-8000-000000000015',
    'a0000000-0000-4000-8000-000000000002',
    '{"p1": 3, "p2": 2, "p3": 3}',
    '{"p4": "Buen concepto."}',
    now()
  );

-- ── Invitation links ─────────────────────────────────────────

INSERT INTO invitation_links (id, token, community_id, created_by, used_at, used_by, created_at) VALUES
  (
    'f0000000-0000-4000-8000-000000000001',
    'invite-token-alpha-abc123',
    'b0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000001',
    NULL, NULL,
    '2026-03-01T10:00:00Z'
  ),
  (
    'f0000000-0000-4000-8000-000000000002',
    'invite-token-lab-xyz789',
    'b0000000-0000-4000-8000-000000000002',
    'a0000000-0000-4000-8000-000000000002',
    '2026-03-05T14:30:00Z',
    'a0000000-0000-4000-8000-000000000002',
    '2026-03-01T09:00:00Z'
  );
