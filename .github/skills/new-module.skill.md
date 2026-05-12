---
description: Crear un módulo CRUD completo en el backend con Prisma, NestJS, tests completos, documentación y validación de calidad. Workflow completo que coordina backend, qa_tester y documentator.
---

# Skill: Crear Módulo Backend Completo

> Workflow automatizado para crear un módulo CRUD completo con todas las capas: modelo Prisma, service, controller, DTOs, tests, documentación y validación de calidad ISO 25010.

## ¿Cuándo usar este skill?

- Necesitas crear un nuevo módulo con operaciones CRUD
- Quieres asegurar que todo el stack esté completo (DB → API → Tests → Docs)
- Requieres cumplir con estándares de calidad desde el inicio

## Inputs requeridos

Antes de iniciar, necesitas:

- **Nombre del módulo** (ej: "reports", "tasks", "projects")
- **Campos del modelo** (ej: "title: string, description: string, status: enum")
- **Relaciones** (ej: "belongsTo User", "hasMany Comments")
- **Roles de acceso** (ej: "ADMIN puede DELETE, USER puede ver solo los suyos")

## Workflow paso a paso

### Paso 1: Validar prerrequisitos

**Criterios de decisión**:

- ¿El nombre del módulo es único? → Buscar en `src/` si ya existe
- ¿Los campos están bien definidos? → Validar tipos de datos
- ¿Las relaciones son válidas? → Verificar que los modelos relacionados existan

**Acciones**:

```bash
# Verificar que no exista el módulo
ls src/ | grep -i "module-name"

# Verificar modelos relacionados en Prisma
cat prisma/schema/*.prisma | grep "model RelatedModel"
```

**Si algo falla**: Pedir aclaración al usuario antes de continuar

---

### Paso 2: Crear modelo Prisma

**Invocar**: @backend

**Prompt**:

```
Crea el modelo Prisma para [nombre_modulo]:

Campos:
- [campo1]: [tipo]
- [campo2]: [tipo]
- [campo3]: [tipo]

Relaciones:
- [relación1]
- [relación2]

Convenciones:
- Archivo: prisma/schema/[NombreModulo].prisma
- Incluir id, createdAt, updatedAt
- Usar @map para snake_case en DB
- Agregar índices donde sea necesario
```

**Criterios de calidad**:

- ✅ Archivo creado en `prisma/schema/[Nombre].prisma`
- ✅ Migración generada con nombre descriptivo
- ✅ Migración aplicada exitosamente
- ✅ Cliente Prisma regenerado

**Validación**:

```bash
# Verificar que la migración fue creada
ls prisma/migrations/ | tail -1

# Aplicar migración
npx prisma migrate dev --name add_[module_name]

# Regenerar cliente
npx prisma generate
```

---

### Paso 3: Crear módulo NestJS con CRUD completo

**Invocar**: @backend

**Prompt**:

```
Implementa el módulo NestJS completo para [nombre_modulo]:

Estructura requerida:
- Service con CRUD completo (create, findAll con paginación, findOne, update, remove)
- Controller con endpoints RESTful
- DTOs: CreateDto, UpdateDto, PaginationDto
- Module con imports necesarios

Requisitos:
- Decoradores @Auth() en todos los endpoints
- @GetUser() para obtener usuario autenticado
- Paginación con límite máximo 100
- Documentación Swagger completa (@ApiOperation, @ApiResponse, @ApiTags)
- Validación class-validator en DTOs
- Manejo de errores con NotFoundException, BadRequestException

Roles:
- [Especificar roles por endpoint]
```

**Criterios de calidad**:

- ✅ Service con lógica de negocio completa
- ✅ Controller con todos los endpoints documentados
- ✅ DTOs con decoradores de validación
- ✅ Paginación implementada correctamente
- ✅ Swagger completo en todos los endpoints
- ✅ Build exitoso sin errores

**Validación**:

```bash
# Compilar
npm run build

# Lint
npm run lint

# Verificar Swagger
npm run start:dev
# Abrir http://localhost:3000/api
```

---

### Paso 4: Implementar tests completos

**Invocar**: @qa_tester

**Prompt**:

```
Implementa todas las pruebas para el módulo [nombre_modulo]:

Archivos creados por backend:
- Service: src/[module]/[module].service.ts
- Controller: src/[module]/[module].controller.ts
- DTOs: src/[module]/dto/*.dto.ts

Endpoints implementados:
- POST /api/[module] ([ROLES])
- GET /api/[module] (paginación)
- GET /api/[module]/:id
- PATCH /api/[module]/:id
- DELETE /api/[module]/:id ([ROLES])

Por favor:
1. Implementa tests unitarios para service
2. Implementa tests de integración para controller
3. Implementa tests de seguridad (JWT, RBAC)
4. Configura tests de stress
5. Actualiza QA_TESTING.md con métricas
6. Verifica que workflows CI/CD incluyan los nuevos tests
```

