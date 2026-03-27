# Step 1: Pull Request Management

## Step 0: MCP Dependency Check (MANDATORY)

Verify GitHub MCP is available. If not → HALT, redirect to /setup-mcps.

---

## Determine PR Action

Ask the user:

> {user_name}, ¿qué necesitas hacer con pull requests?

| Opción | Acción |
|--------|--------|
| **[1] Crear PR** | Crear un nuevo pull request desde una feature branch |
| **[2] Listar PRs** | Ver todos los PRs abiertos y su estado |
| **[3] Merge PR** | Mergear un PR aprobado |

---

## Option 1: Create PR

### Gather Information

List available branches via GitHub MCP and present them:

> Ramas disponibles:
> - `feature/home-module` (3 commits ahead of develop)
> - `feature/login-flow` (1 commit ahead of develop)
> - `fix/header-spacing` (2 commits ahead of develop)
>
> ¿Desde qué rama quieres crear el PR?

Then ask:
> ¿Hacia qué rama? (por defecto: `develop` si Git Flow, `main` si Trunk-based)

### Generate PR Content

Based on the branch name and recent commits, propose:

```
📋 ACCIÓN PROPUESTA: Crear Pull Request
   - Título: <generated from branch name and commits>
   - Desde: <source_branch>
   - Hacia: <target_branch>
   - Descripción:
     ## Cambios
     <summary from commit messages>

     ## Stories relacionadas
     <if story ID detected in commits or branch name>

     ## Checklist
     - [ ] Tests pasan
     - [ ] Code review completado
     - [ ] Documentación actualizada (si aplica)
```

> ¿Procedo? **[C]** Continuar / **[E]** Editar título o descripción / **[S]** Saltar

**On [C]:** Execute `create_pull_request` via GitHub MCP.

Report:
```
✅ PR #<number> creado: <url>
   Título: <title>
   Estado: Open — Pendiente de review
```

---

## Option 2: List PRs

Query open PRs via GitHub MCP and present:

```
PULL REQUESTS ABIERTOS: {project_name}

| # | Título | Desde → Hacia | Autor | Estado | Creado |
|---|--------|--------------|-------|--------|--------|
| 12 | Feature: Home module | feature/home → develop | Homer | Review pending | hace 2h |
| 11 | Fix: Header spacing | fix/header → develop | Homer | Approved ✅ | hace 1d |
| 10 | Feature: Login flow | feature/login → develop | Homer | Changes requested ⚠️ | hace 3d |

💡 PR #11 está aprobado y listo para merge. ¿Quieres mergearlo? [C]
```

---

## Option 3: Merge PR

List merge-ready PRs (approved, no conflicts):

> PRs listos para merge:
> - PR #11: Fix: Header spacing (approved, no conflicts)
>
> ¿Cuál quieres mergear?

Ask merge strategy:

| Estrategia | Descripción |
|-----------|-------------|
| **Squash and merge** | Un solo commit limpio en la rama destino (recomendado) |
| **Merge commit** | Preserva todos los commits + commit de merge |
| **Rebase and merge** | Reescribe commits sobre la rama destino |

```
📋 ACCIÓN PROPUESTA: Merge Pull Request
   - PR: #11 — Fix: Header spacing
   - Estrategia: Squash and merge
   - Hacia: develop
   - Eliminar rama origen después del merge: Sí
```

> ¿Procedo? **[C]** Continuar / **[E]** Cambiar estrategia / **[S]** Cancelar

**On [C]:** Execute merge via GitHub MCP, then delete source branch.

Report:
```
✅ PR #11 mergeado en 'develop'
   Estrategia: Squash and merge
   Rama 'fix/header-spacing': Eliminada
```

---

## Completion

After any action, offer:

> ¿Algo más con pull requests?
> - **[1]** Crear otro PR
> - **[2]** Ver PRs abiertos
> - **[3]** Mergear otro PR
> - **[X]** Salir
