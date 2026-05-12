---
description: Ejecutar una auditoría completa de calidad del proyecto, validando cobertura de tests, performance, seguridad, documentación y cumplimiento de estándares ISO 25010.
---

# Skill: Auditoría Completa de QA

> Workflow para ejecutar una auditoría exhaustiva de calidad en todo el proyecto, generando reporte completo con métricas, issues encontrados y recomendaciones.

## ¿Cuándo usar este skill?

- Antes de un release importante
- Para validar cumplimiento ISO 25010
- Cuando necesitas un reporte completo de calidad
- Para identificar gaps en testing o documentación
- Preparación para certificación

## Inputs requeridos

- **Alcance** (módulos específicos o proyecto completo)
- **Nivel de detalle** (básico, completo, exhaustivo)

## Workflow paso a paso

### Paso 1: Auditoría de cobertura de tests

**Invocar**: @qa_tester

**Prompt**:

```
Ejecuta auditoría completa de tests:

Alcance: [proyecto completo | módulos específicos]

Por favor:
1. Ejecuta todos los tests (unit + integration + e2e + security)
2. Genera reporte de cobertura completo
3. Identifica módulos con cobertura <80%
4. Lista archivos críticos sin tests
5. Verifica que tests de seguridad pasen
6. Ejecuta tests de stress en endpoints principales
7. Genera métricas de performance (p50, p95, p99)

Reporta:
- Cobertura global y por módulo
- Tests fallando (si existen)
- Archivos sin cobertura
- Métricas de performance
- Issues de seguridad encontrados
```

**Validación**:

```bash
# Tests completos
npm test

# Cobertura
npm run test:cov

# E2E
npm run test:e2e

# Seguridad
npm run test:security

# Stress (si está configurado)
npm run stress:artillery
```

**Criterios de éxito**:

- ✅ Cobertura global ≥80%
- ✅ Todos los tests pasan
- ✅ Tests de seguridad pasan
- ✅ Performance dentro de objetivos (p95 < 200ms)
- ✅ Sin vulnerabilidades críticas

---

### Paso 2: Auditoría de código y estándares

**Acciones automáticas**:

```bash
# Lint
npm run lint

# Build
npm run build

# Prisma validate
npx prisma validate

# Prisma format
npx prisma format

# npm audit
npm audit --audit-level=moderate
```

**Invocar**: @backend

**Prompt**:

```
Revisa cumplimiento de estándares en el código:

Por favor valida:
1. **Decoradores obligatorios**
   - Todos los endpoints tienen @Auth()
   - Se usa @GetUser() para obtener usuario
   - Swagger completo (@ApiOperation, @ApiResponse)

2. **Paginación**
   - Todos los GET que retornan listas tienen paginación
   - Límite máximo configurado (100)
   - Meta información incluida

3. **DTOs**
   - Validación con class-validator
   - Documentación Swagger (@ApiProperty)
   - Tipos correctos

4. **Manejo de errores**
   - Uso apropiado de excepciones NestJS
   - Mensajes descriptivos
   - Códigos de estado correctos

5. **Código limpio**
   - No hay console.log
   - No hay código comentado innecesario
   - No hay TODOs críticos pendientes

Genera lista de issues encontrados con ubicación y solución sugerida.
```

**Criterios de éxito**:

- ✅ Lint sin errores
- ✅ Build exitoso
- ✅ Esquema Prisma válido
- ✅ npm audit sin vulnerabilidades altas
- ✅ Estándares cumplidos en todos los módulos

---

### Paso 3: Auditoría de documentación

**Invocar**: @documentator

**Prompt**:

```
Audita documentación del proyecto:

Validar que README.md esté actualizado:
1. **Arquitectura**
   - Diagrama refleja estado actual
   - Componentes documentados
   - Microservicios incluidos

2. **API**
   - Todos los módulos documentados
   - Tabla de endpoints completa
   - Ejemplos de uso actualizados

3. **Base de datos**
   - Todos los modelos Prisma documentados
   - Relaciones explicadas

4. **Testing**
   - Estrategia documentada
   - Cobertura actualizada
   - Comandos de testing listados

5. **Deployment**
   - Configuración Docker actualizada
   - Variables de entorno documentadas
   - Proceso de deployment explicado

6. **ISO 25010**
   - Métricas actualizadas
   - Cumplimiento documentado

Genera lista de secciones desactualizadas o faltantes.
```

