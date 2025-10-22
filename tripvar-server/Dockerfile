# Multi-stage Dockerfile for both development and production

# Base stage
FROM node:25-alpine AS base
WORKDIR /usr/src/app
RUN apk --no-cache add curl
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install
COPY . .
EXPOSE 8000
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
RUN npm ci --only=production && npm cache clean --force
COPY --chown=nodejs:nodejs . .
RUN mkdir -p /usr/src/app/logs && chown -R nodejs:nodejs /usr/src/app/logs
USER nodejs
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1
CMD ["npm", "start"]