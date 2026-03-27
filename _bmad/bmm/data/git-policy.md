# Flujo de Trabajo Git

> **CRÍTICO**: Claude DEBE seguir este flujo SIEMPRE. NUNCA hacer PR directamente a `main` durante el desarrollo de tareas.

Partimos siempre de que existen dos ramas troncales: `main` y `develop`.

- `main` es la rama de producción, debe de reflejar en todo momento el estado del proyecto desplegado en producción. 
- `develop` es la rama de desarrollo, todo desarrollo se hace a través de nuevas ramas sacadas de `develop`.

## Durante el desarrollo de tareas:
1. Crear rama desde `develop`: `feat/nombre-tarea`
2. Desarrollar con [commits convencionales](https://www.conventionalcommits.org/en/v1.0.0/)
3. **PR a `develop`** (NUNCA a `main`)
4. Espera mi revisión y aprobación explicita antes de mergear a `develop`
4. Squash merge a `develop` tras mi aprobación

## Solo al finalizar una historia de usuario completa o por petición mía explicita:
5. PR de `develop` → `main`
6. Merge a `main`
7. Crear tag de versión siguiendo [SEMVER](https://semver.org/lang/es/) (ej: `v0.6.0`). Si no existe una etiqueta inicial, crea la `v0.1.0`.
8. GitHub Actions se encarga del resto: build imagen(es) Docker, release, y deploy automático a producción

# CI/CD

## Pipelines (GitHub Actions)

| Workflow        | Trigger | Jobs                                                                                         |
|-----------------|---------|----------------------------------------------------------------------------------------------|
| `ci.yaml`       | Push/PR | Tests, Analisis estático de código                                                           | 
| `security.yaml` | Push/PR | Analisis de dependencias (npm/composer audit y similares), security scan (semgrep), gitleaks | 
| `release.yaml`  | Push tag `v*` | Build imagen(es) docker, Push a ghcr.io, deploy automático a producción                      |

### CI (`ci.yaml`)
- **NO** hacer build de Docker para tareas que no lo requieran
- Tests unitarios y funcionales usan SQLite en memoria (rápido, sin servicios externos)
- Usa un analizador estatico de código acorde al lenguaje

Ejemplo de `ci.yaml` (adaptar para el lenguaje o framework adecuado. Este ejemplo usa PHP/Symfony):

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:

permissions:
  contents: read
  pull-requests: read
  security-events: write

concurrency:
  group: ${{ github.workflow }}-${{ github.head_ref || github.run_id }}
  cancel-in-progress: true

jobs:
  tests:
    name: Tests (PHP ${{ matrix.php }})
    runs-on: ubuntu-latest
    strategy:
      matrix:
        php: ['8.4']
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install dependencies
        run: composer install --prefer-dist --no-progress --no-interaction

      - name: Create test database schema
        run: bin/console doctrine:schema:create --env=test
        env:
          DATABASE_URL: "sqlite:///%kernel.project_dir%/var/test.db"

      - name: Run PHPUnit
        run: bin/phpunit --testdox
        env:
          DATABASE_URL: "sqlite:///%kernel.project_dir%/var/test.db"

  phpstan:
    name: PHPStan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.4'
          extensions: mbstring, xml, ctype, iconv, intl
          coverage: none
          tools: composer:v2

      - name: Install dependencies
        run: composer install --prefer-dist --no-progress --no-interaction

      - name: Run PHPStan
        run: vendor/bin/phpstan analyse --no-progress
```

### Security (`security.yaml`)
- **NO** hacer build de Docker para tareas que no lo requieran
- Analiza dependencias (npm/composer audit y similares)
- Security scan (semgrep)
- Gitleaks

Ejemplo de `security.yaml` (adaptar para el lenguaje o framework adecuado. Este ejemplo usa PHP/Symfony):

```yaml
name: Security

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:

permissions:
  contents: read
  pull-requests: read
  security-events: write

concurrency:
  group: ${{ github.workflow }}-${{ github.head_ref || github.run_id }}
  cancel-in-progress: true

jobs:
  composer-audit:
  name: Composer Audit
  runs-on: ubuntu-latest
  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.4'
        tools: composer:v2

    - name: Composer Audit
      run: composer audit --format=plain --locked

  semgrep:
    name: Semgrep
    runs-on: ubuntu-latest
    container:
      image: semgrep/semgrep
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run Semgrep
        run: semgrep scan --config p/php --config p/security-audit --config p/secrets --error

  gitleaks:
    name: Gitleaks
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Release y Deploy (`release.yaml`)
- **Build**: imagen Docker push a `ghcr.io` (runner nativo `ubuntu-24.04`)
- **Release**: genera changelog automático y crea GitHub Release
- **Deploy**: SSH al servidor de producción → ejecuta `scripts/deploy.sh`
    - Descarga compose files y Makefile actualizados desde GitHub API (repo privado, usa `DEPLOY_GITHUB_PAT`)
    - Compara `.env.prod` contra `.env.prod.example` y avisa de variables faltantes
    - Pull imagen, recreate containers (zero-downtime), migrate, cache clear, health check
    - Deploy es condicional: se salta si los secrets `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` no están configurados
    - El script de deploy debería de limitarse a hacer un `docker pull` para obtener las últimas versiones de las imágenes y reconstruir los containers necesarios. Pero si es necesario, puede hacer otras tareas como `composer install` o `npm install`. A tu criterio.

**IMPORTANTE:**
- Asume que en el servidor ya tendremos todo lo necesario para ejecutar `docker pull` y `docker compose up -d`.
- En el servidor solo debemos de tener los archivos compose, Makefile y `.env`. Si hay alguno más que consideres necesario, avísame.
- Si necesito crear secrets en GitHub, házmelo saber y dime qué secreto y qué valor poner. Diferencia correctamente entre `secrets` y `vars`.

Ejemplo de `release.yaml` (adaptar para el lenguaje o framework adecuado. Este ejemplo usa PHP/Symfony):

```yaml
name: Release & Deploy

on:
  push:
    tags: ['v*']
  workflow_dispatch:
    inputs:
      tag:
        description: 'Existing tag to release (e.g., v1.0.0)'
        required: true
        type: string

permissions:
  contents: write
  packages: write

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ghcr.io/${{ github.repository }}

jobs:
  build:
    name: Build and Push Image
    runs-on: ubuntu-24.04
    outputs:
      version: ${{ steps.version.outputs.version }}
    steps:
      - name: Determine version
        id: version
        run: |
          if [ -n "${{ inputs.tag }}" ]; then
            echo "version=${{ inputs.tag }}" >> $GITHUB_OUTPUT
          else
            echo "version=${GITHUB_REF_NAME}" >> $GITHUB_OUTPUT
          fi

      - name: Checkout
        uses: actions/checkout@v4
        with:
          ref: ${{ steps.version.outputs.version }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.IMAGE_NAME }}
          tags: |
            type=raw,value=${{ steps.version.outputs.version }}
            type=raw,value=latest

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          target: frankenphp_prod
          push: true
          platforms: linux/arm64
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  release:
    name: Create GitHub Release
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate changelog
        id: changelog
        run: |
          VERSION="${{ needs.build.outputs.version }}"

          # Get previous tag
          PREV_TAG=$(git describe --tags --abbrev=0 ${VERSION}^ 2>/dev/null || echo "")

          if [ -n "$PREV_TAG" ]; then
            CHANGELOG=$(git log --pretty=format:"- %s" $PREV_TAG..$VERSION | grep -v "^- Merge")
          else
            CHANGELOG=$(git log --pretty=format:"- %s" | head -20 | grep -v "^- Merge")
          fi

          echo "changelog<<EOF" >> $GITHUB_OUTPUT
          echo "$CHANGELOG" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ needs.build.outputs.version }}
          name: Release ${{ needs.build.outputs.version }}
          body: |
            ## Changes

            ${{ steps.changelog.outputs.changelog }}

            ## Docker Image

            ```bash
            docker pull ${{ env.IMAGE_NAME }}:${{ needs.build.outputs.version }}
            ```
          draft: false
          prerelease: false

  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, release]
    steps:
      - name: Check deploy secrets
        id: check
        env:
          DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
          DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
          DEPLOY_SSH_KEY: ${{ secrets.DEPLOY_SSH_KEY }}
        run: |
          if [ -n "$DEPLOY_HOST" ] && [ -n "$DEPLOY_USER" ] && [ -n "$DEPLOY_SSH_KEY" ]; then
            echo "configured=true" >> $GITHUB_OUTPUT
          else
            echo "configured=false" >> $GITHUB_OUTPUT
            echo "::notice::Deploy skipped — DEPLOY_HOST, DEPLOY_USER, or DEPLOY_SSH_KEY secrets not configured."
          fi

      - name: Deploy via SSH
        if: steps.check.outputs.configured == 'true'
        uses: appleboy/ssh-action@v1
        env:
          GITHUB_PAT: ${{ secrets.DEPLOY_GITHUB_PAT }}
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          envs: GITHUB_PAT
          script: |
            cd ${{ secrets.DEPLOY_PATH }}
            ./deploy.sh
```

# Docker y Docker Compose

## docker-compose.yml
Es importante tener separado un `docker-compose.dev.yml` para el desarrollo. y un `docker-compose.prod.yml` para el despliegue.
Si lo consideras necesario, puedes crear un `docker-compose.yml` base y que los otros dos sobreescriban lo necesario.

## Makefile
Al estar usando docker, es **MUY IMPORTANTE** que tengas en cuenta siempre que todos los comandos que necesites ejecutar, se ejecuten dentro del container.
**NUNCA** ejecutarlos directamente en el host, ya que eso puede causar problemas.
Para evitar este tipo de problemas, puedes crear un `Makefile` que contenga todos los comandos que necesites ejecutar, y que los ejecute dentro del container. 
Este `Makefile` es importante que lo vayas actualizando con el tiempo, ya que es posible que los comandos cambien.
Además, este Makefile debe de estar bien documentado, para que cuando el desarrollador haga `make` o `make help` pueda ver todos los comandos disponibles, con descripciones.
La documentación del `Makefile` debe de agrupar los comandos por secciones (docker, compose, etc). Usa emojis para diferenciar las secciones, además del título.