**Validar QA_TESTING.md**:

```
Verifica que QA_TESTING.md esté actualizado:
- Métricas actuales
- Historial de testing
- Estrategias documentadas
- Workflows CI/CD documentados
```

**Criterios de éxito**:

- ✅ README.md completo y actualizado
- ✅ QA_TESTING.md actualizado
- ✅ CHANGELOG.md con últimos cambios
- ✅ Swagger accesible y documentado
- ✅ No hay secciones obsoletas

---

### Paso 4: Auditoría de infraestructura

**Invocar**: @devops

**Prompt**:

```
Audita infraestructura y CI/CD:

Validar:
1. **Docker Compose**
   - docker-compose.dev.yml funcional
   - docker-compose.qa.yml sin conflictos con prod
   - docker-compose.yml (prod) configurado correctamente
   - No hay cruce de puertos entre qa y prod
   - No hay cruce de volúmenes
   - No hay cruce de bases de datos
   - Networks aisladas por entorno

2. **Variables de entorno**
   - .env.example actualizado
   - Secrets de GitHub actualizados (qa y prod)
   - No hay valores hardcodeados
   - Variables documentadas

3. **Workflows CI/CD**
   - .github/workflows/qa.yml funcional
   - .github/workflows/prod.yml funcional
   - Tests incluidos en pipelines
   - Security checks configurados
   - Deployment automatizado

4. **Base de datos**
   - Migraciones aplicadas
   - Backups configurados (si aplica)
   - Scripts de restore funcionales

Genera lista de issues de configuración y riesgos de seguridad.
```

**Validación manual**:

```bash
# Levantar entorno dev
docker-compose -f docker-compose.dev.yml up -d

# Verificar servicios
docker ps

# Verificar logs
docker logs [backend-container]

# Detener
docker-compose -f docker-compose.dev.yml down
```

**Criterios de éxito**:

- ✅ Todos los docker-compose funcionales
- ✅ No hay conflictos entre entornos
- ✅ Variables de entorno sincronizadas
- ✅ Workflows CI/CD pasan
- ✅ No hay secretos expuestos

---

### Paso 5: Auditoría de integraciones

**Invocar**: @integrator (si aplica)

**Prompt**:

```
Audita integraciones con microservicios:

Validar:
1. **Especificaciones de integración**
   - Archivos en .github/integration/output/ actualizados
   - Esquemas de datos sincronizados
   - Protocolos documentados

2. **RabbitMQ** (si aplica)
   - Colas configuradas
   - Mensajes procesándose correctamente
   - DLQ configuradas
   - Monitoring funcional

3. **Volúmenes compartidos** (si aplica)
   - Paths accesibles
   - Permisos correctos
   - Limpieza automática configurada

4. **WebSocket** (si aplica)
   - Gateway funcional
   - Eventos documentados
   - Autenticación JWT

Genera lista de integraciones no funcionales o desactualizadas.
```

**Criterios de éxito**:

- ✅ Todas las integraciones funcionales
- ✅ Especificaciones actualizadas
- ✅ Comunicación bidireccional funciona
- ✅ No hay errores en logs

---

### Paso 6: Generar reporte de auditoría

**Consolidar resultados**:

