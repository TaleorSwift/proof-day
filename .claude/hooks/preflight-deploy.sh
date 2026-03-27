#!/usr/bin/env bash
# Hook: PreToolUse (Bash) — Pre-flight de deploy
# Ejecuta preflight-check.sh antes de comandos de deploy

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

if echo "$COMMAND" | grep -qiE '(docker compose up|docker-compose up|aws ecs|vercel deploy|netlify deploy)'; then
  if [ -f "_bmad/bmm/tools/preflight-check.sh" ]; then
    RESULT=$(bash _bmad/bmm/tools/preflight-check.sh 2>&1)
    EXIT_CODE=$?
    if [ $EXIT_CODE -ne 0 ]; then
      echo "❌ PRE-FLIGHT FAILED. Fix issues before deploying:" >&2
      echo "$RESULT" >&2
      exit 2
    fi
  fi
  if [ ! -f "_bmad-output/planning-artifacts/architecture.md" ]; then
    echo "⚠️ No architecture.md found. Deploy may not align with ADRs." >&2
  fi
fi
exit 0