**Criterios de calidad**:

- ✅ Tests unitarios creados (\*.service.spec.ts)
- ✅ Tests de integración creados (\*.controller.spec.ts)
- ✅ Tests de seguridad creados (tests/security/\*.security.spec.ts)
- ✅ Tests de stress configurados (tests/stress/\*.stress.yml)
- ✅ Todos los tests pasan
- ✅ Cobertura ≥80%
- ✅ QA_TESTING.md actualizado

**Validación**:

```bash
# Ejecutar tests del módulo
npm test -- [module]

# Verificar cobertura
npm run test:cov

# Leer QA_TESTING.md para confirmar actualización
```

---

### Paso 5: Actualizar documentación

**Invocar**: @documentator

**Prompt**:

```
Actualiza README.md con el módulo [nombre_modulo]:

Información a documentar:
- Modelo Prisma: [Nombre] con campos [lista de campos]
- Endpoints: [lista de endpoints con métodos y descripciones]
- Paginación: Sí, con filtros por [campos]
- Autenticación: JWT requerido
- Roles: [especificar roles por endpoint]
- Cobertura de tests: [X]%
- Performance: p95 [X]ms

Secciones a actualizar:
- API y Documentación (agregar endpoints)
- Base de Datos (agregar modelo)
- Características Implementadas (agregar módulo)
- Ejemplos de uso (request/response)
- Métricas de calidad (actualizar cobertura)
```

**Criterios de calidad**:

- ✅ README.md actualizado con nueva información
- ✅ Tabla de endpoints incluye todos los nuevos
- ✅ Modelo Prisma documentado
- ✅ Ejemplos de uso completos con curl
- ✅ Métricas actualizadas
- ✅ CHANGELOG.md actualizado si aplica

---

### Paso 6: Validación final

**Checklist de calidad**:

- [ ] Base de datos: Migración aplicada, modelo creado
- [ ] Backend: Service + Controller + DTOs implementados
- [ ] Swagger: Documentación completa visible en /api
- [ ] Tests: Unitarios + Integración + Seguridad + Stress
- [ ] Cobertura: ≥80% en el nuevo módulo
- [ ] Documentación: README.md y QA_TESTING.md actualizados
- [ ] Build: Compilación exitosa sin errores
- [ ] Lint: Sin errores de ESLint
- [ ] CI/CD: Workflows incluyen nuevos tests

**Validación completa**:

```bash
# Build
npm run build

# Tests
npm test

# Cobertura
npm run test:cov

# Lint
npm run lint

# Verificar Swagger
npm run start:dev
# Abrir http://localhost:3000/api y buscar el módulo
```

---

## Resultado esperado

Al finalizar este workflow, tendrás:

✅ **Modelo Prisma** en `prisma/schema/[Nombre].prisma`
✅ **Migración aplicada** en PostgreSQL
✅ **Módulo NestJS** completo en `src/[module]/`
✅ **Tests completos** con cobertura ≥80%
✅ **Documentación Swagger** en `/api`
✅ **README.md actualizado** con API y ejemplos
✅ **QA_TESTING.md actualizado** con métricas
✅ **Listo para certificación ISO 25010**

---

## Ejemplo de uso

```
Usa el skill new-module para crear módulo "reports" con:
- Campos: title (string), type (enum: daily|weekly|monthly), userId (relación), data (json)
- Relaciones: belongsTo User
- Roles: ADMIN puede ver todos, USER solo los suyos, DELETE solo ADMIN
```

---

## Troubleshooting

### Error: Migración falla

**Causa**: Conflicto con esquema existente
**Solución**: Revisar esquema Prisma, verificar relaciones, ajustar tipos

### Error: Tests no pasan

**Causa**: Mocks incorrectos o dependencias faltantes
**Solución**: Revisar mocks de PrismaService, verificar imports

### Error: Cobertura <80%

**Causa**: Faltan tests de casos edge
**Solución**: Agregar tests de errores, validaciones, casos límite

### Error: Build falla

**Causa**: Imports incorrectos o tipos mal definidos
**Solución**: Verificar imports, regenerar cliente Prisma, revisar DTOs

---

## Skills relacionados

- `add-endpoint` - Agregar endpoint a módulo existente
- `update-docs` - Actualizar solo documentación
- `run-qa-audit` - Ejecutar auditoría de calidad completa
- `integrate-microservice` - Integrar con microservicio Python
