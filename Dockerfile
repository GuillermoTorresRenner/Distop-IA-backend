FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache make gcc g++ python3 openssl libc6-compat

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig*.json ./

RUN npm ci && npm cache clean --force
RUN npx prisma generate

COPY . .

RUN npm run build
RUN test -f dist/main.js || (echo "Build failed: dist/main.js not found" && ls -la dist/ && exit 1)

# Compilamos `prisma/seed.ts` por separado a CommonJS para que pueda correr
# con `node` puro en la imagen de producción (que no tiene ts-node).
RUN npm run build:seed
RUN test -f dist-seed/prisma/seed.js || (echo "Seed build failed" && ls -la dist-seed/ && exit 1)

RUN mkdir -p public

FROM node:22-slim AS production

# Debian slim tiene glibc nativo — necesario para el binario de yt-dlp.
# ffmpeg desde el repo oficial de Debian; curl para descargar yt-dlp.
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    openssl \
    ffmpeg \
    curl \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# yt-dlp: instalamos el binario oficial (glibc, siempre la última versión).
# Se auto-actualiza en cada deploy → nunca queda desactualizado en producción.
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && /usr/local/bin/yt-dlp --version

RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs nestjs

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci --only=production && npm cache clean --force
RUN npx prisma generate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-seed ./dist-seed
COPY --from=builder /app/public ./public

RUN mkdir -p public/images/users/avatars && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
