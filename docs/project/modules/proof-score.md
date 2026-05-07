# Proof Score

## Qué hace

Calcula y muestra al Builder una señal de validación de su proyecto basada en los feedbacks recibidos. Requiere un mínimo de 3 feedbacks para generar el score. Aparece en la sidebar del detalle del proyecto, solo visible para el Builder. Incluye una interpretación contextual en lenguaje natural generada por IA (Ollama).

## Reglas de comportamiento

- El score solo se calcula cuando hay al menos 3 feedbacks (story 5.1)
- Los niveles son: `Promising` (>=2.5), `Needs iteration` (>=1.75), `Weak` (<1.75) (story 5.1)
- Solo el Builder puede ver su Proof Score — el endpoint retorna 403 para otros usuarios (story 5.1)
- El score se filtra por la iteración más reciente del proyecto si existe (story 13.6)
- La interpretación contextual se genera on-demand con Ollama, sin persistencia (story 13.8)
- La interpretación se carga DESPUÉS del score, de forma asíncrona (fire-after-score) (story 13.8)
- Si la interpretación falla (Ollama no disponible, error de red), el componente no rompe — la interpretación es opcional (story 13.8)
- El coste de la interpretación se registra en `ai_cost_tracking` con `communityId` del proyecto (story 13.8)
- Si el presupuesto diario está agotado, el endpoint retorna 429 BUDGET_EXCEEDED (story 13.8)

## Ficheros clave

- `app/api/proof-score/[projectId]/route.ts`
- `app/api/projects/[id]/score-interpretation/route.ts`
- `components/proof-score/ProofScoreSidebar.tsx`
- `lib/utils/proof-score.ts`

## Última actualización

Story 13.8 — 2026-05-07
