---
description: Instrucciones generales del proyecto Plataforma Lanek - Arquitectura, convenciones y directrices de desarrollo
# applyTo: '**/*' # Aplicar a todos los archivos del proyecto
---

# Plataforma Lanek - Overview del Proyecto

## Arquitectura del Sistema

Este es un proyecto **monolítico** construido con NestJS que actúa como backend central de la Plataforma Lanek. El sistema está diseñado para integrarse con **microservicios de procesamiento de datos** desarrollados en Python que se agregarán progresivamente.

### Componentes del Sistema

1. **Backend Monolítico (NestJS)**:
   - Gestión de usuarios, autenticación y autorización
   - API REST con documentación Swagger
   - Recepción de archivos binarios desde el frontend
   - Orquestación de tareas de procesamiento
   - Notificaciones en tiempo real

2. **Microservicios de Procesamiento (Python)**:
   - Servicios anexos especializados en procesamiento de datos
   - Consumo de archivos binarios desde volúmenes compartidos
   - Ejecución de tareas asíncronas

3. **Infraestructura de Integración**:
   - **Volúmenes Compartidos**: Almacenamiento compartido entre backend y microservicios
   - **RabbitMQ**: Sistema de colas para comunicación asíncrona (A IMPLEMENTAR)
   - **WebSockets**: Notificaciones en tiempo real del estado de procesamiento (A IMPLEMENTAR)
   - **PostgreSQL**: Base de datos relacional principal

## Flujo de Trabajo de Procesamiento

```
Frontend → HTTP/Binarios → Backend NestJS → Volumen Compartido
                                    ↓
                              RabbitMQ Queue
                                    ↓
                            Microservicio Python
                                    ↓
                         Actualización de Estado
                                    ↓
                      WebSocket → Frontend (Notificación)
```

## Directrices de Desarrollo

### 1. Gestión de Archivos Binarios

- **SIEMPRE** almacenar archivos binarios en rutas configuradas mediante variables de entorno
- **SIEMPRE** validar tipo y tamaño de archivos antes de procesarlos
- Los archivos deben guardarse en volúmenes compartidos accesibles por los microservicios Python
- Implementar nomenclatura consistente: `{tipo}-{id}-{timestamp}.{ext}`
- Usar `sharp` para procesamiento de imágenes y `fs-extra` para operaciones de archivos

### 2. Integración con RabbitMQ (Implementación Futura)

- Crear módulo dedicado `queue/` para gestión de colas
- Usar patrón Publisher/Subscriber para envío de tareas
- Incluir metadatos completos en mensajes: `{ taskId, userId, filePath, type, priority, timestamp }`
- Implementar manejo de reintentos y dead-letter queues
- Documentar todos los tipos de mensajes y sus esquemas en el README

### 3. WebSockets para Notificaciones (Implementación Futura)

- Crear módulo `notifications/` usando `@nestjs/websockets`
- Implementar autenticación JWT en conexiones WebSocket
- Enviar actualizaciones de estado: `processing`, `completed`, `error`
- Agrupar notificaciones por usuario/organización
- Documentar eventos y payloads en el README

### 4. Estructura de Módulos

El proyecto sigue arquitectura modular de NestJS:

```
src/
├── auth/          # Autenticación JWT + RBAC
├── users/         # Gestión de usuarios
├── organizations/ # Gestión de organizaciones
├── uploader/      # Subida de archivos
├── prisma/        # Servicio de base de datos
├── queue/         # RabbitMQ (A CREAR)
├── notifications/ # WebSockets (A CREAR)
└── common/        # Utilidades compartidas
```

**Convenciones**:

- Cada módulo debe tener: `module.ts`, `service.ts`, `controller.ts`
- DTOs en carpeta `dto/` dentro del módulo
- Entidades/tipos en carpeta `entities/` o `types/`
- Tests con nomenclatura `*.spec.ts`

### 5. Base de Datos y Prisma

- **Esquemas separados por dominio** en `prisma/schema/`
- Nunca modificar archivos generados en `generated/`
- Ejecutar `npx prisma generate` después de cambios en schema
- Usar transacciones para operaciones multi-modelo
- Implementar soft-delete donde sea necesario para auditoría

**Comandos críticos**:

```bash
npx prisma validate    # Antes de migrate
npx prisma migrate dev # Crear migración
npx prisma generate    # Regenerar cliente
npm run db:seed        # Poblar datos iniciales
```

### 6. Seguridad y Autenticación

- **SIEMPRE** usar guards `JwtAuthGuard` en endpoints protegidos
- Implementar RBAC con `RolesGuard` para control de acceso
- Usar refresh tokens para sesiones largas
- Almacenar tokens en cookies HTTP-only
- Validar y sanitizar TODOS los inputs con class-validator

### 7. Variables de Entorno

Configuración centralizada en `src/config/envs.ts` usando Joi:

