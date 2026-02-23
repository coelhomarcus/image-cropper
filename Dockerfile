# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Build backend
FROM node:22-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

# Stage 3: Production
FROM node:22-alpine

RUN apk add --no-cache gifsicle imagemagick libwebp-tools

WORKDIR /app

# Backend production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Copy built files
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

EXPOSE 3002

ENV NODE_ENV=production
ENV PORT=3002

CMD ["node", "backend/dist/index.js"]
