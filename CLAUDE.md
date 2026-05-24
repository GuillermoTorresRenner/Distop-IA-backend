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
 ├─ CatalogModule     # catálogos: arquetipos, disciplinas, clanes, trasfondos, méritos/defectos, armas, armaduras
 ├─ CharactersModule  # CRUD personajes (atributos, habilidades, ventajas, equipo)
 ├─ ChroniclesModule  # crónicas, miembros e invitaciones para el VTT
 ├─ TableModule       # gateway WebSocket: tiradas de dados, combate, iniciativa
 ├─ JournalModule     # bitácora de crónicas y personajes
 ├─ SocialModule      # amistades
 └─ PrismaModule      # cliente Prisma compartido
   ↓
PostgreSQL
```

No hay sistema de roles, ni RabbitMQ, ni microservicios. Si necesitas RBAC u otra cosa, se agrega cuando sea necesario.

## Modelos Prisma

Schemas modulares en [prisma/schema/](prisma/schema/):

**Usuarios:**
- `Users` - `id` (uuid), `email` (único), `password`, `isActive`, `avatar`, timestamps. Sin enum Role.
- `PasswordResetToken` - token de recuperación con expiración y bandera `used`.

**Crónicas:**
- `Chronicle` - mesa de juego. Campos: `id`, `name`, `description?`, `setting?`, `narratorId` (FK Users), timestamps.
- `ChronicleMember` - pivot user↔chronicle. Roles: `NARRATOR | PLAYER`. Unique `(chronicleId, userId)`.
- `ChronicleInvitation` - invitación con `token`, `email`, `invitedById`, `invitedUserId?`, `status: PENDING|ACCEPTED|CANCELLED|EXPIRED`, `expiresAt` (7 días), `acceptedAt?`.

**Catálogos:**
- `Archetype` - Naturaleza y Conducta (V20). Campos: `id`, `name` (unique), `description?`, `tooltip?`, `order`, timestamps.
- `Discipline` + `DisciplinePower` + `DisciplinePath` + `DisciplineRitual` - Disciplinas vampíricas. `Discipline`: `id`, `name` (unique), `description?`, `tooltip?`, `order`, `hasPaths` (Boolean, true para Taumaturgia/Nigromancia), timestamps. `DisciplinePower`: `id`, `disciplineId?` (set en monolíticas) | `pathId?` (set en ramificadas) — exactamente uno, `level`, `name`, `summary`, `rollAttribute?`, `rollAbility?`, `rollDifficulty?`, `bloodCost`, `description?`, `tooltip?`, timestamps. `DisciplinePath` (solo Taumaturgia/Nigromancia): `id`, `disciplineId`, `key` (unique por disciplina, snake_case), `name`, `description?`, `tooltip?`, `order` + `powers: DisciplinePower[]`. `DisciplineRitual`: `id`, `disciplineId`, `key`, `level` (1..5), `name`, `description?`, `tooltip?`, `ingredients?`, `castingTime?`, `rollAttribute?`, `rollAbility?`, `rollDifficulty?`, `order`, timestamps.
- `Clan` - Clanes del Camarilla y Sabbat. Campos: `id`, `name` (unique), `sect?`, `disciplines?`, `weakness?`, `description?`, `tooltip?`, `order`, timestamps.
- `MeritFlaw` - Méritos y Defectos del catálogo. Campos: `id`, `name` (unique), `kind` (MERIT | FLAW), `value`, `category?`, `description?`, `tooltip?`, `order`, timestamps.
- `Background` - 10 trasfondos V20 (Aliados, Contactos, Criados, Fama, Generación, Influencia, Mentor, Posición, Rebaño, Recursos). Campos: `id`, `key` (unique), `name` (unique), `category?`, `description?`, `tooltip?`, `order`, timestamps.
- `VirtueInfo` - Virtudes V20 (Conciencia, Autocontrol, Coraje, Convicción, Instintos). Campos: `id`, `key` (unique: conscience|self-control|courage|conviction|instinct), `name` (unique), `description?`, `tooltip?`, `order`, timestamps.

**Personajes:**
- `Character` - atributos, habilidades, ventajas, equipo, humanidad, voluntad, sangre, experiencia, salud. Enum `CharacterKind: PC | NPC | ANTAGONIST`.
- `CharacterAbility` - enlace a habilidades (talents/skills/knowledges).
- `CharacterDiscipline` + `CharacterDisciplinePath` + `CharacterDisciplineRitual` - disciplina aprendida por el personaje. `CharacterDiscipline`: `characterId`, `disciplineId`, `level` (para monolíticas; en ramificadas se deriva del max de paths). `CharacterDisciplinePath`: `characterDisciplineId`, `pathId`, `level` (1..5), `isPrimary` (Boolean) — entrada por senda conocida; reglas V20 (exactamente una primaria, secundarias ≤ primaria) las valida el service. `CharacterDisciplineRitual`: `characterId`, `ritualId`, `disciplineId`, `learnedAt` — los rituales se aprenden uno por uno, no escalan con el nivel.
- `CharacterVirtue` - virtudes (Conciencia, Autocontrol, Coraje).
- `CharacterBackground` - trasfondo con `name` (texto libre, match contra catálogo en el front) y `level`.
- `CharacterMeritFlaw` - entrada con `meritFlawId?` (FK) O `customName+customKind+customValue+customCategory` (modo custom). Mutuamente excluyentes.

**Equipamiento:**
- `WeaponCategory`, `Weapon`, `CharacterWeapon` - armas cuerpo a cuerpo y a distancia (system V20 + custom). `Weapon`: `id`, `name` (unique), `category`, `kind`, `damageBase`, `damageBonus`, `lethal?`, `aggravated?`, `bluntPlus?`, `range?`, `rate?`, `magazine?`, `concealment?`, `description?`, `tooltip?`, `order`, timestamps.
- `Armor`, `CharacterArmor` - armaduras (system V20 + custom). `Armor`: `id`, `name` (unique), `rating`, `penalty`, `description?`, `tooltip?`, `order`, timestamps.

**Mesa Virtual:**
- `DiceRoll` - registro persistente de tiradas: `id`, `characterId?`, `chronicleId`, `sourceKind` (enum: VTM, INITIATIVE, ...), `notation`, `rolls[]`, `total`, `metadata` (Json: para INITIATIVE contiene `{ d10, dexterity, wits, modifier, total }`, para mooks contiene `{ d10, dexterity, wits, modifier, total, mookName }`), timestamps.
- `CombatParticipant` - participante del tracker de combate (Character o Mook). Campos: `id`, `chronicleId`, `characterId?` (null para mooks), `sourceCharacterId?` (FK Character para mooks, relación inversa `sourceCharacter`), `displayName`, `initiative?`, `currentRound`, `turnOrder`, `dexterity?` (int, para mooks), `wits?` (int, para mooks), `healthBruised|Hurt|Injured|Wounded|Mauled|Crippled|Incapacitated: Int @default(0)` (casillas V20 para mooks), timestamps. Índice: `@@index([sourceCharacterId])`.

**Diario y Social:**
- `JournalEntry` - bitácora de crónica o personaje.
- `Friendship` - relaciones entre usuarios.

## Endpoints

**Auth** ([src/auth/auth.controller.ts](src/auth/auth.controller.ts)):
- `POST /api/auth/register` - registro público con email + password.
- `POST /api/auth/login` - retorna user; setea cookies `accessToken` (15m) y `refreshToken` (7d).
- `POST /api/auth/refresh` - rota tokens usando cookie `refreshToken`.
- `GET /api/auth/me` - perfil del usuario autenticado.
- `POST /api/auth/logout` - limpia cookies.
- `POST /api/auth/forgot-password` - envía correo con link de recuperación.
- `POST /api/auth/reset-password` - cambia password con token.

**Users** ([src/users/users.controller.ts](src/users/users.controller.ts)):
- `GET /api/users?page=&pageSize=&email=&isActive=` - listado paginado (auth).
- `GET /api/users/:id` - detalle (auth).
- `PUT /api/users/:id` - actualizar email/password (auth).
- `POST /api/users/:id/avatar` - subir avatar (multipart, máx. 5 MB, jpg/png/webp/gif → WebP).
- `DELETE /api/users/:id` - soft delete (`isActive: false`).

**Uploader** ([src/uploader/uploader.controller.ts](src/uploader/uploader.controller.ts)):
- `POST /api/upload/user-avatar/:userId` - endpoint alternativo de subida.

**Catalog** ([src/catalog/catalog.controller.ts](src/catalog/catalog.controller.ts)):
- `GET /api/catalog/{archetypes,disciplines,merits-flaws,clans,backgrounds,weapon-categories,weapons,armors,virtues}` - listados de catálogos.
- `GET /api/catalog/{attributes,abilities}` - catálogos de rasgo/habilidad con tooltips (incluyen `tooltip?` en cada entrada).
- `POST/PATCH/DELETE /api/catalog/weapons[/:id]` - custom weapons (solo dueño).
- `POST/PATCH/DELETE /api/catalog/armors[/:id]` - custom armors (solo dueño).

**Characters** ([src/characters/characters.controller.ts](src/characters/characters.controller.ts)):
- `GET/POST/PATCH/DELETE /api/characters[/:id]` - CRUD.
- `POST /api/characters/:id/clone` - clonar personaje.
- `POST /api/characters/:id/transfer` - transferir custodia a otro usuario (atómico con asociación a crónica). Body: `{ targetUserId }`. Solo narrador, para PCs sin asociar con `kind='PC'`.

**Chronicles** ([src/chronicles/chronicles.controller.ts](src/chronicles/chronicles.controller.ts)):
- `POST /api/chronicles` - crear crónica (auth). Usuario actual queda como `NARRATOR` y `ChronicleMember` automáticamente.
- `GET /api/chronicles` - lista crónicas donde el usuario es miembro, con `narrator`, `members[]` y `_count`.
- `GET /api/chronicles/:id` - detalle (auth, debe ser miembro): `narrator`, `members[]`, `invitations[]` (sólo PENDING).
- `PATCH /api/chronicles/:id` - actualizar `name|description|setting` (auth, sólo narrador).
- `DELETE /api/chronicles/:id` - eliminar crónica (auth, sólo narrador). Cascade borra members + invitations.
- `GET /api/chronicles/:id/characters` - personajes asociados a la crónica (solo PCs de jugadores + NPCs/Antagonistas del narrador).
- `GET /api/chronicles/:id/associable-characters` - candidatos a asociar. Narrador solo ve NPCs/Antagonistas sin asociar; jugador solo sus PCs sin asociar.
- `GET /api/chronicles/:id/custodied-pcs` - PCs en custodia del narrador (sin asociar, `kind='PC'`, `userId=narratorId`). Solo narrador.
- `POST /api/chronicles/:id/characters` - crear-y-asociar personaje (narrador) o crear-y-asociar PC propio (jugador). Body: `{ kind?, name?, targetUserId? }`. Narrador crea PCs en custodia (sin `ChronicleCharacter`) o NPCs/Antagonistas asociados.
- `POST/DELETE /api/chronicles/:id/characters/:characterId` - asociar/desasociar personaje (jugador con su PC, narrador con NPCs/Antagonistas solo).
- `POST /api/chronicles/:id/invitations` - invitar por email (auth, sólo narrador). Body `{ email }`. Crea `ChronicleInvitation` con token aleatorio (7 días). Si el email pertenece a un usuario registrado → envía correo con `${FRONTEND_URL}/invitations/<token>`. Si no → envía correo con `${FRONTEND_URL}/register?invite=<token>`. Errores: 400 si ya es miembro o ya hay invitación pendiente para ese email.
- `DELETE /api/chronicles/:id/invitations/:invitationId` - cancela invitación pendiente (auth, narrador).
- `DELETE /api/chronicles/:id/members/:userId` - expulsa miembro (auth, narrador). No permite remover al narrador.

**Invitations** ([src/chronicles/invitations.controller.ts](src/chronicles/invitations.controller.ts)):
- `GET /api/invitations/token/:token` - **público**. Preview para páginas de aceptación/registro. Devuelve `{ chronicle, invitedBy, status, expiresAt }` (status pasa a `EXPIRED` si `expiresAt < now`).
- `GET /api/invitations` - lista invitaciones pendientes dirigidas al usuario actual (auth). Match por `invitedUserId` o por `email`.
- `POST /api/invitations/:token/accept` - acepta (auth). Valida que el email del invite coincide con el del usuario logueado. Si OK, crea `ChronicleMember` con rol `PLAYER` y marca invitación `ACCEPTED`.

**Table (WebSocket + REST)** ([src/table/table.gateway.ts](src/table/table.gateway.ts), [src/table/table.controller.ts](src/table/table.controller.ts)):

*WebSocket:*
- `roll:initiative` - evento cliente→servidor. Body: `{ characterId, label?, isPublic?, modifier? }`. Valida permisos (PC: dueño o narrador; NPC/Antagonista: solo narrador). Tira `1d10` server-side + Destreza + Astucia + modificador circunstancial. Persiste en `DiceRoll` con `sourceKind='INITIATIVE'` y `metadata` con desglose. Emite `roll:result` (visibilidad según `isPublic`). Inscribe/actualiza personaje en tracker e emite `combat:state`.

*REST:*
- `POST /api/chronicles/:id/combat/clone-antagonist` - clonar NPC/Antagonista en N "mooks" (copias sin `Character` real, con stats embebidos). Body: `{ sourceCharacterId, count (1..20), baseName? }`. Valida que la plantilla esté asociada y sea NPC/ANTAGONIST. Crea participantes con `characterId=null`, `sourceCharacterId` set, `displayName="<base> 1..N"`, copiando `dexterity/wits` de la plantilla. Emite `combat:state`. Solo narrador.
- `PATCH /api/chronicles/:id/combat/participants/:pid/health` - actualizar casillas V20 de mook. Body: `{ bruised?, hurt?, injured?, wounded?, mauled?, crippled?, incapacitated? }`. Valida clamp por nivel V20. Solo aplica a mooks (`characterId=null`). Emite `combat:state`. Solo narrador.
- `POST /api/chronicles/:id/combat/participants/:pid/roll-initiative` - tirar iniciativa para mook server-side. Tira `1d10` + stats embebidos; persiste en `DiceRoll` con `characterId=null` y `metadata` con desglose + `mookName`. Actualiza `initiative` del participant. Emite `combat:state` (visibilidad solo narrador). Solo narrador.

**Mail templates** (Distop-IA · La Mascarada VTT — paleta sangrienta) en [src/mail/templates/](src/mail/templates/):

- `welcome.hbs` - tras registro. Variables: `name`, `email`, `platformUrl`, `year`.
- `password-recovery.hbs` - tras forgot-password. Variables: `name`, `recoveryUrl`, `year`.
- `chronicle-invite-existing.hbs` - invite a usuario registrado. Variables: `email`, `inviterEmail`, `chronicleName`, `acceptUrl`, `expiresAt`, `year`.
- `chronicle-invite-new.hbs` - invite a email no registrado. Variables: `email`, `inviterEmail`, `chronicleName`, `registerUrl`, `expiresAt`, `year`.

`MailService` ([src/mail/mail.service.ts](src/mail/mail.service.ts)) expone `sendWelcome`, `sendPasswordRecovery`, `sendChronicleInviteExisting`, `sendChronicleInviteNew`. Subject prefix `Distop-IA · …`. Render helper centralizado (`this.render(template, data)`).

**Vault de disciplinas (`prisma/vault/disciplinas/`):**

Cada disciplina es un archivo `.md` con frontmatter YAML + cuerpo Markdown.
Hay dos formatos según el flag `kind`:

- `kind: monolithic` (default si se omite) — disciplina clásica con un único array
  `powers: [×5]`. Ejemplo: `auspex.md`, `dominacion.md`, etc.
- `kind: paths` — disciplina ramificada (Taumaturgia, Nigromancia). En lugar de
  `powers` declara `paths: [{ key, name, order, tooltip, powers: [×5] }, ...]`
  + opcional `rituals: [{ key, level, name, tooltip, ingredients, castingTime,
  rollAttribute, rollAbility, rollDifficulty }, ...]`. El cuerpo del .md usa
  encabezados `## Senda — {nombre} {#key}` y `### Poder N — {nombre}` (subseccion
  dentro de la senda) para que el loader pueda capturar la descripción larga
  de cada poder. Los rituales usan `## Ritual — {nombre} {#ritualKey}`. Las
  `key`s deben ir en `snake_case` y matchear las del frontmatter exactamente.

