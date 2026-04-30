-- Story 10.1: Seed de 5 tipos de project_templates (Phase 2)
-- Idempotente gracias a ON CONFLICT (type) DO UPDATE
INSERT INTO project_templates (type, name, description_structure, reviewer_context)
VALUES
  (
    'saas',
    'Producto SaaS',
    '{
      "problem": {
        "placeholder": "Ej: Los equipos de marketing tardan días en configurar sus campañas de email porque...",
        "example": "Los product managers de startups B2B pierden 3+ horas semanales en tareas de reporting manual..."
      },
      "solution": {
        "placeholder": "Ej: Una plataforma que automatiza la segmentación y el scheduling con una integración...",
        "example": "Un dashboard centralizado que conecta con las fuentes de datos existentes y genera reportes automáticos..."
      }
    }',
    'Para productos SaaS, el feedback más útil aborda: (1) si el dolor es real en tu contexto, (2) si pagarías por resolverlo, (3) qué alternativa usas ahora y por qué cambiarías.'
  ),
  (
    'feature',
    'Feature de producto existente',
    '{
      "problem": {
        "placeholder": "Ej: Los usuarios de nuestra app pierden tiempo porque no pueden hacer X desde el panel principal...",
        "example": "Nuestros usuarios tienen que alternar entre 3 pantallas para completar una tarea que debería ser un solo clic..."
      },
      "solution": {
        "placeholder": "Ej: Añadir un atajo directo en el dashboard que permita hacer X sin salir del contexto actual...",
        "example": "Un panel lateral deslizable con las acciones más frecuentes, disponible desde cualquier vista..."
      }
    }',
    'Para features de producto, el feedback más útil describe: (1) si tienes este problema en tu uso actual del producto, (2) con qué frecuencia lo encuentras, (3) cómo lo resuelves hoy (workaround).'
  ),
  (
    'internal_process',
    'Proceso interno',
    '{
      "problem": {
        "placeholder": "Ej: El proceso de onboarding de nuevos empleados tarda 2 semanas porque cada equipo tiene su propia lista...",
        "example": "Cada sprint planning toma 3 horas porque no tenemos un proceso estándar para priorizar..."
      },
      "solution": {
        "placeholder": "Ej: Un playbook centralizado con checklists por rol y herramientas de tracking de progreso...",
        "example": "Un proceso estandarizado de 4 pasos con responsables claros y criterios de completitud..."
      }
    }',
    'Para procesos internos, el feedback más útil explica: (1) si reconoces el problema en tu organización, (2) qué intentaste antes y por qué no funcionó, (3) qué resistencias anticipas en la adopción.'
  ),
  (
    'physical_product',
    'Producto físico',
    '{
      "problem": {
        "placeholder": "Ej: Los ciclistas urbanos no tienen una forma cómoda de llevar su laptop sin que se moje cuando llueve...",
        "example": "Las personas que trabajan en espacios compartidos necesitan una solución de almacenamiento portátil que..."
      },
      "solution": {
        "placeholder": "Ej: Una mochila con compartimento impermeable dedicado para laptop y apertura lateral para acceso rápido...",
        "example": "Un sistema modular de almacenamiento que se adapta a diferentes configuraciones según el contexto..."
      }
    }',
    'Para productos físicos, el feedback más útil cubre: (1) si tienes este problema y con qué frecuencia, (2) qué usas ahora y qué le falta, (3) a qué precio te parecería razonable y qué sería demasiado caro.'
  ),
  (
    'service',
    'Servicio',
    '{
      "problem": {
        "placeholder": "Ej: Las pymes no tienen acceso a consultoría de ciberseguridad porque el coste es prohibitivo para su tamaño...",
        "example": "Los autónomos del sector creativo pierden tiempo gestionando la contabilidad porque no encuentran un servicio..."
      },
      "solution": {
        "placeholder": "Ej: Un servicio de auditoría express de 2 horas orientado a pymes con un precio fijo y entregable claro...",
        "example": "Una suscripción mensual con acceso a un equipo especializado para consultas puntuales y revisiones periódicas..."
      }
    }',
    'Para servicios, el feedback más útil explica: (1) si contrataría este servicio o lo recomendaría a alguien, (2) qué te genera desconfianza o dudas, (3) qué incluiría o excluiría del alcance.'
  )
ON CONFLICT (type) DO UPDATE SET
  name = EXCLUDED.name,
  description_structure = EXCLUDED.description_structure,
  reviewer_context = EXCLUDED.reviewer_context;
