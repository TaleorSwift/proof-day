#!/usr/bin/env bash
# Hook: Notification — Notificación desktop cuando el agente necesita atención
# macOS: osascript, Linux: notify-send

if command -v osascript &>/dev/null; then
  osascript -e 'display notification "Agente necesita tu atención" with title "BMAD-S"' 2>/dev/null || true
elif command -v notify-send &>/dev/null; then
  notify-send 'BMAD-S' 'Agente necesita tu atención' 2>/dev/null || true
fi
exit 0
