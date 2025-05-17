##### BASE
FROM --platform=linux/amd64 node:20-alpine AS base

##### DEPENDENCIES

FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

##### BUILDER

FROM base AS builder
ARG DATABASE_URL
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# ENV NEXT_TELEMETRY_DISABLED 1

RUN SKIP_ENV_VALIDATION=1 pnpm run build --no-lint

##### DEVELOPMENT

FROM base AS development
WORKDIR /app
ENV NODE_ENV=development

RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["sh", "-c", "pnpm dev"]

##### PRODUCTION

FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["sh", "-c", "pnpm start"]
