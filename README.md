# Distop-IA Backend

**API REST para Mesa Virtual de Vampiro: la Mascarada (V20)**

Backend NestJS con Prisma y PostgreSQL. Proporciona autenticación, gestión de crónicas, personajes, catálogos V20 y correos transaccionales.

Este repositorio es independiente del frontend; clona solo este repo si quieres desarrollar el servidor.

**Demo API (Swagger):**
- Desarrollo local: http://localhost:3000/docs
- Producción: sin exposición pública (proxiado por frontend).

**Frontend:** https://github.com/GuillermoTorresRenner/Distop-IA-front

---

## Stack

- **NestJS 11** — framework server.
- **Prisma 7** — ORM con migraciones automáticas.
- **PostgreSQL 17** — base de datos.
- **JWT en cookies HTTP-only** — autenticación sin localStorage.
- **Nodemailer + Handlebars** — correos transaccionales temáticos.
- **Sharp** — procesamiento de imágenes (avatares → WebP).
- **Swagger/OpenAPI** — documentación interactiva en `/docs` (dev).
- **TypeScript** estricto; sin roles (autenticación solo).

---

## Inicio rápido

### Requisitos

- Node 20+
- npm 10+ (o pnpm/yarn)
- Docker + Docker Compose (para PostgreSQL)

### Setup local

```bash
git clone https://github.com/GuillermoTorresRenner/Distop-IA-backend.git
cd back
npm install

# Iniciar PostgreSQL en contenedor
docker compose -f docker-compose.dev.yml up -d

# Primera vez: crear schema y migrar
npx prisma migrate dev --name init

# Poblar catálogo V20 (arquetipos, clanes, disciplinas, armas, armaduras)
npx prisma db seed

# Iniciar servidor
npm run start:dev
```

El servidor estará en **http://localhost:3000** y Swagger en **http://localhost:3000/docs**.

---

## Comandos disponibles

```bash
npm install                       # Instalar dependencias

# Base de datos
docker compose -f docker-compose.dev.yml up -d    # Levantar PostgreSQL
docker compose -f docker-compose.dev.yml down     # Detener PostgreSQL
npx prisma migrate dev --name <descripción>       # Crear + aplicar migración
npx prisma migrate reset                          # Reset DB (dev solo)
npx prisma db seed                                # Poblar catálogo V20

# Servidor
npm run start:dev                 # watch mode (NestJS)
npm run build                     # Compilar a dist/
npm run start:prod                # Ejecutar build compilado
npm run typecheck                 # tsc --noEmit

# Testing
npm test                          # Jest unit tests
npm run test:cov                  # Con coverage
npm run test:e2e                  # Pruebas e2e (si están configuradas)
```

---

## Variables de entorno

Copia `.env` del repositorio y ajusta los valores localmente:

| Variable          | Default            | Obligatoria | Descripción                                          |
|-------------------|--------------------|-------------|------------------------------------------------------|
| `PORT`            | 3000               | Sí          | Puerto del servidor.                                 |
| `JWT_SECRET`      | (cambiar en prod)  | Sí          | Clave para firmar JWT. **Nunca usar default en prod**. |
| `NODE_ENV`        | `dev`              | Sí          | `dev`, `qa`, `production`, `test`.                  |
| `DATABASE_URL`    | postgresql://...   | Sí          | Conexión a PostgreSQL.                              |
| `POSTGRES_USER`   | postgres           | Sí          | Usuario del contenedor DB.                           |
| `POSTGRES_PASSWORD` | password         | Sí          | Contraseña del contenedor DB.                        |
| `DB_NAME`         | distopia_ia        | Sí          | Nombre de la base de datos.                          |
| `BACKEND_URL`     | http://localhost:3000 | No       | URL pública del backend (informativa para clientes).|
| `FRONTEND_URL`    | http://localhost:5173 | No       | URL del frontend (enlaces en correos).             |
| `MAIL_HOST`       | (smtp.gmail.com)   | No          | Servidor SMTP (Gmail, SendGrid, etc.).              |
| `MAIL_PORT`       | 587                | No          | Puerto SMTP.                                        |
| `MAIL_USER`       | (tu@email.com)     | No          | Usuario/app password SMTP.                          |
| `MAIL_PASSWORD`   | (password)         | No          | Contraseña SMTP.                                    |
| `MAIL_FROM`       | noreply@...        | No          | Dirección "from" en correos.                         |
| `MAIL_FROM_NAME`  | Distop-IA          | No          | Nombre del remitente.                               |

