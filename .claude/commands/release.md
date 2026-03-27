cat > .claude/commands/release.md << 'EOF'
---
description: "Release — PR de develop a main + tag semver"
---

Ejecuta el flujo de release:

1. Verifica que estás en `develop` y que está limpio (`git status`)
2. Pregunta al usuario qué tipo de bump: major, minor o patch
3. Calcula la nueva versión a partir del último tag (`git describe --tags --abbrev=0`)
4. Crea PR de `develop` → `main` vía `gh pr create --base main --head develop`
   - Título: `Release vX.Y.Z`
   - Body: changelog generado con `git log --pretty=format:"- %s" $(git describe --tags --abbrev=0)..HEAD`
5. PARAR — esperar a que el usuario apruebe y mergee el PR
6. Cuando el usuario confirme el merge: `git checkout main && git pull`
7. Crear tag: `git tag vX.Y.Z && git push origin vX.Y.Z`
8. Confirmar: "Release vX.Y.Z publicado. GitHub Actions se encarga del build y deploy."

NUNCA mergear el PR sin aprobación explícita del usuario.
EOF