El loader (`prisma/vault-loader.ts`) valida ambos formatos via `z.discriminatedUnion('kind', ...)`
y verifica que cada `rollAbility` exista en `prisma/vault/habilidades/` (o sea el
nombre de la propia disciplina). Para añadir una nueva senda o ritual, edita
solo el `.md` y vuelve a correr `npx prisma db seed` — el seed es idempotente.

**Migraciones recientes:**
- `20260518020826_add_dice_roll_metadata` - agrega columna `metadata Json?` a `DiceRoll` para guardar desglose de tiradas (ej. iniciativa con d10, dexterity, wits, modifier).
- `20260518025656_add_background_catalog` - nuevo modelo `Background` con catálogo de trasfondos V20.
- `20260518055413_add_catalog_tooltips_and_virtues` - agrega columna `tooltip String?` a todos los modelos de catálogo (AttributeInfo, AbilityInfo, MeritFlaw, Clan, Discipline, DisciplinePower, Background, HealthLevelInfo, Archetype, Armor, Weapon); nuevo modelo `VirtueInfo` para virtudes canónicas V20.
- `20260521040330_discipline_paths_and_rituals` - agrega flag `hasPaths` a `Discipline`; nullable `disciplineId` y nuevo `pathId?` en `DisciplinePower` (mutuamente excluyentes); nuevos modelos `DisciplinePath`, `DisciplineRitual`, `CharacterDisciplinePath` y `CharacterDisciplineRitual` para soportar Taumaturgia y Nigromancia con sus sendas y rituales.
- `20260524004423_combat_participant_mook_stats` - extiende `CombatParticipant` con campos `sourceCharacterId` (FK inversa `sourceCharacter`), `dexterity?`, `wits?`, `healthBruised|Hurt|Injured|Wounded|Mauled|Crippled|Incapacitated` (casillas V20 para mooks); agrega índice `@@index([sourceCharacterId])`; nullable `characterId?` en `DiceRoll` para soportar tiradas de mooks sin Character.

