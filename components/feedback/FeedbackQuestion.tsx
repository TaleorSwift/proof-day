'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { FeedbackScore } from '@/lib/types/feedback'

interface FeedbackQuestionProps {
  number: 1 | 2 | 3 | 4
  question: string
  tooltip: string
  scoreValue?: FeedbackScore
  textValue?: string
  onScoreChange?: (value: FeedbackScore) => void
  onTextChange: (value: string) => void
  isTextOnly?: boolean // true para P4
  textOptional?: boolean // true para P1-P3 textarea
}

const SCORE_LABELS: Record<string, FeedbackScore> = {
  yes: 3,
  somewhat: 2,
  no: 1,
}

const SCORE_VALUES: Record<FeedbackScore, string> = {
  3: 'yes',
  2: 'somewhat',
  1: 'no',
}

export function FeedbackQuestion({
  number,
  question,
  tooltip,
  scoreValue,
  textValue = '',
  onScoreChange,
  onTextChange,
  isTextOnly = false,
  textOptional = false,
}: FeedbackQuestionProps) {
  const handleToggleChange = (val: string) => {
    if (!val || !onScoreChange) return
    const score = SCORE_LABELS[val]
    if (score) onScoreChange(score)
  }

  return (
    <fieldset
      style={{
        border: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <legend
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-1)',
        }}
      >
        <span>
          P{number}. {question}
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`Más info sobre la pregunta ${number}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                ?
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p style={{ maxWidth: '240px' }}>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </legend>

      {/* ToggleGroup solo en P1-P3 */}
      {!isTextOnly && onScoreChange && (
        <ToggleGroup
          type="single"
          value={scoreValue ? SCORE_VALUES[scoreValue] : ''}
          onValueChange={handleToggleChange}
          variant="outline"
        >
          <ToggleGroupItem
            value="yes"
            aria-label="Sí"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            Sí
          </ToggleGroupItem>
          <ToggleGroupItem
            value="somewhat"
            aria-label="Más o menos"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            Más o menos
          </ToggleGroupItem>
          <ToggleGroupItem
            value="no"
            aria-label="No"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            No
          </ToggleGroupItem>
        </ToggleGroup>
      )}

      {/* Textarea */}
      <div>
        <Textarea
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={
            isTextOnly
              ? 'Mínimo 10 caracteres...'
              : textOptional
                ? 'Comentario adicional (opcional)...'
                : ''
          }
          rows={isTextOnly ? 4 : 2}
          required={isTextOnly}
          aria-label={`Respuesta de texto para pregunta ${number}`}
          style={{
            width: '100%',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)',
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            resize: 'vertical',
          }}
        />
        {isTextOnly && textValue.length > 0 && textValue.length < 10 && (
          <p
            role="alert"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-weak-text)',
              marginTop: 'var(--space-1)',
            }}
          >
            Escribe al menos 10 caracteres en tu respuesta
          </p>
        )}
      </div>
    </fieldset>
  )
}