No subir `.env` con valores reales a Git; usar variables de entorno en producción (secrets de GitHub, env vars del VPS, etc.).

---

## Estructura de carpetas

```
src/
  main.ts                           # Punto de entrada

  app.module.ts                     # Módulo raíz: imports de todos los modules
  app.controller.ts                 # Controlador raíz (si aplica)

  config/
    envs.ts                         # Validación joi de variables de entorno

  auth/
    auth.module.ts
    auth.controller.ts              # register, login, refresh, logout, forgot/reset password, me
    auth.service.ts
    auth.strategies/                # Passport strategies (jwt, local)
    guards/                         # @Auth() decorator (validar JWT)
    dtos/                           # DTOs con class-validator

  users/
    users.module.ts
    users.controller.ts             # CRUD de usuarios
    users.service.ts
    dtos/

  uploader/
    uploader.module.ts
    uploader.controller.ts          # POST avatar (multipart)
    uploader.service.ts             # Sharp: jpg/png/gif/webp → WebP

  mail/
    mail.module.ts
    mail.service.ts                 # sendWelcome, sendPasswordRecovery, sendChronicleInvite*
    templates/                      # *.hbs (handlebars)

  catalog/
    catalog.module.ts
    catalog.controller.ts           # GET archeytpes, disciplines, merits-flaws, clans, weapons, armors
    catalog.service.ts
    dtos/

  characters/
    characters.module.ts
    characters.controller.ts        # CRUD personajes V20
    characters.service.ts
    dtos/

  chronicles/
    chronicles.module.ts
    chronicles.controller.ts        # CRUD crónicas, miembros, invitaciones
    chronicles.service.ts
    invitations.controller.ts       # GET token/:token (público), POST accept
    dtos/

  journal/
    journal.module.ts
    journal.controller.ts           # Bitácora (en progreso)
    journal.service.ts

  social/
    social.module.ts
    social.controller.ts            # Amistades (en progreso)
    social.service.ts

  prisma/
    prisma.module.ts
    prisma.service.ts               # Cliente Prisma compartido

prisma/
  schema/
    Users.prisma                    # Modelo User, PasswordResetToken
    Catalog.prisma                  # Archetype, Discipline, Clan, MeritFlaw
    Character.prisma                # Character, CharacterAttribute, CharacterSkill, etc.
    Chronicle.prisma                # Chronicle, ChronicleMember, ChronicleInvitation
    Equipment.prisma                # WeaponCategory, Weapon, Armor, CharacterWeapon, CharacterArmor
    Journal.prisma                  # JournalEntry
    Friendship.prisma               # Friend
  migrations/                       # Migraciones de Prisma
  seed.ts                           # Script de seed con catálogo V20

public/
  images/
    users/
      avatars/                      # Avatares (WebP)
```

---

## Modelos Prisma

### Users

```
User {
  id: String (UUID)
  email: String (unique)
  password: String (hashed)
  isActive: Boolean
  avatar: String? (ruta relativa)
  createdAt, updatedAt
}

PasswordResetToken {
  id: String (UUID)
  userId: String (FK)
  token: String (unique, aleatorio)
  expiresAt: DateTime (1h)
  used: Boolean
  createdAt
}
```

### Chronicles

```
Chronicle {
  id: String (UUID)
  narratorId: String (FK Users)
  name: String
  description: String?
  setting: String?
  createdAt, updatedAt
}

ChronicleMember {
  id: String (UUID)
  chronicleId: String (FK)
  userId: String (FK)
  role: "NARRATOR" | "PLAYER"
  joinedAt: DateTime
  unique(chronicleId, userId)
}

ChronicleInvitation {
  id: String (UUID)
  chronicleId: String (FK)
  email: String
  token: String (unique, aleatorio)
  invitedById: String (FK)
  invitedUserId: String? (FK, si ya existe)
  status: "PENDING" | "ACCEPTED" | "CANCELLED" | "EXPIRED"
  expiresAt: DateTime (7 días)
  acceptedAt: DateTime?
  createdAt
}
```

### Characters