**Notas sobre el seeder (`prisma/seed.ts`):**
- Armas (`Weapon`) y armaduras (`Armor`) se persisten con un patrón **findFirst + create/update** por `(name, system=true)`, NO con `deleteMany + createMany`. Razón: `CharacterWeapon` y `CharacterArmor` mantienen FKs `Restrict` hacia esos catálogos; borrar masivamente rompe la integridad referencial cuando ya existen personajes con equipo asociado.
- Disciplinas con `hasPaths` (Taumaturgia, Nigromancia): el seed elimina los poderes monolíticos huérfanos (`disciplineId = X AND pathId IS NULL`) antes de recrear los `DisciplinePath` y sus poderes ramificados. Esto evita acumular registros viejos cuando una disciplina cambia de monolítica a ramificada.
- Vault frontmatter (YAML) que contenga `: ` (dos puntos + espacio) en un valor escalar (`tooltip`, `weakness`, `nickname`, `sect`, etc.) debe ir entre comillas dobles. El loader Zod aborta con un error legible si encuentra YAML inválido. Hay un helper `/tmp/fix_yaml.py` que automatiza el encomillado si haces edición masiva.
- Limpieza de huérfanos: si renombras o eliminas archivos del vault, los registros antiguos quedan en BD (el seed solo hace upsert, no delete). Para limpiar: `DELETE FROM archetypes WHERE name IN (...) AND NOT EXISTS (SELECT 1 FROM characters WHERE "natureId" = archetypes.id OR "demeanorId" = archetypes.id)` y análogo para `merits_flaws` referenciando `character_merits_flaws`.

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

