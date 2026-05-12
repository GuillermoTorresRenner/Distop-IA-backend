---
description: Actualizar la documentación del proyecto (README.md, QA_TESTING.md, CHANGELOG.md) después de cambios en código, nuevas features o releases.
---

# Skill: Actualizar Documentación

> Workflow para mantener la documentación sincronizada con el código, asegurando que README.md, QA_TESTING.md y otros documentos reflejen el estado actual del proyecto.

## ¿Cuándo usar este skill?

- Después de implementar nuevas features
- Cuando cambias arquitectura o infraestructura
- Antes de un release
- Cuando detectas documentación obsoleta
- Para sincronizar métricas de QA

## Inputs requeridos

- **Tipo de actualización** (nueva feature, arquitectura, métricas, release)
- **Alcance** (módulo específico, sistema completo, sección particular)
- **Información a actualizar** (endpoints, modelos, métricas, etc.)

## Workflow paso a paso

### Paso 1: Identificar secciones a actualizar

**Criterios de decisión**:

**Si agregaste un módulo nuevo**:

- README.md → API y Documentación, Base de Datos, Características
- QA_TESTING.md → Métricas de cobertura, Historial
- CHANGELOG.md → Entrada en sección [Unreleased]

**Si agregaste endpoints**:

- README.md → Tabla de endpoints, Ejemplos de uso
- QA_TESTING.md → Tests implementados

**Si cambiaste arquitectura**:

- README.md → Arquitectura del Sistema, Diagrama
- README.md → Configuración, Deployment

**Si actualizaste infraestructura**:

- README.md → Instalación, Docker, Variables de entorno
- README.md → Deployment

**Si mejoraste métricas**:

- README.md → Estándares de Calidad ISO 25010
- QA_TESTING.md → Métricas actuales, Historial

---

### Paso 2: Actualizar README.md

**Invocar**: @documentator

**Para nueva feature/módulo**:

```
Actualiza README.md con el módulo [nombre]:

Información a documentar:
- Modelo Prisma: [Nombre] (campos: [lista])
- Endpoints: [lista completa con métodos]
- Paginación: [Sí/No], filtros disponibles
- Autenticación: JWT requerido
- Roles: [especificar por endpoint]
- Cobertura: [X]%
- Performance: p95 [X]ms

Secciones a actualizar:
1. Arquitectura (si aplica)
2. API y Documentación (tabla de endpoints + ejemplos)
3. Base de Datos (modelo Prisma)
4. Características Implementadas (agregar módulo)
5. Métricas de Calidad (actualizar cobertura)
6. Roadmap (marcar como completado si aplica)
```

**Para cambio de arquitectura**:

```
Actualiza README.md con cambios de arquitectura:

Cambios realizados:
- [Descripción del cambio 1]
- [Descripción del cambio 2]

Actualizar:
1. Diagrama de arquitectura (ASCII art)
2. Descripción de componentes
3. Flujo de datos (si cambió)
4. Configuración necesaria
5. Variables de entorno nuevas/modificadas
```

**Para actualización de infraestructura**:

```
Actualiza README.md con cambios de infraestructura:

Cambios en Docker/Deployment:
- [Cambio 1]
- [Cambio 2]

Actualizar:
1. Sección de Instalación
2. Docker Compose (instrucciones)
3. Variables de entorno
4. Deployment
5. Configuración por entorno (dev/qa/prod)
```

**Criterios de calidad**:

- ✅ Todas las secciones identificadas actualizadas
- ✅ Ejemplos de código funcionales
- ✅ Tabla de contenidos actualizada si agregaste secciones
- ✅ Links internos funcionando
- ✅ Formato Markdown correcto
- ✅ Emojis consistentes

---

### Paso 3: Actualizar QA_TESTING.md

**Invocar**: @qa_tester

**Para nuevo módulo con tests**:

```
Actualiza QA_TESTING.md con tests del módulo [nombre]:

Métricas del módulo:
- Statements: XX%
- Branches: XX%
- Functions: XX%
- Lines: XX%
- Tests: XX tests passing

Tests implementados:
- Tests unitarios: [archivo.spec.ts] (XX tests)
- Tests integración: [archivo.spec.ts] (XX tests)
- Tests seguridad: [archivo.security.spec.ts] (XX tests)
- Tests stress: [archivo.stress.yml] (configurado)

Actualizar:
1. Tabla de cobertura por módulo
2. Cobertura global
3. Historial de testing (agregar entrada)
4. Métricas de performance (si aplica)
```

**Para actualización de métricas**:

```
Actualiza métricas en QA_TESTING.md:

Ejecuta:
1. npm run test:cov
2. npm run test (contar tests passing)
3. Leer coverage/lcov-report/index.html

Actualizar:
1. Tabla de cobertura por módulo (con métricas actuales)
2. Cobertura global
3. Total de tests
4. Fecha de última actualización
```

**Para nueva estrategia de testing**:

```
Documenta nueva estrategia de testing en QA_TESTING.md:

Estrategia: [nombre] (ej: Tests de stress, Tests de accesibilidad)

Agregar sección con:
- Objetivo
- Herramientas utilizadas
- Archivos de configuración
- Patrón estándar
- Casos de prueba obligatorios
- Ejemplo de implementación
```

**Criterios de calidad**:

- ✅ Métricas actualizadas con valores reales
- ✅ Historial con fecha y descripción
- ✅ Cobertura global calculada correctamente
- ✅ Tests passing verificados

---

### Paso 4: Actualizar CHANGELOG.md

**Para nueva feature**:

