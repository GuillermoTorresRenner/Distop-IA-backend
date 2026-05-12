# Distop-IA - Backend

Backend NestJS base para el proyecto Distop-IA. Provee módulos de usuarios, autenticación JWT con cookies, recuperación de contraseña por correo y carga de avatares.

## Stack

- NestJS 11
- Prisma 7 + PostgreSQL 17
- JWT (cookies HTTP-only) + Passport
- Nodemailer + Handlebars (correos)
- Sharp (conversión de avatares a WebP)

## Inicio rápido

```bash
npm install
cp .env .env.local      # ajusta variables si lo necesitas
docker compose -f docker-compose.dev.yml up -d
npx prisma migrate dev --name init
npm run start:dev
```

Swagger en `http://localhost:3000/docs`.

## Módulos

- `auth/` - registro, login, refresh, logout, forgot/reset password.
- `users/` - CRUD básico, paginación, filtros, avatar.
- `uploader/` - subida de avatares (WebP, máx. 5 MB).
- `mail/` - correos transaccionales (bienvenida, recuperación).
- `prisma/` - servicio compartido del cliente Prisma.

## Variables de entorno

Ver `.env`. Mínimo requerido: `PORT`, `JWT_SECRET`, `NODE_ENV`, `DATABASE_URL`.

## Scripts

```bash
npm run start:dev      # watch mode
npm run build          # compilar a dist/
npm test               # unit tests
npm run test:e2e       # e2e tests
npm run lint           # eslint --fix
npm run format         # prettier
```