## Reglas de permisos (Personajes y Crónicas)

**PCs en mesa:**
- Un jugador puede asociar su PC propio a una crónica via `POST /api/chronicles/:id/characters/:characterId`. Esto crea un registro `ChronicleCharacter`.
- El narrador **no puede** asociar PCs (propias ni ajenas) a la crónica. Los endpoints que verifican esto lanzan `ForbiddenException` si `character.kind === 'PC'` y el caller no es el dueño.

**PCs en custodia:**
- El narrador crea PCs con `kind='PC'` via `POST /api/chronicles/:id/characters` y quedan con `userId = narratorId` **sin** crear `ChronicleCharacter`. Son "PCs en custodia".
- El narrador puede listar sus PCs en custodia via `GET /api/chronicles/:id/custodied-pcs`.
- El narrador transfiere custodia a un jugador via `POST /api/characters/:id/transfer { targetUserId }`. Esto **atómicamente**: cambia `userId` al jugador, crea `ChronicleCharacter` si la crónica está asociada al transfer, y devuelve el character actualizado.

**NPCs / Antagonistas:**
- Solo el narrador crea NPCs/Antagonistas via `POST /api/chronicles/:id/characters` con `kind='NPC'|'ANTAGONIST'`. Se asocian automáticamente.
- `userId` siempre = `narratorId`.
- No son transferibles.

