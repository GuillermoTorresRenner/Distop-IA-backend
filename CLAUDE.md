# CLAUDE.md

Esta guía orienta a Claude Code al trabajar con este repositorio.

## Proyecto

**Distop-IA - Backend** es un backend NestJS base, pensado como punto de partida para un nuevo producto. Mantiene únicamente lo necesario para autenticación y gestión básica de usuarios.

- **Status**: Inicial
- **Rama principal**: `main`
- **Versión**: 0.0.1

## Comandos

```bash
npm install
cp .env .env.local                                # ajusta si quieres overrides
docker compose -f docker-compose.dev.yml up -d    # postgres
npx prisma migrate dev --name init                # primera migración
npm run start:dev                                 # watch mode

npm run build
npm run lint
npm run format
npm test
npm run test:cov
npm run test:e2e
```

## Arquitectura

```
Cliente HTTP
   ↓
NestJS
 ├─ AuthModule        # registro, login, JWT cookies, forgot/reset password
 ├─ UsersModule       # CRUD básico + avatar
 ├─ UploaderModule    # subida y conversión a WebP (sharp)
 ├─ MailModule        # correos transaccionales (nodemailer + hbs)
 ├─ ChroniclesModule  # crónicas, miembros e invitaciones para el VTT
 └─ PrismaModule      # cliente Prisma compartido
   ↓
PostgreSQL
```

No hay sistema de roles, ni RabbitMQ, ni microservicios. Si necesitas RBAC u otra cosa, se agrega cuando sea necesario.

## Modelos Prisma

- `Users` - `id` (uuid), `email` (único), `password`, `isActive`, `avatar`, timestamps. Sin enum Role.
- `PasswordResetToken` - token de recuperación con expiración y bandera `used`.
- `Chronicle` - mesa de juego. Campos: `id`, `name`, `description?`, `setting?`, `narratorId` (FK Users), timestamps.
- `ChronicleMember` - pivot user↔chronicle. Roles: `NARRATOR | PLAYER`. Unique `(chronicleId, userId)`.
- `ChronicleInvitation` - invitación con `token`, `email`, `invitedById`, `invitedUserId?` (si el invitado ya existe), `status: PENDING|ACCEPTED|CANCELLED|EXPIRED`, `expiresAt` (7 días), `acceptedAt?`.

Schemas modulares en [prisma/schema/](prisma/schema/).

## Endpoints

Auth ([src/auth/auth.controller.ts](src/auth/auth.controller.ts)):

- `POST /api/auth/register` - registro público con email + password.
- `POST /api/auth/login` - retorna user; setea cookies `accessToken` (15m) y `refreshToken` (7d).
- `POST /api/auth/refresh` - rota tokens usando cookie `refreshToken`.
- `GET /api/auth/me` - perfil del usuario autenticado.
- `POST /api/auth/logout` - limpia cookies.
- `POST /api/auth/forgot-password` - envía correo con link de recuperación.
- `POST /api/auth/reset-password` - cambia password con token.

Users ([src/users/users.controller.ts](src/users/users.controller.ts)):

- `GET /api/users?page=&pageSize=&email=&isActive=` - listado paginado (auth).
- `GET /api/users/:id` - detalle (auth).
- `PUT /api/users/:id` - actualizar email/password (auth).
- `POST /api/users/:id/avatar` - subir avatar (multipart, máx. 5 MB, jpg/png/webp/gif → WebP).
- `DELETE /api/users/:id` - soft delete (`isActive: false`).

Uploader ([src/uploader/uploader.controller.ts](src/uploader/uploader.controller.ts)):

- `POST /api/upload/user-avatar/:userId` - endpoint alternativo de subida.

Chronicles ([src/chronicles/chronicles.controller.ts](src/chronicles/chronicles.controller.ts)):

- `POST /api/chronicles` - crear crónica (auth). Usuario actual queda como `NARRATOR` y `ChronicleMember` automáticamente.
- `GET /api/chronicles` - lista crónicas donde el usuario es miembro, con `narrator`, `members[]` y `_count`.
- `GET /api/chronicles/:id` - detalle (auth, debe ser miembro): `narrator`, `members[]`, `invitations[]` (sólo PENDING).
- `PATCH /api/chronicles/:id` - actualizar `name|description|setting` (auth, sólo narrador).
- `DELETE /api/chronicles/:id` - eliminar crónica (auth, sólo narrador). Cascade borra members + invitations.
- `POST /api/chronicles/:id/invitations` - invitar por email (auth, sólo narrador). Body `{ email }`. Crea `ChronicleInvitation` con token aleatorio (7 días). Si el email pertenece a un usuario registrado → envía correo con `${FRONTEND_URL}/invitations/<token>`. Si no → envía correo con `${FRONTEND_URL}/register?invite=<token>`. Errores: 400 si ya es miembro o ya hay invitación pendiente para ese email.
- `DELETE /api/chronicles/:id/invitations/:invitationId` - cancela invitación pendiente (auth, narrador).
- `DELETE /api/chronicles/:id/members/:userId` - expulsa miembro (auth, narrador). No permite remover al narrador.