**Variables críticas**:

- `DATABASE_URL`: Conexión PostgreSQL
- `JWT_SECRET`: Secreto para tokens
- `RABBITMQ_URL`: Conexión RabbitMQ (A AGREGAR)
- `FRONTEND_URL`: CORS y WebSocket origin
- Rutas de almacenamiento: `*_PATH`
- Configuración de email: `MAIL_*`

**NUNCA** hardcodear valores sensibles - usar siempre variables de entorno.

### 8. Documentación (Requisito ISO 25010)

El proyecto se someterá a **certificación ISO 25010**, por lo tanto:

#### Documentación Centralizada en README

El archivo `README.md` debe contener:

1. **Arquitectura del Sistema**
   - Diagrama de componentes
   - Flujo de datos entre backend y microservicios
   - Descripción de volúmenes compartidos

2. **Guías de Integración**
   - Cómo agregar nuevos microservicios Python
   - Configuración de colas RabbitMQ
   - Implementación de nuevos endpoints

3. **API Documentation**
   - Referencias a Swagger en `/docs`
   - Ejemplos de uso de endpoints principales
   - Esquemas de mensajes RabbitMQ
   - Eventos WebSocket disponibles

4. **Configuración y Deployment**
   - Variables de entorno requeridas
   - Instrucciones de Docker Compose
   - Scripts de backup/restore
   - Guía de migración de base de datos

5. **Estándares de Calidad**
   - Cobertura de tests esperada (mínimo 80%)
   - Convenciones de código
   - Proceso de revisión de código
   - Métricas de rendimiento

#### Principios de Documentación

- **Actualizar README con cada feature nueva**
- Documentar TODOS los endpoints con Swagger/OpenAPI
- Incluir ejemplos de código en documentación
- Mantener changelog actualizado
- Documentar decisiones arquitectónicas importantes
- Incluir diagramas cuando sea necesario (Mermaid en Markdown)

### 9. Testing

- Cobertura mínima: **80%** (requisito ISO 25010)
- Tests unitarios para servicios (`*.service.spec.ts`)
- Tests de integración para controladores (`*.controller.spec.ts`)
- Tests E2E para flujos críticos en `test/`
- Mockear servicios externos (RabbitMQ, microservicios)

### 10. Docker y Ambientes

El proyecto usa Docker Compose con tres configuraciones:

- `docker-compose.yml`: Producción
- `docker-compose.dev.yml`: Desarrollo local
- `docker-compose.qa.yml`: Testing/QA

**Directrices**:

- Volúmenes compartidos deben configurarse en todos los ambientes
- RabbitMQ debe incluirse en compose files (A AGREGAR)
- Usar networks de Docker para comunicación entre servicios
- Healthchecks para todos los servicios

## Convenciones de Código

### TypeScript

- Usar tipos explícitos, evitar `any`
- Interfaces para contratos, types para uniones/composiciones
- Async/await sobre promesas directas
- Destructuring cuando mejore legibilidad

### NestJS

- Inyección de dependencias en constructores
- DTOs para validación de entrada
- Interceptors para transformación de respuestas
- Exception filters para manejo centralizado de errores
- Pipes para validación y transformación

### Naming Conventions

- Clases: PascalCase (`UserService`)
- Archivos: kebab-case (`user.service.ts`)
- Variables/funciones: camelCase (`getUserById`)
- Constantes: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- Enums: PascalCase (`enum Role { ADMIN, USER }`)

## Próximos Pasos Críticos

1. **Implementar módulo RabbitMQ**
   - Instalar `@nestjs/microservices` y `amqplib`
   - Crear QueueModule, QueueService
   - Definir tipos de mensajes y colas
   - Actualizar README con documentación completa

2. **Implementar WebSockets**
   - Instalar `@nestjs/websockets` y `socket.io`
   - Crear NotificationsGateway
   - Autenticación JWT en WebSocket
   - Actualizar README con eventos disponibles

3. **Configurar Volúmenes Compartidos**
   - Definir estructura de directorios para archivos procesables
   - Actualizar docker-compose con volúmenes
   - Documentar convenciones de naming
   - Crear utilidades para gestión de archivos

4. **Mejorar Documentación**
   - Agregar diagramas de arquitectura
   - Documentar flujo completo de procesamiento
   - Crear guía de contribución
   - Preparar documentación para auditoría ISO 25010

## Recursos y Referencias

- NestJS Docs: https://docs.nestjs.com
- Prisma Docs: https://www.prisma.io/docs
- ISO 25010: Modelo de calidad de software
- Swagger/OpenAPI: Documentación automática de API

---

**Nota para el Agente AI**: Al trabajar en este proyecto, prioriza la documentación, mantén el README actualizado con cada cambio significativo, y asegúrate de que todo el código nuevo siga las convenciones establecidas. La calidad y trazabilidad son críticas para la certificación ISO 25010.