**Asociabilidad:**
- `GET /api/chronicles/:id/associable-characters` filtra por:
  - Narrador: solo ve sus NPCs/Antagonistas sin asociar (nunca PCs).
  - Jugador: solo ve sus PCs sin asociar.
- Solo el dueño de un PC puede asociarlo; solo el narrador puede desasociar NPCs/Antagonistas.

**Combate (mooks):**
- Solo el narrador puede clonar antagonistas via `POST /api/chronicles/:id/combat/clone-antagonist`.
- Mooks tienen `characterId = null`, `sourceCharacterId = <template>`, stats embebidos (`dexterity`, `wits`), casillas V20.
- Tiradas de mooks (`roll:initiative`) resultan en `DiceRoll` con `characterId = null` y metadata incluyendo `mookName`.
- Visibilidad: el narrador ve `sourceCharacterId/Name`, `dexterity`, `wits`, `health`. Los jugadores solo ven PCs reales (`characterId != null` con `kind='PC'`).

## Notas para extender

- Si vas a agregar roles, hay que reintroducir `RolesGuard` y enum Role en Prisma.
- Si añades modelos, crea un archivo `prisma/schema/Nombre.prisma` y corre `npx prisma migrate dev --name descripcion`.
- Si añades módulos nuevos, regístralos en [src/app.module.ts](src/app.module.ts).
