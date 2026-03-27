#!/usr/bin/env bash
# Hook: PreToolUse (Write|Edit|MultiEdit) — Proteger core BMAD-S
# Impide modificar _bmad/. Excepción: Kent puede escribir su sidecar.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')
AGENT=$(echo "$INPUT" | jq -r '.agent_name // ""')

# Exception: Kent can modify his sidecar
if [ "$AGENT" = "kent" ] && echo "$FILE_PATH" | grep -q "tech-writer-sidecar/"; then
  exit 0
fi

# Block modifications to BMAD core
if echo "$FILE_PATH" | grep -q "_bmad/"; then
  echo "BMAD core files are read-only. Do not modify framework files." >&2
  exit 2
fi
exit 0
