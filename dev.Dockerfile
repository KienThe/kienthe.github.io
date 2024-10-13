##### BASE
FROM --platform=linux/amd64 node:20-alpine AS base

##### DEPENDENCIES

FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY prisma ./

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm i; \
    elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else echo "Lockfile not found." && exit 1; \
    fi

##### BUILDER

FROM base AS builder
ARG DATABASE_URL
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# ENV NEXT_TELEMETRY_DISABLED 1

RUN \
    if [ -f pnpm-lock.yaml ]; then npm install -g pnpm && SKIP_ENV_VALIDATION=1 pnpm run build; \
    elif [ -f yarn.lock ]; then SKIP_ENV_VALIDATION=1 yarn build; \
    elif [ -f package-lock.json ]; then SKIP_ENV_VALIDATION=1 npm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Development stage
FROM base AS development
WORKDIR /app
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

COPY --from=builder /app ./
EXPOSE 3000

CMD ["npm", "run", "dev"]

# Final stage
FROM development AS final
WORKDIR /app
COPY --from=development /app ./