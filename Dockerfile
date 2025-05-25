# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i; \
    else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && yarn install; \
    fi

# Development target
FROM base AS development
COPY . /app
# Note: Don't expose ports here, Compose will handle that for us
CMD \
    if [ -f yarn.lock ]; then yarn dev; \
    elif [ -f package-lock.json ]; then npm run dev; \
    elif [ -f pnpm-lock.yaml ]; then pnpm dev; \
    else npm run dev; \
    fi

# Production target
FROM base AS production
COPY . /app
RUN \
    if [ -f yarn.lock ]; then yarn build; \
    elif [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then pnpm build; \
    else npm run build; \
    fi

# Start Next.js in production mode
CMD \
    if [ -f yarn.lock ]; then yarn start; \
    elif [ -f package-lock.json ]; then npm start; \
    elif [ -f pnpm-lock.yaml ]; then pnpm start; \
    else npm start; \
    fi
