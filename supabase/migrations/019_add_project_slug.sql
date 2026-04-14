-- Story 10.x: Add slug column to projects for human-readable URLs
-- Replaces UUID-based routing (/projects/[uuid]) with slug-based (/projects/[slug])

ALTER TABLE projects ADD COLUMN slug text;

-- Backfill for any rows that may exist before this migration.
-- Uses lower-case, alphanumeric + hyphens, collapses spaces and special chars.
-- In dev (db reset) the table is empty here; seed.sql provides explicit slugs.
UPDATE projects
SET slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(title, '[^a-zA-Z0-9 ]', '', 'g'),
      ' +', '-', 'g'
    ),
    '-$', '', 'g'
  )
)
WHERE slug IS NULL;

ALTER TABLE projects ALTER COLUMN slug SET NOT NULL;

-- Scope de unicidad: (community_id, slug) — proyectos en distintas comunidades
-- pueden compartir el mismo slug. El path público es /communities/[slug]/projects/[projectSlug].
CREATE UNIQUE INDEX idx_projects_community_slug ON projects(community_id, slug);