Invitations ([src/chronicles/invitations.controller.ts](src/chronicles/invitations.controller.ts)):

- `GET /api/invitations/token/:token` - **público**. Preview para páginas de aceptación/registro. Devuelve `{ chronicle, invitedBy, status, expiresAt }` (status pasa a `EXPIRED` si `expiresAt < now`).
- `GET /api/invitations` - lista invitaciones pendientes dirigidas al usuario actual (auth). Match por `invitedUserId` o por `email`.
- `POST /api/invitations/:token/accept` - acepta (auth). Valida que el email del invite coincide con el del usuario logueado. Si OK, crea `ChronicleMember` con rol `PLAYER` y marca invitación `ACCEPTED`.

Mail templates (Distop-IA · La Mascarada VTT — paleta sangrienta) en [src/mail/templates/](src/mail/templates/):

- `welcome.hbs` - tras registro. Variables: `name`, `email`, `platformUrl`, `year`.
- `password-recovery.hbs` - tras forgot-password. Variables: `name`, `recoveryUrl`, `year`.
- `chronicle-invite-existing.hbs` - invite a usuario registrado. Variables: `email`, `inviterEmail`, `chronicleName`, `acceptUrl`, `expiresAt`, `year`.
- `chronicle-invite-new.hbs` - invite a email no registrado. Variables: `email`, `inviterEmail`, `chronicleName`, `registerUrl`, `expiresAt`, `year`.

`MailService` ([src/mail/mail.service.ts](src/mail/mail.service.ts)) expone `sendWelcome`, `sendPasswordRecovery`, `sendChronicleInviteExisting`, `sendChronicleInviteNew`. Subject prefix `Distop-IA · …`. Render helper centralizado (`this.render(template, data)`).

Swagger: `http://localhost:3000/docs`.

### Contrato del flujo de auth (consumido por `front/`)

Detalle relevante para clientes (incluido el frontend de Distop-IA VTT):

- `login` y `refresh` retornan `{ user }` envuelto en objeto. `GET /auth/me` devuelve el `user` **plano** (sin wrap).
- `User` expuesto: `{ id, email, isActive, avatar, createdAt, updatedAt }` (el campo `password` se elimina en el service antes de responder).
- Cookies `accessToken` (`maxAge: 15m`) y `refreshToken` (`maxAge: 7d`) con `httpOnly: true`, `path: '/'`, `sameSite: 'lax'` en dev / `'strict'` en producción, `secure: NODE_ENV==='production'`.
- `refresh` rota **ambos** tokens (el refresh anterior no se invalida en DB; expira por su `exp`).
- `register` **no** auto-loguea: devuelve `{ ok, message }` y deja al cliente redirigir a `/login`.
- `forgot-password` siempre responde 200 (anti-enumeración) y envía correo a `${FRONTEND_URL}/password-recovery?token=<token>` (token vive 1 h).
- `reset-password` espera body `{ token, newPassword }` (nombre del campo: `newPassword`, no `password`).
- CORS: `app.enableCors({ origin: true, credentials: true, ... })` — funciona desde `http://localhost:5173` en dev. Para producción es recomendable cerrar `origin` a `FRONTEND_URL`.

## Convenciones

- Archivos y carpetas: `kebab-case`.
- Clases y tipos: `PascalCase`.
- Variables y funciones: `camelCase`.
- DTOs con `class-validator`; el `ValidationPipe` global usa `whitelist: true` y `forbidNonWhitelisted: true`.
- JWT en cookies HTTP-only; cookie parser está activo.
- Errores: usar `BadRequestException`, `NotFoundException`, `UnauthorizedException`.

## Decoradores comunes

- `@Auth()` - exige sesión válida (JWT cookie).
- `@GetUser('id')` - extrae el id del usuario del request.

No existe `@Auth(Role.X)`: el decorator sólo verifica autenticación.

## Variables de entorno

Definidas y validadas con joi en [src/config/envs.ts](src/config/envs.ts):

Requeridas: `PORT`, `JWT_SECRET`, `NODE_ENV` (`dev|qa|production|test`), `DATABASE_URL`.
Opcionales: `BACKEND_URL`, `FRONTEND_URL`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`.

## Archivos estáticos

Servidos desde `./public`. Avatares en `public/images/users/avatars/`.

## Notas para extender

- Si vas a agregar roles, hay que reintroducir `RolesGuard` y enum Role en Prisma.
- Si añades modelos, crea un archivo `prisma/schema/Nombre.prisma` y corre `npx prisma migrate dev --name descripcion`.
- Si añades módulos nuevos, regístralos en [src/app.module.ts](src/app.module.ts).
