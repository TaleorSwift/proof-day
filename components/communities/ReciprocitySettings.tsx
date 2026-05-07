'use client'

import { useState } from 'react'

interface ReciprocitySettingsProps {
  communityId: string
  currentThreshold: number
}

/**
 * Valida que el string representa un entero en el rango [0, 10].
 * Retorna `true` solo si el string es parseable como entero y está en rango.
 */
function parseThreshold(raw: string): { valid: boolean; value: number } {
  const trimmed = raw.trim()
  if (trimmed === '' || trimmed === '-') return { valid: false, value: NaN }

  const parsed = Number(trimmed)
  const isInteger = Number.isInteger(parsed)
  const inRange = parsed >= 0 && parsed <= 10

  return { valid: isInteger && inRange, value: parsed }
}

export default function ReciprocitySettings({
  communityId,
  currentThreshold,
}: ReciprocitySettingsProps) {
  // Mantener el valor como string para evitar problemas con inputs tipo number en jsdom/browser
  const [rawValue, setRawValue] = useState<string>(String(currentThreshold))
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { valid: isValid, value: numericValue } = parseThreshold(rawValue)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || isSaving) return

    setIsSaving(true)
    setError(null)
    setSaved(false)

    try {
      const response = await fetch(`/api/communities/${communityId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reciprocityThreshold: numericValue }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Error al guardar la configuración')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error al guardar la configuración'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-sm)',
        marginTop: 'var(--space-6)',
      }}
    >
      {/* Section Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Reciprocidad
        </h2>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Configura cuántos feedbacks deben dar los miembros antes de poder publicar un proyecto.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Label + Input */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label
            htmlFor="reciprocity-threshold"
            style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Feedbacks mínimos para publicar
          </label>

          <input
            id="reciprocity-threshold"
            data-testid="reciprocity-threshold-input"
            type="number"
            min={0}
            max={10}
            step={1}
            value={rawValue}
            onChange={(e) => setRawValue(e.target.value)}
            style={{
              width: '80px',
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-background)',
              border: `1px solid ${!isValid ? 'var(--color-weak-text)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-sm)',
              outline: 'none',
            }}
          />

          {/* Texto de ayuda (AC-1) */}
          <p
            style={{
              marginTop: 'var(--space-2)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            Los miembros deben haber dado este número de feedbacks en los últimos 30 días antes
            de poder publicar. Pon 0 para desactivar el requisito.
          </p>

          {/* Mensaje de validación inline */}
          {!isValid && rawValue !== '' && (
            <p
              style={{
                marginTop: 'var(--space-1)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-weak-text)',
              }}
            >
              El valor debe ser un número entero entre 0 y 10.
            </p>
          )}
        </div>

        {/* Error de red / API */}
        {error && (
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-weak-text)',
              backgroundColor: 'var(--color-weak-bg)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {error}
          </p>
        )}

        {/* Feedback de éxito (AC-7) */}
        {saved && (
          <p
            data-testid="reciprocity-saved-feedback"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-promising-text)',
              backgroundColor: 'var(--color-promising-bg)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-4)',
            }}
          >
            Configuración guardada correctamente.
          </p>
        )}

        {/* Botón Guardar */}
        <button
          type="submit"
          data-testid="save-reciprocity-btn"
          disabled={!isValid || isSaving}
          style={{
            backgroundColor:
              !isValid || isSaving
                ? 'var(--color-text-muted)'
                : 'var(--color-primary)',
            color: 'var(--color-surface)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-5)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            cursor: !isValid || isSaving ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.15s ease',
          }}
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </form>
    </section>
  )
}
