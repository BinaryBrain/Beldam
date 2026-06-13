# ---- Build stage: compile TypeScript -> dist/ ----
FROM node:22-alpine AS build
WORKDIR /app

# Install all deps (including dev: typescript, @types/node) for the build.
COPY package.json package-lock.json ./
RUN npm ci

# Compile the sources.
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runtime stage: slim image with only what's needed to run ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Production dependencies only (currently none at runtime, but keeps it correct
# if any are added later).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled server + the game assets it reads at runtime (relative to the cwd).
COPY --from=build /app/dist ./dist
COPY assets ./assets

# Telnet game server port.
EXPOSE 23000

# Run as the unprivileged user that the node image already provides.
USER node

CMD ["node", "dist/index.js"]
