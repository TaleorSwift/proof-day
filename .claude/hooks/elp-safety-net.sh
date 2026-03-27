#!/usr/bin/env bash
# Hook: Stop — ELP safety net
# Si un agente se interrumpe sin escribir closing, deja marca SESSION_END_UNEXPECTED

INPUT=$(cat)
AGENT=$(echo "$INPUT" | jq -r '.agent_name // "main"')
TIMESTAMP=$(date -u +"%Y%m%d-%H%M%S")
LOG_FILE="_bmad-output/execution-log.yaml"

if [ "$AGENT" != "main" ] && [ "$AGENT" != "null" ]; then
  mkdir -p _bmad-output
  # Case-insensitive grep for agent name, check status field (not result)
  LAST_STATUS=$(grep -i "agent:.*${AGENT}" "$LOG_FILE" 2>/dev/null | tail -1)
  if [ -n "$LAST_STATUS" ]; then
    # Check if latest entry for this agent has status: STARTED (with or without quotes)
    HAS_STARTED=$(grep -i -A 5 "agent:.*${AGENT}" "$LOG_FILE" 2>/dev/null | tail -6 | grep -i 'status:.*STARTED')
    if [ -n "$HAS_STARTED" ]; then
      cat >> "$LOG_FILE" << EOF

  - id: "${TIMESTAMP}-${AGENT}-safety-net"
    timestamp: "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    agent: "${AGENT}"
    status: "SESSION_END_UNEXPECTED"
    summary: "Session ended without closing entry — likely interrupted"
EOF
    fi
  fi
fi
exit 0