---
description: Integrar un nuevo microservicio Python con el backend NestJS, coordinando RabbitMQ, volúmenes compartidos, WebSocket y protocolos de comunicación mediante archivos de integración.
---

# Skill: Integrar Microservicio Python

> Workflow completo para integrar un microservicio Python con el backend, procesando su documentación y generando especificaciones de integración para coordinación bidireccional.

## ¿Cuándo usar este skill?

- Necesitas integrar un nuevo microservicio Python
- El microservicio requiere comunicación con el backend NestJS
- Necesitas coordinar RabbitMQ, volúmenes compartidos o WebSocket
- Tienes documentación del microservicio para procesar

## Inputs requeridos

- **Nombre del microservicio** (ej: "data-analyzer", "report-generator")
- **Documentación del microservicio** (archivo .md o especificación)
- **Tipo de comunicación** (RabbitMQ, HTTP, File-based, WebSocket)
- **Datos de entrada/salida** (esquemas de mensajes o archivos)
- **Trigger** (evento que inicia el procesamiento)

## Workflow paso a paso

### Paso 1: Procesar documentación del microservicio

**Ubicación de input**: `.github/integration/input/[microservice-name].md`

**Acciones**:

1. Coloca la documentación del microservicio en `.github/integration/input/`
2. Asegúrate que incluya:
   - Propósito del microservicio
   - Endpoints o mensajes que espera recibir
   - Formato de datos de entrada
   - Formato de datos de salida
   - Dependencias y requisitos

**Invocar**: @integrator

**Prompt**:

```
Procesa la documentación del microservicio [nombre]:

Ubicación: .github/integration/input/[microservice-name].md

Por favor:
1. Lee y analiza la documentación completa
2. Identifica el tipo de comunicación requerida
3. Extrae esquemas de mensajes/datos
4. Identifica eventos trigger
5. Determina configuraciones necesarias en Docker
6. Genera especificación de integración en .github/integration/output/

Enfócate en:
- Protocolos de comunicación
- Esquemas de datos (TypeScript para backend, Python para microservicio)
- Configuración de infraestructura (volumes, queues, networks)
- Eventos y triggers
```

**Criterios de calidad**:

- ✅ Documentación leída y analizada
- ✅ Tipo de comunicación identificado
- ✅ Esquemas extraídos correctamente
- ✅ Especificación generada en output/

---

### Paso 2: Generar especificación de integración

**Ubicación de output**: `.github/integration/output/[microservice-name]-spec.md`

**Invocar**: @integrator

**Prompt**:

```
Genera especificación completa de integración para [microservice]:

Crear archivo: .github/integration/output/[microservice]-spec.md

Debe incluir:

1. **Resumen de integración**
   - Propósito
   - Tipo de comunicación
   - Flujo de datos

2. **Esquemas de datos** (TypeScript + Python)
   - Interfaces TypeScript para backend
   - Dataclasses Python para microservicio
   - Validación con Pydantic

3. **Configuración RabbitMQ** (si aplica)
   - Nombres de colas
   - Exchange y routing keys
   - Esquema de mensajes
   - Reintentos y DLQ

4. **Configuración de volúmenes** (si aplica)
   - Paths compartidos
   - Convenciones de naming
   - Permisos necesarios

5. **Configuración Docker**
   - Volumes a agregar en docker-compose
   - Variables de entorno
   - Networks
   - Dependencias

6. **Eventos WebSocket** (si aplica)
   - Nombres de eventos
   - Payloads
   - Rooms

7. **Ejemplos de uso**
   - Código backend para enviar datos
   - Código microservicio para recibir
   - Código para respuesta
```

**Criterios de calidad**:

- ✅ Archivo generado en `.github/integration/output/`
- ✅ Esquemas completos en TypeScript y Python
- ✅ Configuración Docker documentada
- ✅ Ejemplos de código funcionales
- ✅ Protocolo de comunicación bien definido

---

### Paso 3: Configurar infraestructura (Docker)

**Invocar**: @devops

**Prompt**:

```
Configura infraestructura para microservicio [nombre]:

Basándote en: .github/integration/output/[microservice]-spec.md

Actualizar archivos:
1. docker-compose.dev.yml
2. docker-compose.qa.yml
3. docker-compose.yml (producción)

Agregar:
- Servicio del microservicio
- Volúmenes compartidos si aplica
- Variables de entorno necesarias
- Networks apropiadas
- Dependencias (RabbitMQ si aplica)

Verificar:
- No hay conflictos de puertos entre entornos
- Volúmenes están correctamente mapeados
- Networks aisladas por entorno (qa y prod)
- Variables de entorno específicas por entorno
```

**Criterios de calidad**:

- ✅ Docker compose actualizado en todos los entornos
- ✅ No hay conflictos de puertos
- ✅ Volúmenes configurados correctamente
- ✅ Variables de entorno documentadas
- ✅ Networks aisladas

---

### Paso 4: Implementar comunicación en backend

**Invocar**: @backend

**Prompt**:

```
Implementa comunicación con microservicio [nombre]:

Especificación: .github/integration/output/[microservice]-spec.md

Tipo de comunicación: [RabbitMQ|HTTP|File-based|WebSocket]

**Si RabbitMQ**:
1. Crear módulo de colas si no existe
2. Implementar publisher para cola [nombre-cola]
3. Implementar subscriber para respuestas
4. Definir interfaces TypeScript de mensajes
5. Manejar reintentos y errores

**Si File-based**:
1. Implementar servicio de escritura/lectura de archivos
2. Configurar watcher para cambios
3. Implementar limpieza de archivos antiguos

**Si WebSocket**:
1. Implementar emisión de eventos a microservicio
2. Configurar listeners de respuestas
3. Documentar eventos en gateway

**Si HTTP**:
1. Implementar cliente HTTP
2. Configurar retry policy
3. Manejar timeouts

Requisitos comunes:
- Logging completo
- Manejo de errores robusto
- Validación de esquemas
- Tests unitarios
```