```markdown
# Reporte de Auditoría QA - [Fecha]

## Resumen Ejecutivo

**Estado general**: ✅ Aprobado / ⚠️ Con observaciones / ❌ Requiere correcciones

**Métricas clave**:

- Cobertura de tests: XX%
- Tests passing: XX/XX
- Performance p95: XXms
- Vulnerabilidades: X
- Documentación: Completa/Incompleta

---

## 1. Tests y Cobertura

### Cobertura por módulo

| Módulo    | Statements | Branches | Functions | Lines | Estado   |
| --------- | ---------- | -------- | --------- | ----- | -------- |
| [Módulo1] | XX%        | XX%      | XX%       | XX%   | ✅/⚠️/❌ |
| ...       | ...        | ...      | ...       | ...   | ...      |

**Cobertura global**: XX% [✅/⚠️/❌]

### Tests

- Total tests: XX
- Passing: XX
- Failing: X
- Suites: XX

### Performance

- p50: XXms [✅/⚠️/❌]
- p95: XXms [✅/⚠️/❌]
- p99: XXms [✅/⚠️/❌]
- RPS: XX [✅/⚠️/❌]

### Seguridad

- Autenticación JWT: [✅/❌]
- RBAC: [✅/❌]
- Headers seguridad: [✅/❌]
- npm audit: X vulnerabilities [✅/⚠️/❌]

---

## 2. Código y Estándares

### Lint y Build

- ESLint: [✅/❌] X issues
- Build: [✅/❌]
- Prisma: [✅/❌]

### Cumplimiento de estándares

- ✅/❌ Decoradores @Auth en endpoints
- ✅/❌ Decoradores @GetUser implementados
- ✅/❌ Paginación en endpoints GET
- ✅/❌ Swagger completo
- ✅/❌ DTOs validados

### Issues encontrados

1. [CRÍTICO/MEDIO/BAJO] Descripción
   - Ubicación: archivo:línea
   - Solución: ...

---

## 3. Documentación

### README.md

- ✅/❌ Arquitectura actualizada
- ✅/❌ API documentada
- ✅/❌ Base de datos documentada
- ✅/❌ Métricas actualizadas

### QA_TESTING.md

- ✅/❌ Actualizado con últimas métricas
- ✅/❌ Historial completo

### Swagger

- ✅/❌ Accesible en /api
- ✅/❌ Todos los módulos incluidos

---

## 4. Infraestructura

### Docker

- ✅/❌ docker-compose.dev.yml funcional
- ✅/❌ docker-compose.qa.yml sin conflictos
- ✅/❌ docker-compose.yml (prod) configurado
- ✅/❌ No hay cruces entre entornos

### Variables de entorno

- ✅/❌ .env.example actualizado
- ✅/❌ Secrets de GitHub sincronizados
- ✅/❌ Variables documentadas

### CI/CD

- ✅/❌ Workflow QA funcional
- ✅/❌ Workflow Prod funcional
- ✅/❌ Tests en pipelines

---

## 5. Integraciones

[Si aplica]

- ✅/❌ Microservicios funcionales
- ✅/❌ RabbitMQ configurado
- ✅/❌ Volúmenes compartidos accesibles
- ✅/❌ WebSocket funcional

---

## 6. ISO 25010 - Cumplimiento

| Característica | Métrica         | Objetivo | Actual | Estado   |
| -------------- | --------------- | -------- | ------ | -------- |
| Funcionalidad  | Tests passing   | 100%     | XX%    | ✅/⚠️/❌ |
| Confiabilidad  | Coverage        | ≥80%     | XX%    | ✅/⚠️/❌ |
| Rendimiento    | p95 latency     | <200ms   | XXms   | ✅/⚠️/❌ |
| Seguridad      | Vulnerabilities | 0        | X      | ✅/⚠️/❌ |
| Mantenibilidad | Code quality    | A        | X      | ✅/⚠️/❌ |

---

## Recomendaciones

### Críticas (resolver inmediatamente)

1. [Descripción]
2. [Descripción]

### Importantes (resolver antes del próximo release)

1. [Descripción]
2. [Descripción]

### Mejoras sugeridas

1. [Descripción]
2. [Descripción]

---

## Conclusión

[Resumen del estado general del proyecto]

[Listo para producción / Requiere correcciones / No apto para despliegue]

---

**Auditoría realizada por**: QA Tester Agent
**Fecha**: [Fecha]
**Próxima auditoría recomendada**: [Fecha]
```

---

## Resultado esperado

✅ **Reporte completo de auditoría** con métricas detalladas
✅ **Lista de issues** priorizados (críticos, importantes, mejoras)
✅ **Estado de cumplimiento ISO 25010**
✅ **Recomendaciones** accionables
✅ **Visibilidad completa** del estado de calidad del proyecto

---

## Ejemplo de uso

```
Usa el skill run-qa-audit para auditoría completa:

Alcance: Proyecto completo
Nivel: Exhaustivo
Incluir: Tests, código, docs, infraestructura, integraciones

Genera reporte detallado con todas las métricas y recomendaciones.
```

---

## Skills relacionados

- `new-module` - Crear módulo con calidad desde inicio
- `add-endpoint` - Agregar endpoint con tests
- `update-docs` - Actualizar documentación
