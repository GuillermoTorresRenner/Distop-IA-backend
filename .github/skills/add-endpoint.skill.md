---
description: Agregar un nuevo endpoint a un módulo existente de forma segura, con tests, documentación Swagger y validación de calidad.
---

# Skill: Agregar Endpoint a Módulo Existente

> Workflow para agregar un endpoint personalizado a un módulo ya existente, asegurando tests, documentación y compatibilidad con la arquitectura actual.

## ¿Cuándo usar este skill?

- Necesitas agregar funcionalidad específica a un módulo existente
- Quieres un endpoint custom más allá del CRUD básico
- Requieres endpoint con lógica de negocio particular

## Inputs requeridos

- **Módulo existente** (ej: "users", "organizations")
- **Método HTTP** (GET, POST, PATCH, DELETE)
- **Path del endpoint** (ej: "/users/:id/avatar", "/reports/export")
- **Funcionalidad** (ej: "exportar reporte en PDF", "cambiar avatar")
- **Roles de acceso** (ej: "USER puede ver propio, ADMIN puede ver todos")
- **Query params o body** (especificar inputs esperados)

## Workflow paso a paso

### Paso 1: Validar módulo y endpoint

**Criterios de decisión**:

- ¿El módulo existe? → Verificar en `src/`
- ¿El endpoint es RESTful? → Validar convenciones
- ¿El endpoint ya existe? → Revisar controller

**Acciones**:

```bash
# Verificar módulo
ls src/[module]/

# Buscar endpoint similar
grep -r "path-del-endpoint" src/[module]/[module].controller.ts
```

**Si el módulo no existe**: Usar skill `new-module` primero

---

### Paso 2: Implementar lógica en Service

**Invocar**: @backend

**Prompt**:

```
Agrega método en [Module]Service:

Funcionalidad: [descripción detallada]

Método: [nombreMetodo]
Inputs: [parámetros con tipos]
Output: [tipo de retorno]

Lógica requerida:
- [paso 1]
- [paso 2]
- [paso 3]

Validaciones:
- [validación 1]
- [validación 2]

Errores a manejar:
- NotFoundException si [condición]
- BadRequestException si [condición]
```

**Criterios de calidad**:

- ✅ Método implementado en service
- ✅ Lógica de negocio clara y bien estructurada
- ✅ Validaciones apropiadas
- ✅ Manejo de errores completo
- ✅ Tipos TypeScript correctos

---

### Paso 3: Agregar endpoint en Controller

**Invocar**: @backend

**Prompt**:

```
Agrega endpoint en [Module]Controller:

Método HTTP: [GET|POST|PATCH|DELETE]
Path: [path-completo]
Método service: [service.nombreMetodo]

Decoradores requeridos:
- @[HttpMethod]('[path]')
- @Auth([...roles])
- @GetUser() user: User
- @ApiOperation({ summary: '[descripción]' })
- @ApiResponse({ status: 200, description: '[descripción]' })
- @ApiResponse({ status: 404, description: 'Not found' })

Query/Body params:
- [param1]: [tipo] - [descripción]
- [param2]: [tipo] - [descripción]

Documentación Swagger:
- Descripción clara de funcionalidad
- Ejemplos de request/response
- Códigos de estado HTTP
```

**Criterios de calidad**:

- ✅ Endpoint agregado al controller
- ✅ Decoradores @Auth y @GetUser presentes
- ✅ Swagger documentado completamente
- ✅ DTOs creados si son necesarios
- ✅ Validación con class-validator

**Validación**:

```bash
# Compilar
npm run build

# Iniciar servidor
npm run start:dev

# Verificar en Swagger
# http://localhost:3000/api
```

---

### Paso 4: Implementar tests

**Invocar**: @qa_tester

**Prompt**:

```
Agrega tests para el nuevo endpoint en [Module]:

Endpoint: [METHOD] [path]
Funcionalidad: [descripción]

Tests unitarios (service):
- Test de caso feliz (happy path)
- Test de validaciones
- Test de errores (NotFoundException, etc.)

Tests de integración (controller):
- Test de endpoint con usuario autenticado
- Test de autorización por roles
- Test de validación de inputs
- Test de respuestas HTTP correctas

Tests de seguridad:
- Test de autenticación JWT
- Test de autorización RBAC

Actualiza QA_TESTING.md con:
- Nuevo endpoint en lista
- Métricas de cobertura actualizadas
```

**Criterios de calidad**:

- ✅ Tests unitarios agregados en \*.service.spec.ts
- ✅ Tests de integración agregados en \*.controller.spec.ts
- ✅ Tests de seguridad si aplica
- ✅ Todos los tests pasan
- ✅ Cobertura mantenida ≥80%
- ✅ QA_TESTING.md actualizado

**Validación**:

```bash
# Ejecutar tests del módulo
npm test -- [module]

# Verificar cobertura
npm run test:cov -- --collectCoverageFrom="src/[module]/**"
```

---

### Paso 5: Actualizar documentación

**Invocar**: @documentator

**Prompt**:

```
Actualiza README.md con nuevo endpoint:

Módulo: [nombre]
Endpoint: [METHOD] [path]
Descripción: [funcionalidad]
Autenticación: JWT requerido
Roles: [roles permitidos]

Agregar a:
- Tabla de endpoints con descripción
- Ejemplos de uso con curl
- Ejemplo de request
- Ejemplo de response
```

**Criterios de calidad**:

- ✅ Tabla de endpoints actualizada
- ✅ Ejemplo de curl completo
- ✅ Request/response documentados
- ✅ Roles especificados

---

### Paso 6: Validación final

**Checklist**:

- [ ] Service: Método implementado con lógica completa
- [ ] Controller: Endpoint agregado con decoradores correctos
- [ ] Swagger: Endpoint visible y documentado en /api
- [ ] Tests: Unitarios + Integración + Seguridad
- [ ] Cobertura: Mantenida ≥80%
- [ ] Documentación: README.md y QA_TESTING.md actualizados
- [ ] Build: Sin errores
- [ ] Lint: Sin errores

**Prueba manual**:

```bash
# Test con curl
curl -X [METHOD] http://localhost:3000/api/[path] \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ [body si aplica] }'

# Verificar respuesta esperada
```

---

## Resultado esperado

✅ **Endpoint funcional** en `[Module]Controller`
✅ **Lógica implementada** en `[Module]Service`
✅ **Tests completos** con cobertura ≥80%
✅ **Swagger actualizado** en `/api`
✅ **README.md actualizado** con ejemplos

---

## Ejemplo de uso

```
Usa el skill add-endpoint para agregar en módulo "users":
- Método: POST
- Path: /users/:id/change-password
- Funcionalidad: Cambiar contraseña del usuario
- Roles: USER puede cambiar propia, ADMIN puede cambiar cualquiera
- Body: { currentPassword: string, newPassword: string }
```

---

## Skills relacionados

- `new-module` - Crear módulo completo desde cero
- `update-docs` - Actualizar documentación
- `run-qa-audit` - Auditoría de calidad