```
Character {
  id: String (UUID)
  ownerId: String (FK Users)
  chronicleId: String? (FK, si es NPC/ANTAGONIST)
  name: String
  kind: "PC" | "NPC" | "ANTAGONIST"
  clan: String?
  archetype: String?
  concept: String?
  sire: String?
  nature: String?
  behavior: String?
  humanity: Int (0-10)
  path: String?
  bloodPotency: Int?
  generation: Int?
  bloodReserve: Int?
  willpower: Int?
  experience: Int?
  createdAt, updatedAt
}

CharacterAttribute {
  id: String (UUID)
  characterId: String (FK)
  name: String (Strength, Dexterity, etc.)
  value: Int (1-5)
}

CharacterSkill {
  id: String (UUID)
  characterId: String (FK)
  name: String
  value: Int (0-5)
  specialty: String?
}

... más subtablas (discipline, merit, flaw, equipment, etc.)
```

### Equipment

```
WeaponCategory {
  id: String (UUID)
  name: String (unique)
  isSystem: Boolean (true = del manual, no borrable)
}

Weapon {
  id: String (UUID)
  categoryId: String (FK)
  name: String
  damage: String
  range: String?
  speed: Int?
  isSystem: Boolean
  createdById: String? (FK Users, si custom)
  unique(name, createdById)
}

CharacterWeapon {
  id: String (UUID)
  characterId: String (FK)
  weaponId: String (FK)
  quantity: Int (default 1)
  equipped: Boolean
}

... similar Armor y CharacterArmor
```

---

## Endpoints principales

### Autenticación

```
POST   /api/auth/register             # { email, password } → { ok, user }
POST   /api/auth/login                # { email, password } → { user }
POST   /api/auth/refresh              # Rota tokens (cookies)
POST   /api/auth/logout               # Limpia cookies
GET    /api/auth/me                   # { user } (auth)
POST   /api/auth/forgot-password      # { email } → correo
POST   /api/auth/reset-password       # { token, newPassword } → ok
```

### Usuarios

```
GET    /api/users                     # Listado paginado (auth)
GET    /api/users/:id                 # Detalle (auth)
PUT    /api/users/:id                 # Actualizar (auth)
POST   /api/users/:id/avatar          # Subir avatar (auth, multipart)
DELETE /api/users/:id                 # Soft delete (auth)
```

### Catálogo

```
GET    /api/catalog/archetypes        # Lista arquetipos
GET    /api/catalog/disciplines       # Lista disciplinas
GET    /api/catalog/merits-flaws      # Lista méritos/defectos
GET    /api/catalog/clans             # Lista clanes
GET    /api/catalog/weapon-categories # Categorías de armas
GET    /api/catalog/weapons           # Armas (system + custom del usuario)
GET    /api/catalog/armors            # Armaduras (system + custom)

POST   /api/catalog/weapons           # Crear arma custom (auth)
PATCH  /api/catalog/weapons/:id       # Actualizar custom (auth, solo dueño)
DELETE /api/catalog/weapons/:id       # Eliminar custom (auth, si no está en uso)

POST   /api/catalog/armors            # Crear armadura custom (auth)
PATCH  /api/catalog/armors/:id        # Actualizar custom (auth, solo dueño)
DELETE /api/catalog/armors/:id        # Eliminar custom (auth, si no está en uso)
```

### Personajes

```
POST   /api/characters                # Crear personaje (auth)
GET    /api/characters                # Mis personajes (auth)
GET    /api/characters/:id            # Detalle (auth)
PATCH  /api/characters/:id            # Actualizar (auth, solo dueño)
DELETE /api/characters/:id            # Eliminar (auth, solo dueño)
POST   /api/characters/:id/clone      # Clonar (auth, solo dueño)
```

### Crónicas

```
POST   /api/chronicles                # Crear (auth, user → NARRATOR)
GET    /api/chronicles                # Mis crónicas (auth)
GET    /api/chronicles/:id            # Detalle (auth, miembro)
PATCH  /api/chronicles/:id            # Actualizar (auth, solo narrador)
DELETE /api/chronicles/:id            # Eliminar (auth, solo narrador)

POST   /api/chronicles/:id/invitations            # Invitar (auth, narrador)
DELETE /api/chronicles/:id/invitations/:invId    # Cancelar (auth, narrador)
DELETE /api/chronicles/:id/members/:userId       # Expulsar (auth, narrador)

GET    /api/chronicles/:id/characters            # Personajes asociados
GET    /api/chronicles/:id/associable-characters # Candidatos a asociar
POST   /api/chronicles/:id/characters            # Crear + asociar
POST   /api/chronicles/:id/characters/:charId    # Asociar (auth, narrador o dueño)
DELETE /api/chronicles/:id/characters/:charId    # Desasociar
```

