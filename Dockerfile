FROM node:24-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM deps AS builder

COPY . .
RUN npm run build

FROM node:242-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S nodejs && adduser -S hono -G nodejs

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder --chown=hono:nodejs /app/dist ./dist

USER hono
EXPOSE 3000

CMD ["node", "dist/index.js"]
