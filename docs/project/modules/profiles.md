# Perfiles de Usuario

## Qué hace
Permite a cada usuario tener un perfil con nombre, bio e intereses. El propio usuario puede editar su perfil de forma inline en `/profile`. Los miembros de la misma comunidad pueden ver el perfil de otros usuarios en `/profile/[id]`. Las métricas de actividad (feedbacks dados, proyectos creados) son visibles en el perfil propio; solo los proyectos creados son visibles en perfiles ajenos.

## Reglas de comportamiento
- Todo usuario tiene un perfil creado automáticamente al registrarse (trigger Supabase). (story 6.1)
- `/profile` muestra el perfil propio del usuario autenticado con edición inline — sin página separada. (story 6.1)
- `/profile/[id]` solo es accesible si el visitante comparte al menos una comunidad con el perfil visto; si no → 403 redirect a `/communities`. (story 6.1)
- Los feedbacks dados de un usuario NO son visibles a terceros; solo el propio usuario los ve. (story 6.1)
- Los campos editables son: nombre/alias (máx 60 chars), bio (máx 500 chars), intereses (máx 10 tags, cada uno máx 30 chars). (story 6.1)
- El perfil de otro usuario muestra nombre, bio, intereses y número de proyectos creados; solo el tab "Proyectos creados". (story 6.1)

## Ficheros clave
- `app/(app)/profile/page.tsx`
- `app/(app)/profile/[id]/page.tsx`
- `components/profiles/OwnProfileView.tsx`
- `components/profiles/ProfileForm.tsx`
- `app/api/profiles/[id]/route.ts`

## Última actualización
Story 6.1 — 2026-03-28
