---
description: Configurar y validar entornos de desarrollo, QA y producción, asegurando aislamiento, coherencia de configuración y prevención de conflictos.
---

# Skill: Configurar y Validar Entorno

> Workflow para configurar correctamente los entornos (dev/qa/prod), validar aislamiento, sincronizar variables de entorno y prevenir conflictos en infraestructura compartida.

## ¿Cuándo usar este skill?

- Setup inicial del proyecto
- Configurar nuevo entorno (qa o prod)
- Validar aislamiento entre entornos
- Sincronizar variables de entorno
- Antes de deployment
- Después de agregar microservicios

## Inputs requeridos

- **Entorno a configurar** (dev, qa, prod, todos)
- **Acción** (setup inicial, validación, sincronización)
- **Componentes** (backend, base de datos, RabbitMQ, microservicios)

## Workflow paso a paso

### Paso 1: Configurar variables de entorno

**Crear/actualizar archivos .env**:

**Para desarrollo (.env)**:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5438/lanek_dev?schema=public"
DB_HOST=localhost
DB_PORT=5438
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=lanek_dev

# JWT
JWT_SECRET=dev_secret_change_in_production_123456789
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=dev_refresh_secret_change_in_production
JWT_REFRESH_EXPIRES_IN=7d

# App
PORT=3000
NODE_ENV=development

# RabbitMQ (si aplica)
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE_TASKS=tasks.processing.dev

# Shared volumes (si aplica)
SHARED_VOLUME_PATH=/app/shared/dev
```

**Para QA (.env.qa)** - Copiar como Secret en GitHub:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres_qa@localhost:5439/lanek_qa?schema=public"
DB_HOST=localhost
DB_PORT=5439
DB_USER=postgres
DB_PASSWORD=postgres_qa_secure_password
DB_NAME=lanek_qa

# JWT
JWT_SECRET=qa_secret_very_secure_string_789
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=qa_refresh_secret_very_secure
JWT_REFRESH_EXPIRES_IN=7d

# App
PORT=3001
NODE_ENV=qa

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5673
RABBITMQ_QUEUE_TASKS=tasks.processing.qa

# Shared volumes
SHARED_VOLUME_PATH=/app/shared/qa
```

**Para Producción (.env.prod)** - Copiar como Secret en GitHub:

```bash
# Database
DATABASE_URL="postgresql://postgres:prod_password@localhost:5432/lanek_prod?schema=public"
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=super_secure_production_password
DB_NAME=lanek_prod

# JWT
JWT_SECRET=production_secret_super_secure_random_string_xyz
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=prod_refresh_secret_super_secure_random
JWT_REFRESH_EXPIRES_IN=7d

# App
PORT=3002
NODE_ENV=production

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE_TASKS=tasks.processing.prod

# Shared volumes
SHARED_VOLUME_PATH=/app/shared/prod
```

**Actualizar .env.example**:

```bash
# Copiar estructura de .env pero con valores de ejemplo
# No incluir valores reales
# Documentar cada variable
```

**Invocar**: @devops

```
Valida configuración de variables de entorno:

Verifica que:
1. .env existe para desarrollo
2. .env.example está actualizado con todas las variables (sin valores reales)
3. Secrets de GitHub están configurados:
   - QA_ENV (contenido de .env.qa)
   - PROD_ENV (contenido de .env.prod)
4. No hay valores hardcodeados en el código
5. Todas las variables están documentadas

Genera lista de variables faltantes o mal configuradas.
```

---

### Paso 2: Configurar Docker Compose

**Invocar**: @devops

**Para desarrollo (docker-compose.dev.yml)**:

```
Configura docker-compose.dev.yml:

Servicios:
- backend (puerto 3000)
- postgres (puerto 5438, database: lanek_dev)
- [RabbitMQ si aplica] (puerto 5672 interno, 15672 management)
- [Microservicios si aplica]

Configuración:
- Variables desde .env
- Volúmenes para desarrollo (hot reload)
- Networks: lanek-dev
- Restart: on-failure
```

**Para QA (docker-compose.qa.yml)**:

```
Configura docker-compose.qa.yml:

Servicios:
- backend (puerto 3001)
- postgres (puerto 5439, database: lanek_qa)
- [RabbitMQ si aplica] (puerto 5673 interno, 15673 management)
- [Microservicios si aplica]

IMPORTANTE:
- No hay conflictos de puertos con prod
- No hay cruces de volúmenes
- No hay cruces de bases de datos
- Network: lanek-qa (aislada)
- Restart: always
```

**Para Producción (docker-compose.yml)**:

