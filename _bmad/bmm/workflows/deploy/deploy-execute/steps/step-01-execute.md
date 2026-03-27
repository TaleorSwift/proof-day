# Step 1: Execute Deployment

## Step 0: Pre-flight Checks (MANDATORY)

### Check 1: Deployment configuration exists

Look for `docs/project/deployment-setup.md` and the deployment artifacts:

If NOT found:
```
⚠️ No encuentro configuración de despliegue.
Ejecuta "Wiggum, DC" primero para generar Dockerfile, pipeline y configs.
```
**[HALT]**

### Check 2: MCP available

Attempt to connect to the platform MCP.

If NOT available:
```
MCP DEPENDENCY CHECK:
- <Platform> MCP Server: ❌ NOT AVAILABLE

⚠️ Para ejecutar el despliegue necesito el MCP de <platform>.
Ejecuta /setup-mcps para configurarlo.

Alternativa: usa el pipeline CI/CD directamente haciendo push a la rama correspondiente.
```
**[HALT]**

### Check 3: Secture Adaptation

```
ARTIFACT INVENTORY:
- Deployment config:   [PRESENT]
- Platform MCP:        [✅ CONNECTED]
- Last deployment:     [<date> | NEVER DEPLOYED]
- Current environment: <check running services>
```

```
EXECUTION MODE: [VERIFY | REFINE | GENERATE]
Reasoning: <justification>
```

**Wait for [C].**

---

## Select Target Environment

> {user_name}, ¿a qué entorno quieres desplegar?

List available environments based on deployment-setup.md:

| Entorno | Estado actual | Última versión | Acción |
|---------|--------------|---------------|--------|
| development | 🟢 Running | abc123 (hace 2h) | Actualizar |
| staging | 🟡 Outdated | def456 (hace 3d) | Actualizar |
| production | 🟢 Running | ghi789 (hace 1 sem) | ⚠️ Requiere doble confirmación |

---

## Select Version to Deploy

> ¿Qué versión desplegamos?

| Opción | Descripción |
|--------|-------------|
| **Latest (develop)** | Último commit en develop |
| **Latest (main)** | Último commit en main |
| **Specific commit** | Indicar SHA del commit |
| **Specific tag** | Indicar tag (ej: v1.2.3) |

---

## Execute Deployment — AWS ECS

### For Development / Staging:

```
📋 ACCIÓN PROPUESTA: Deploy a <environment>

Pasos que voy a ejecutar:
1. Build Docker image con tag <commit_sha>
2. Push image a ECR: <ecr_url>:<tag>
3. Actualizar task definition con nueva imagen
4. Actualizar ECS service para usar nueva task definition
5. Esperar a que el servicio se estabilice
6. Verificar health check

💰 Coste adicional: Ninguno (misma infraestructura, nueva versión)
⏱️ Tiempo estimado: 3-5 minutos
```

> ¿Procedo? **[C]** Continuar / **[S]** Cancelar

**On [C]:** Execute each step via AWS MCP, reporting progress:

```
DEPLOYMENT PROGRESS: <environment>

[1/6] 🔨 Building Docker image...
      ✅ Image built: <image_id> (45s)

[2/6] 📤 Pushing to ECR...
      ✅ Pushed: <ecr_url>:<tag> (30s)

[3/6] 📝 Updating task definition...
      ✅ New revision: <project>:<revision>

[4/6] 🔄 Updating ECS service...
      ✅ Service update initiated

[5/6] ⏳ Waiting for stabilization...
      ✅ Service stable (2 running tasks, 0 pending)

[6/6] 🏥 Health check...
      ✅ All tasks healthy

✅ DEPLOY COMPLETE: <environment>
   Version: <commit_sha>
   URL: <service_url>
   Time: 3m 42s
```

If any step fails:
```
❌ DEPLOY FAILED at step [X/6]: <step_name>
   Error: <error_message>
   
   Options:
   - [R] Retry this step
   - [B] Rollback to previous version
   - [S] Stop and investigate
```

### For Production (DOUBLE CONFIRMATION):

```
⚠️ ═══════════════════════════════════════════════ ⚠️
║                                                   ║
║   DEPLOY A PRODUCCIÓN                             ║
║                                                   ║
║   Versión: <commit_sha>                           ║
║   Desde: <branch>                                 ║
║   Cambios: <count> commits desde último deploy    ║
║                                                   ║
║   Esto afecta a USUARIOS REALES.                  ║
║                                                   ║
⚠️ ═══════════════════════════════════════════════ ⚠️

Primera confirmación: ¿Quieres continuar? [C] / [S]
```

After first [C]:

```
Segunda confirmación: Escribe "DEPLOY PRODUCTION" para confirmar:
```

Only proceed if user types exactly "DEPLOY PRODUCTION".

Then execute the same steps as staging, with the addition of:
- Pre-deploy: take a snapshot/tag of current running version for rollback
- Post-deploy: monitor for 2 minutes for error spikes
- Report: include rollback command in case of issues

---

## Post-Deploy Verification

After successful deployment:

```
POST-DEPLOY CHECK: <environment>
├── Service status:  🟢 Healthy
├── Running tasks:   <count>
├── Response time:   <avg ms>
├── Error rate:      <percentage>
├── Version:         <commit_sha>
└── URL:             <url>

📌 Rollback command (if needed):
   "Wiggum, DD" → seleccionar versión anterior <previous_sha>
```

---

## Completion

> Deploy completado. ¿Algo más?
> - **[DT]** Ver estado completo de todos los entornos
> - **[DD]** Desplegar a otro entorno
> - **[X]** Salir
