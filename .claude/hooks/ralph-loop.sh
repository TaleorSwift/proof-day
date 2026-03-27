#!/usr/bin/env bash
# Hook: Stop — Ralph Loop
# Verifica completion promise antes de permitir salir
# Solo activo cuando se lanza con RALPH_LOOP=1

if [ "${RALPH_LOOP}" != "1" ]; then
  exit 0  # No estamos en modo Ralph, dejar salir normalmente
fi

INPUT=$(cat)
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript // ""')
PROMISE="${RALPH_PROMISE:-STORY_COMPLETE}"
MAX_ITER="${RALPH_MAX_ITERATIONS:-25}"
ITER_FILE="/tmp/ralph-iteration-count"

# Contar iteraciones
CURRENT=$(cat "$ITER_FILE" 2>/dev/null || echo "0")
CURRENT=$((CURRENT + 1))
echo "$CURRENT" > "$ITER_FILE"

# Safety: max iterations
if [ "$CURRENT" -ge "$MAX_ITER" ]; then
  echo "⚠️ Ralph Loop: max iterations ($MAX_ITER) reached. Stopping." >&2
  rm -f "$ITER_FILE"
  exit 0  # Dejar salir
fi

# Check completion promise
if echo "$TRANSCRIPT" | grep -q "$PROMISE"; then
  echo "✅ Ralph Loop: completion promise '$PROMISE' detected. Story done." >&2
  rm -f "$ITER_FILE"
  exit 0  # Dejar salir
fi

# No promise → devolver al loop con instrucciones
echo "🔄 Ralph Loop iteration $CURRENT/$MAX_ITER — Work not complete." >&2
echo "Continue working. Check remaining tasks. Only output '$PROMISE' when ALL tasks are [x], ALL tests pass, and definition-of-done is verified." >&2
exit 1  # Bloquear salida → Claude continúa