**Criterios de calidad**:

- ✅ Comunicación implementada según spec
- ✅ Interfaces TypeScript definidas
- ✅ Validación de esquemas
- ✅ Manejo de errores completo
- ✅ Logging implementado
- ✅ Tests unitarios creados

---

### Paso 5: Implementar tests de integración

**Invocar**: @qa_tester

**Prompt**:

```
Implementa tests de integración con microservicio [nombre]:

Basándote en: .github/integration/output/[microservice]-spec.md

Tests requeridos:
1. **Test de comunicación básica**
   - Backend envía mensaje/archivo
   - Microservicio procesa
   - Backend recibe respuesta

2. **Test de validación de esquemas**
   - Datos válidos se procesan correctamente
   - Datos inválidos son rechazados

3. **Test de manejo de errores**
   - Timeout del microservicio
   - Respuesta con error
   - Datos malformados

4. **Test de performance**
   - Tiempo de procesamiento aceptable
   - Concurrencia manejada correctamente

5. **Test E2E completo**
   - Flujo completo desde API hasta microservicio y vuelta

Actualizar:
- QA_TESTING.md con nueva integración
- Documentar tiempos de respuesta
- Agregar métricas de éxito/error
```

**Criterios de calidad**:

- ✅ Tests de integración completos
- ✅ Casos happy path y errores cubiertos
- ✅ Performance validada
- ✅ Tests E2E funcionales
- ✅ QA_TESTING.md actualizado

---

### Paso 6: Actualizar documentación

**Invocar**: @documentator

**Prompt**:

```
Actualiza README.md con integración del microservicio [nombre]:

Información a documentar:
- Propósito del microservicio
- Tipo de comunicación utilizada
- Flujo de datos (diagrama si aplica)
- Configuración necesaria
- Variables de entorno
- Volúmenes compartidos
- Colas RabbitMQ (si aplica)
- Eventos WebSocket (si aplica)

Agregar a secciones:
- Arquitectura del Sistema (actualizar diagrama)
- Microservicios (nueva subsección)
- Flujo de Procesamiento
- Configuración (variables de entorno)
- Deployment (Docker Compose)

Incluir ejemplos de:
- Cómo enviar datos al microservicio
- Cómo recibir respuestas
- Monitoreo y logs
```

**Criterios de calidad**:

- ✅ Arquitectura actualizada con microservicio
- ✅ Flujo de datos documentado
- ✅ Variables de entorno listadas
- ✅ Ejemplos de uso completos
- ✅ Configuración Docker documentada

---

### Paso 7: Validación E2E

**Checklist de integración completa**:

- [ ] Documentación procesada desde input/
- [ ] Especificación generada en output/
- [ ] Docker Compose configurado (dev, qa, prod)
- [ ] Comunicación implementada en backend
- [ ] Tests de integración completos y pasando
- [ ] README.md actualizado con microservicio
- [ ] QA_TESTING.md actualizado con métricas
- [ ] Microservicio puede acceder a volumes/queues
- [ ] No hay conflictos entre entornos

**Prueba E2E manual**:

```bash
# 1. Levantar entorno
docker-compose -f docker-compose.dev.yml up -d

# 2. Verificar que microservicio esté activo
docker ps | grep [microservice-name]

# 3. Verificar logs
docker logs [microservice-container]

# 4. Probar comunicación
# (curl, publicar en RabbitMQ, escribir archivo, etc.)

# 5. Verificar respuesta en logs del backend
docker logs [backend-container]
```

---

## Resultado esperado

✅ **Especificación generada** en `.github/integration/output/`
✅ **Docker Compose configurado** en dev/qa/prod
✅ **Comunicación implementada** en backend
✅ **Tests de integración** completos y pasando
✅ **README.md actualizado** con arquitectura y microservicio
✅ **QA_TESTING.md actualizado** con métricas de integración
✅ **Flujo E2E funcional** desde API hasta microservicio

---

## Ejemplo de uso

```
Usa el skill integrate-microservice para integrar "data-analyzer":

Coloca documentación en:
.github/integration/input/data-analyzer.md

Microservicio:
- Nombre: data-analyzer
- Tipo: Análisis de datos con Python/Pandas
- Comunicación: RabbitMQ (cola: tasks.analysis)
- Input: JSON con userId y filePath
- Output: JSON con results y metrics
- Trigger: POST /api/analysis/start

Genera especificación completa e implementa integración.
```

---

## Troubleshooting

### Error: Microservicio no recibe mensajes

**Causa**: Cola RabbitMQ no configurada o nombres incorrectos
**Solución**: Verificar nombres de colas en spec, revisar RabbitMQ Management UI

### Error: Volúmenes no compartidos

**Causa**: Paths incorrectos o permisos insuficientes
**Solución**: Verificar paths en docker-compose, ajustar permisos del host

### Error: Tests de integración fallan

**Causa**: Microservicio no disponible o timeout muy corto
**Solución**: Aumentar timeout, verificar que microservicio esté activo

---

## Skills relacionados

- `new-module` - Crear módulo que use el microservicio
- `update-docs` - Actualizar documentación de integración
- `run-qa-audit` - Auditar integración completa
