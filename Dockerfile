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
RUN mkdir -p public

FROM node:22-alpine AS production

RUN apk add --no-cache openssl dumb-init libc6-compat

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci --only=production && npm cache clean --force
RUN npx prisma generate

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

RUN mkdir -p public/images/users/avatars && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