```markdown
## [Unreleased]

### Added

- Módulo [nombre] con endpoints CRUD completos
- Tests unitarios e integración para [módulo]
- Documentación Swagger para [módulo]

### Changed

- [Si aplica]

### Fixed

- [Si aplica]

### Security

- [Si aplica]
```

**Para release**:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added

- [Features agregadas desde último release]

### Changed

- [Cambios en features existentes]

### Fixed

- [Bugs corregidos]

### Security

- [Mejoras de seguridad]
```

**Criterios de calidad**:

- ✅ Entrada en sección correcta ([Unreleased] o [Versión])
- ✅ Descripción clara y concisa
- ✅ Categoría correcta (Added/Changed/Fixed/Security)
- ✅ Formato consistente con entradas anteriores

---

### Paso 5: Sincronizar documentación con Swagger

**Validar que Swagger esté actualizado**:

```bash
# Iniciar servidor
npm run start:dev

# Abrir Swagger
# http://localhost:3000/api

# Verificar:
# - Todos los módulos aparecen
# - Todos los endpoints documentados
# - Ejemplos de request/response presentes
# - DTOs con @ApiProperty
# - Descripciones claras
```

**Si Swagger está desactualizado**:

**Invocar**: @backend

```
Actualiza documentación Swagger:

Módulo: [nombre]

Asegúrate que todos los endpoints tengan:
- @ApiTags('[Nombre del módulo]')
- @ApiOperation({ summary: '[descripción]' })
- @ApiResponse({ status: 200, description: '[descripción]', type: [Tipo] })
- @ApiResponse({ status: 404, description: 'Not found' })
- DTOs con @ApiProperty({ description: '[desc]', example: '[ejemplo]' })

Verifica que aparezca correctamente en http://localhost:3000/api
```

---

### Paso 6: Validar documentación actualizada

**Checklist de validación**:

- [ ] README.md actualizado con toda la información relevante
- [ ] QA_TESTING.md sincronizado con métricas actuales
- [ ] CHANGELOG.md con entrada para cambios recientes
- [ ] Swagger completo y accesible
- [ ] Tabla de contenidos actualizada (si aplica)
- [ ] Links internos funcionan correctamente
- [ ] Ejemplos de código son ejecutables
- [ ] Variables de entorno documentadas
- [ ] No hay secciones obsoletas o contradictorias

**Validación de ejemplos**:

```bash
# Copiar un ejemplo de curl del README
# Ejecutarlo con un token válido
# Verificar que funcione como está documentado

curl -X [METHOD] http://localhost:3000/api/[endpoint] \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[body del ejemplo]'

# La respuesta debe coincidir con el ejemplo en README
```

**Validación de coherencia**:

- README dice que hay X módulos → Verificar que todos estén documentados
- QA_TESTING dice cobertura Y% → Verificar con `npm run test:cov`
- README dice endpoint Z existe → Verificar en Swagger
- README dice variable de entorno W necesaria → Verificar en .env.example

---

## Resultado esperado

✅ **README.md actualizado** con toda la información relevante
✅ **QA_TESTING.md sincronizado** con métricas actuales
✅ **CHANGELOG.md actualizado** con últimos cambios
✅ **Swagger completo** y accesible
✅ **Documentación coherente** sin contradicciones
✅ **Ejemplos funcionales** y verificados

---

## Ejemplo de uso

### Caso 1: Después de crear módulo

```
Usa el skill update-docs después de crear módulo "reports":

Tipo: Nueva feature
Módulo: reports
Endpoints: GET/POST/PATCH/DELETE /api/reports
Modelo: Reports (id, title, type, userId, data, createdAt)
Tests: 18 tests, 87% coverage
Performance: p95 142ms

Actualiza README.md, QA_TESTING.md y CHANGELOG.md
```

### Caso 2: Antes de release

```
Usa el skill update-docs para release v1.2.0:

Tipo: Release
Versión: 1.2.0
Features nuevas: [lista]
Bugs corregidos: [lista]

Actualiza CHANGELOG.md con nueva versión y verifica que README.md esté sincronizado.
```

### Caso 3: Cambio de arquitectura

```
Usa el skill update-docs después de agregar RabbitMQ:

Tipo: Cambio de arquitectura
Componente nuevo: RabbitMQ para colas asíncronas
Impacto: Procesamiento asíncrono de tareas pesadas

Actualiza diagrama de arquitectura y sección de configuración en README.md
```

### Caso 4: Actualización de métricas

```
Usa el skill update-docs para sincronizar métricas de QA:

Tipo: Actualización de métricas
Alcance: Proyecto completo

Ejecuta tests, obtén cobertura actual y actualiza README.md y QA_TESTING.md con valores reales.
```

---

## Troubleshooting

### Error: Documentación contradictoria

**Causa**: Múltiples fuentes de verdad no sincronizadas
**Solución**: Usar README.md como fuente única, derivar otros documentos de ahí

### Error: Ejemplos no funcionan

**Causa**: Código cambió pero ejemplos no se actualizaron
**Solución**: Probar todos los ejemplos manualmente, actualizarlos

### Error: Métricas no coinciden

**Causa**: QA_TESTING.md no actualizado después de agregar tests
**Solución**: Ejecutar `npm run test:cov`, leer resultados, actualizar

### Error: Swagger vacío o incompleto

**Causa**: Decoradores faltantes en controllers
**Solución**: Agregar @ApiTags, @ApiOperation, @ApiResponse a todos los endpoints

---

## Skills relacionados

- `new-module` - Crear módulo (incluye documentación)
- `add-endpoint` - Agregar endpoint (incluye documentación)
- `run-qa-audit` - Auditar incluyendo documentación
- `integrate-microservice` - Integrar microservicio (incluye documentación)
