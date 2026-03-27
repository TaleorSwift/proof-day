#!/usr/bin/env bash
# Hook: PreToolUse (Write) — Restringir agentes read-only
# Edna y Monty solo pueden escribir en _bmad-output/

INPUT=$(cat)
AGENT=$(echo "$INPUT" | jq -r '.agent_name // ""')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')

case "$AGENT" in
  edna|monty)
    if ! echo "$FILE_PATH" | grep -q "^_bmad-output/\|^\./_bmad-output/"; then
      echo "Agent ${AGENT} can only write to _bmad-output/. Blocked: ${FILE_PATH}" >&2
      exit 2
    fi
    ;;
esac
exit 0