```
Configura docker-compose.yml:

Servicios:
- backend (puerto 3002)
- postgres (puerto 5432, database: lanek_prod)
- [RabbitMQ si aplica] (puerto 5672 interno, 15672 management)
- [Microservicios si aplica]

IMPORTANTE:
- No hay conflictos de puertos con qa
- No hay cruces de volúmenes
- No hay cruces de bases de datos
- Network: lanek-prod (aislada)
- Restart: always
- Límites de recursos configurados
- Healthchecks configurados
```

**Criterios de calidad**:

- ✅ Puertos únicos por entorno
- ✅ Bases de datos separadas
- ✅ Volúmenes aislados
- ✅ Networks aisladas
- ✅ Variables de entorno específicas
- ✅ No hay hardcoded values

---

### Paso 3: Validar aislamiento de entornos

**Invocar**: @devops

```
Valida aislamiento completo entre qa y prod:

Checklist de validación:
1. **Puertos**
   - Backend: qa=3001, prod=3002 ✅
   - PostgreSQL: qa=5439, prod=5432 ✅
   - RabbitMQ: qa=5673, prod=5672 ✅
   - RabbitMQ Management: qa=15673, prod=15672 ✅

2. **Bases de datos**
   - Nombres diferentes: lanek_qa vs lanek_prod ✅
   - Usuarios diferentes (recomendado) ✅
   - Contraseñas diferentes ✅
   - No hay shared schemas ✅

3. **Volúmenes**
   - Paths diferentes: /app/shared/qa vs /app/shared/prod ✅
   - No hay overlapping ✅
   - Permisos correctos ✅

4. **Networks**
   - Networks separadas: lanek-qa vs lanek-prod ✅
   - No hay comunicación entre networks ✅

5. **Colas RabbitMQ**
   - Prefijos diferentes: *.qa vs *.prod ✅
   - Exchanges separados ✅

6. **Secrets y configuración**
   - JWT_SECRET diferentes ✅
   - Contraseñas de DB diferentes ✅
   - No hay valores compartidos sensibles ✅

Genera reporte de validación con cualquier conflicto encontrado.
```

**Validación manual**:

```bash
# Levantar QA
docker-compose -f docker-compose.qa.yml up -d

# Verificar puertos QA
docker ps | grep qa

# Levantar Prod (en otra terminal o después de bajar QA)
docker-compose -f docker-compose.yml up -d

# Verificar puertos Prod
docker ps | grep prod

# Verificar que no haya conflictos
netstat -tuln | grep -E '3001|3002|5439|5432|5673|5672'

# Verificar bases de datos separadas
docker exec [postgres-container] psql -U postgres -l

# Verificar networks
docker network ls | grep lanek

# Verificar volúmenes
docker volume ls | grep lanek
```

---

### Paso 4: Sincronizar secrets de GitHub

**Invocar**: @devops

```
Configura GitHub Secrets:

Secrets necesarios:

1. **QA_ENV**
   - Contenido completo de .env.qa
   - Usado en .github/workflows/qa.yml

2. **PROD_ENV**
   - Contenido completo de .env.prod
   - Usado en .github/workflows/prod.yml

3. **SSH_PRIVATE_KEY** (si aplica deployment)
   - Clave SSH para acceder a VPS

4. **VPS_HOST** (si aplica)
   - IP o dominio del VPS

5. **VPS_USER** (si aplica)
   - Usuario para SSH

Proceso:
1. Ir a GitHub repo → Settings → Secrets and variables → Actions
2. New repository secret
3. Nombre: [SECRET_NAME]
4. Value: [contenido del .env correspondiente]
5. Add secret

Verifica que workflows puedan acceder a los secrets.
```

**Validar en workflows**:

**.github/workflows/qa.yml**:

```yaml
env:
  QA_ENV: ${{ secrets.QA_ENV }}

steps:
  - name: Setup environment
    run: echo "$QA_ENV" > .env
```

**.github/workflows/prod.yml**:

```yaml
env:
  PROD_ENV: ${{ secrets.PROD_ENV }}

steps:
  - name: Setup environment
    run: echo "$PROD_ENV" > .env
```

---

### Paso 5: Validar workflows CI/CD

**Invocar**: @devops

```
Valida workflows de CI/CD:

Archivo: .github/workflows/qa.yml
- Triggers correctos (PR a develop/main, push a develop)
- Tests ejecutados
- Environment: qa
- Secrets: QA_ENV usado correctamente
- Deployment a entorno QA (si aplica)

Archivo: .github/workflows/prod.yml
- Triggers correctos (push a main, release)
- Security audit ejecutado
- Stress tests ejecutados
- Environment: production
- Secrets: PROD_ENV usado correctamente
- Deployment a entorno Prod (si aplica)
- Aprobación manual configurada (recomendado)

Verifica que:
- No hay hardcoded values
- Secrets se cargan correctamente
- Environment variables están disponibles
- Tests pasan en CI
- Deployment es seguro
```