### Invitaciones

```
GET    /api/invitations/token/:token            # Preview (público)
GET    /api/invitations                         # Mis invitaciones (auth)
POST   /api/invitations/:token/accept           # Aceptar (auth)
```

---

## Contrato de autenticación

Información crítica para clientes (frontend):

- `login` y `refresh` retornan `{ user }`.
- `GET /auth/me` devuelve user **plano** (no envuelto).
- User expuesto: `{ id, email, isActive, avatar, createdAt, updatedAt }` (password eliminado antes de responder).
- Cookies `accessToken` (15m) y `refreshToken` (7d) con `httpOnly: true`, `sameSite: 'lax'` (dev) / `'strict'` (prod), `secure: true` solo en producción.
- `refresh` rota ambos tokens; el anterior expira por su `exp`.
- `register` **no** auto-loguea; responde `{ ok, message }`.
- `forgot-password` siempre responde 200 (anti-enumeración); envía correo a `${FRONTEND_URL}/password-recovery?token=...`.
- `reset-password` espera `{ token, newPassword }` (campo: `newPassword`, no `password`).
- CORS habilitado con `credentials: true`; en producción restringido a `FRONTEND_URL`.

---

## Catálogo V20

El seed popula **automáticamente**:

- 20 arquetipos (Naturaleza/Conducta).
- Todos los clanes: Brujah, Gangrel, Malkavian, Nosferatu, Toreador, Tremere, Ventrue, Assamita, Giovanni, Lasombra, Ravnos, Seguidor de Set, Tzimisce (con disciplinas, debilidades, sect).
- 15+ disciplinas (Animalismo, Ofuscación, Celeridad, Potencia, Presencia, Trasmutación, Demoníaca, Negromanc, Dominación, Embaucamiento, Robustez, Videncia).
- 70+ méritos/defectos del manual.
- 100+ armas (sistema V20: armas cuerpo a cuerpo, distancia, explosivos, con stats: daño, rango, velocidad).
- 30+ armaduras (cuero, kevlar, malla, etc. con protección/penalidad).

Los usuarios pueden crear armas y armaduras custom que solo ellos ven.

---

## Correos transaccionales

Templates Handlebars en `src/mail/templates/`:

- `welcome.hbs` — tras registro.
- `password-recovery.hbs` — tras forgot-password.
- `chronicle-invite-existing.hbs` — invitación a usuario registrado.
- `chronicle-invite-new.hbs` — invitación a email no registrado (con link de registro).

Todas las plantillas usan paleta sangrienta del Mundo de Tinieblas. Requieren configuración SMTP válida en `.env`.

---

## Cómo colaborar

### Bienvenida

El proyecto es **independiente y no comercial**. Toda contribución es bienvenida: código, bugfixes, tests, docs, sugerencias.

**Contacto**: abre un Issue en este repositorio o contacta mediante el sitio web https://distop-ia.com.

### Flujo de contribución

1. **Fork** este repositorio.
2. **Clone** tu fork: `git clone <tu-fork> && cd back`.
3. **Crea una rama** desde `QA`:
   ```bash
   git fetch origin QA
   git checkout -b feature/mi-feature origin/QA
   ```
   (Usa `feature/`, `fix/`, `docs/`, `refactor/` como prefijo.)

4. **Commits** con estilo conventional (sugerido):
   ```
   feat: agregar endpoint GET /chronicles/:id/characters
   fix: validar que solo narrador puede invitar
   docs: documentar contrato de autenticación
   refactor: simplificar seed de catálogo
   ```

5. **Antes de abrir PR**:
   - Correr `npm run build` — compila sin errores.
   - Si tocaste schema Prisma: `npx prisma migrate dev --name descripcion`.
   - Correr `npx prisma db seed` — seed no debe fallar.
   - Correr tests: `npm test` (si están configurados).
   - Probar endpoints en Swagger (`/docs`) o Postman.
   - No subir `.env` con valores reales, `dist/`, `node_modules/`.

