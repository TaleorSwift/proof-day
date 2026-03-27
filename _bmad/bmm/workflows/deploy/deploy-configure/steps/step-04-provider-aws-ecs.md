# Step 4: Platform-Specific Configuration — AWS ECS

This step is loaded when the user selected **AWS ECS** as the target platform.

---

## Action 1: ECR Repository

If AWS MCP is available, propose creating the ECR repository:

```
📋 ACCIÓN PROPUESTA: Crear repositorio ECR
   - Nombre: <project_name>
   - Región: <region>
   - Scan on push: Enabled (escanea vulnerabilidades automáticamente)
   - Lifecycle policy: Mantener últimas 10 imágenes, eliminar el resto
   
   💰 Coste estimado: ~$0.10/GB/mes de almacenamiento de imágenes
```

> ¿Procedo? **[C]** Continuar / **[E]** Editar / **[S]** Saltar

If MCP NOT available:
> Sin AWS MCP, no puedo crear el repositorio directamente.
> Genera el repositorio manualmente en AWS Console > ECR, o configura el MCP con /setup-mcps.
> El nombre recomendado es: `<project_name>`

---

## Action 2: ECS Task Definition

Generate the task definition file:

```
📋 ACCIÓN PROPUESTA: Crear ecs-task-definition.json

{
  "family": "<project_name>",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "<to be configured>",
  "taskRoleArn": "<to be configured>",
  "containerDefinitions": [
    {
      "name": "<project_name>",
      "image": "<ecr_url>:<tag>",
      "essential": true,
      "portMappings": [
        {
          "containerPort": <port>,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "<port>"}
      ],
      "secrets": [
        <mapped from .env.example sensitive vars via AWS Secrets Manager>
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/<project_name>",
          "awslogs-region": "<region>",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget -qO- http://localhost:<port>/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

Explain the key decisions:
> **Fargate** — no gestionas servidores, solo pagas por uso.
> **256 CPU / 512 MB** — configuración mínima, suficiente para arrancar. Escalar después.
> **awsvpc** — cada tarea tiene su propia IP, necesario para Fargate.
> 
> 💰 Coste estimado: ~$9-15/mes por tarea running 24/7 en Fargate (256/512)

> ¿Procedo? **[C]** Continuar / **[E]** Editar recursos (CPU/memoria) / **[S]** Saltar

---

## Action 3: ECS Service Configuration

Generate a reference configuration for the ECS service:

```
📋 CONFIGURACIÓN DE SERVICIO ECS (referencia para deploy):

Service: <project_name>-<environment>
Cluster: <project_name>-cluster (o existente)
Launch type: FARGATE
Desired count: 1 (staging) / 2 (production, para alta disponibilidad)
Deployment:
  - Type: Rolling update
  - Min healthy: 100%
  - Max: 200%
Load Balancer:
  - Type: Application Load Balancer (ALB)
  - Health check path: /health
  - Health check interval: 30s
Auto Scaling (production):
  - Min: 2, Max: 4
  - Scale on CPU > 70%
  - Scale on Memory > 80%

💰 Coste estimado total (producción con 2 tareas + ALB):
   - Fargate: ~$18-30/mes
   - ALB: ~$16-22/mes
   - Total: ~$34-52/mes
```

> Esta configuración se usará cuando ejecutes "Wiggum, DD" para desplegar.
> ¿Guardo esta referencia? **[C]** Continuar / **[E]** Editar / **[S]** Saltar

---

## Action 4: IAM Policies Reference

Generate a reference for the IAM roles needed:

```
📋 ROLES IAM NECESARIOS:

1. ecsTaskExecutionRole (ya suele existir por defecto)
   - AmazonECSTaskExecutionRolePolicy
   - Acceso a ECR (pull images)
   - Acceso a CloudWatch Logs
   - Acceso a Secrets Manager (si usas secrets)

2. ecsTaskRole (permisos de tu aplicación)
   - Solo los permisos que tu app necesita en runtime
   - Ej: acceso a S3 buckets específicos, DynamoDB, SQS, etc.

3. CI/CD User (para GitHub Actions)
   - ecr:GetAuthorizationToken
   - ecr:BatchCheckLayerAvailability, PutImage, InitiateLayerUpload, etc.
   - ecs:UpdateService, DescribeServices, RegisterTaskDefinition
   - iam:PassRole (para las task roles)
```

> Esta referencia se guardará en la documentación de despliegue.
> No necesitas crearlos ahora — se configurarán al ejecutar el primer deploy.

---

## Step Summary

```
AWS ECS CONFIGURATION:
├── ECR Repository:      [✅ CREATED | 📋 DOCUMENTED | ⏭ SKIPPED]
├── Task Definition:     [✅ | ❌ | ⏭]
│   CPU/Memory: <values>
│   Port: <port>
├── Service Config:      [📋 DOCUMENTED]
│   Environments: <list>
│   Scaling: <config>
├── IAM Reference:       [📋 DOCUMENTED]
├── Estimated cost:      ~$<range>/mes (production)
└── MCP mode:            [DIRECT | ARTIFACT-ONLY]
```

Present menu:
- **[C] Continue** — proceed to final verification and documentation
- **[R] Retry** — retry any failed action