---

### Paso 6: Testing de configuración

**Test 1: Desarrollo local**

```bash
# Copiar .env.example a .env
cp .env.example .env

# Editar con valores de desarrollo
nano .env

# Levantar entorno
docker-compose -f docker-compose.dev.yml up -d

# Verificar logs
docker logs backend-dev

# Verificar API
curl http://localhost:3000/api/health

# Verificar DB
docker exec postgres-dev psql -U postgres -d lanek_dev -c "\dt"

# Bajar
docker-compose -f docker-compose.dev.yml down
```

**Test 2: QA**

```bash
# Simular workflow de QA localmente
echo "$QA_ENV_CONTENT" > .env

# Levantar
docker-compose -f docker-compose.qa.yml up -d

# Verificar
curl http://localhost:3001/api/health

# Logs
docker logs backend-qa

# Bajar
docker-compose -f docker-compose.qa.yml down
```

**Test 3: Producción (staging local)**

```bash
# Simular prod localmente
echo "$PROD_ENV_CONTENT" > .env

# Levantar
docker-compose -f docker-compose.yml up -d

# Verificar
curl http://localhost:3002/api/health

# Logs
docker logs backend-prod

# Bajar
docker-compose -f docker-compose.yml down
```

---

### Paso 7: Documentar configuración

**Invocar**: @documentator

````
Actualiza README.md con configuración de entornos:

Agregar/actualizar sección: ## 📦 Instalación y Configuración

Subsecciones:

**Prerrequisitos**:
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15 (si local)

**Variables de entorno**:
- Copiar .env.example a .env
- Configurar variables según entorno
- Lista de variables requeridas

**Desarrollo local**:
```bash
docker-compose -f docker-compose.dev.yml up -d
npm run start:dev
````

**Entorno QA** (en VPS):

- Puerto: 3001
- Base de datos: lanek_qa (puerto 5439)
- Network: lanek-qa

**Entorno Producción** (en VPS):

- Puerto: 3002
- Base de datos: lanek_prod (puerto 5432)
- Network: lanek-prod

**Aislamiento**:

- Puertos, bases de datos, volúmenes y networks separados
- Variables de entorno específicas
- No hay cruces entre entornos

Incluir diagrama de arquitectura actualizado si aplica.

```

---

## Resultado esperado

✅ **Variables de entorno** configuradas para todos los entornos
✅ **.env.example** actualizado y documentado
✅ **GitHub Secrets** configurados (QA_ENV, PROD_ENV)
✅ **Docker Compose** configurado para dev/qa/prod sin conflictos
✅ **Aislamiento validado** (puertos, DBs, volumes, networks)
✅ **Workflows CI/CD** funcionales y seguros
✅ **Documentación actualizada** con instrucciones de setup

---

## Ejemplo de uso

### Caso 1: Setup inicial
```

Usa el skill setup-environment para configuración inicial:

Acción: Setup completo
Entornos: dev, qa, prod
Componentes: backend, PostgreSQL

Configura variables de entorno, docker-compose, secrets de GitHub y valida aislamiento.

```

### Caso 2: Agregar microservicio
```

Usa el skill setup-environment después de agregar microservicio "data-analyzer":

Acción: Agregar componente
Entornos: todos
Componente: microservicio data-analyzer

Actualiza docker-compose para incluir microservicio con puertos/volumes aislados por entorno.

```

### Caso 3: Validación antes de deployment
```

Usa el skill setup-environment antes de deployment a producción:

Acción: Validación
Entorno: prod

Valida aislamiento completo, secrets sincronizados, workflows funcionales.

```

---

## Troubleshooting

### Error: Conflicto de puertos
**Causa**: Mismo puerto usado en qa y prod
**Solución**: Asignar puertos únicos, documentar en docker-compose

### Error: Bases de datos cruzadas
**Causa**: Ambos entornos apuntan a misma DB
**Solución**: Verificar DATABASE_URL en .env, usar nombres distintos

### Error: Secrets no se cargan en GitHub Actions
**Causa**: Secrets mal configurados o typo en nombre
**Solución**: Verificar nombre exacto en Settings → Secrets, revisar workflows

### Error: Volúmenes compartidos entre entornos
**Causa**: Paths de volúmenes no separados
**Solución**: Usar paths específicos por entorno (/app/shared/qa vs /app/shared/prod)

---

## Skills relacionados

- `integrate-microservice` - Agregar microservicio a entornos
- `run-qa-audit` - Auditar configuración de infraestructura
- `update-docs` - Documentar configuración
```