6. **Push** a tu rama y abre **PR contra `QA`** (no contra `main`):
   - **Título**: resumen breve.
   - **Descripción**:
     - Qué: cambio realizado.
     - Por qué: motivación/issue.
     - Cómo probarlo: pasos (ej. "llamar `POST /api/chronicles` con...").
     - Screenshots de Swagger si es visual.
     - Checklist: build OK, seed OK, tests OK, sin secrets, migraciones incluidas.

7. **Review**: el mantenedor revisará en 1-7 días hábiles. Cambios = nuevos commits (no force-push).

8. **Merge**: tras aprobación, PR se mergea a `QA`. `main` es solo para releases estables.

### Aportes especialmente bienvenidos

- **Tests**: Jest unit + e2e; alta cobertura de servicios y controllers.
- **Validación**: joi/class-validator mejorados; manejo de edge cases.
- **Optimización**: queries Prisma, caché Redis (opcional), índices DB.
- **Nuevas líneas de Mundo de Tinieblas**: Lobo (Garou), Mago (Mage), Fae (Changeling).
- **Modularidad de seed**: bundles de catálogo (ej. solo Camarilla, solo Sabbat).
- **Websockets**: notificaciones en tiempo real para crónicas (en progreso).

### Convenciones de código

- Archivos y carpetas: `kebab-case`.
- Clases y tipos: `PascalCase`.
- Variables y funciones: `camelCase`.
- DTOs con `class-validator` + decoradores.
- Errores: `BadRequestException`, `NotFoundException`, `UnauthorizedException`.
- Guards: `@Auth()` solo verifica autenticación (sin roles).
- Swagger: cada controller con `@ApiTags`, endpoints con `@ApiOperation`, `@ApiResponse`.

---

## Despliegue

CI/CD automático vía GitHub Actions:

- **Push a `QA`**: compilar, test, build Docker, push `lebateleur/distop-ia-back:qa`, deploy a VPS staging.
- **Push a `main`**: compilar, test, build Docker, push `lebateleur/distop-ia-back:latest`, deploy a VPS producción.

Ambos entornos tienen PostgreSQL en contenedor, migraciones y seed automáticas.

---

## Frontend gemelo

Para entender la integración cliente-servidor:

https://github.com/GuillermoTorresRenner/Distop-IA-front

El frontend consume los endpoints documentados en Swagger (`/docs`).

---

## Créditos

**Distop-IA VTT** es un fan-made **no comercial** basado en **Vampiro: la Mascarada (V20)** de White Wolf / Paradox Interactive.

El Mundo de Tinieblas y todos sus arquetipos, disciplinas, clanes y mecánicas son propiedad intelectual de Paradox Interactive.

---

## Licencia

Copyright (C) 2026 Guillermo Torres Renner

Este programa es software libre: puedes redistribuirlo y/o modificarlo bajo los términos de la **GNU General Public License versión 3** (GPL-3.0) publicada por la Free Software Foundation.

Este programa se distribuye con la esperanza de que sea útil, pero **SIN NINGUNA GARANTÍA**; ni siquiera la garantía implícita de COMERCIABILIDAD o IDONEIDAD PARA UN PROPÓSITO PARTICULAR. Consulta la GPL-3.0 para más detalles.

Deberías haber recibido una copia de la GNU General Public License junto con este programa en el archivo [LICENSE](./LICENSE). Si no, visita <https://www.gnu.org/licenses/gpl-3.0.html>.

**Resumen práctico** (no sustituye al texto legal):

- Podés usar, copiar, modificar y redistribuir el código libremente.
- Cualquier obra derivada (fork, fork modificado, integración) **debe publicarse también bajo GPL-3.0** y conservar este aviso de copyright.
- Si distribuís binarios o el servicio compilado, debés ofrecer también el código fuente correspondiente.
- No hay garantía y los autores no se hacen responsables del uso.

El Mundo de Tinieblas, Vampiro: la Mascarada y todos sus elementos son marcas registradas de Paradox Interactive. La licencia GPL-3.0 cubre **solo el código fuente** de Distop-IA VTT, no el material de juego.

---

**¿Preguntas?** Abre un Issue o contacta mediante el sitio web.
