# ==========================================
# ETAPA 1: Construcción del Frontend (Vite)
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ==========================================
# ETAPA 2: Instalación de Dependencias Backend
# ==========================================
FROM node:20-bookworm-slim AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
# Instalación limpia en Debian (glibc compila better-sqlite3 sin inconvenientes)
RUN npm ci --omit=dev

# ==========================================
# ETAPA 3: Imagen Final de Producción (Debian)
# ==========================================
FROM node:20-bookworm-slim AS production

# Instalar dumb-init para gestión adecuada de procesos (PID 1) y curl para healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Crear directorios para subidas, base de datos y logs rotativos
RUN mkdir -p /app/backend/uploads /app/backend/data /app/backend/logs

# Copiar dependencias y código de backend
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend

# Copiar estáticos compilados del frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Asignar permisos al usuario no-root 'node'
RUN chown -R node:node /app

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=8080 \
    DB_PATH=/app/backend/data/database.sqlite \
    UPLOADS_DIR=/app/backend/uploads \
    LOGS_DIR=/app/backend/logs \
    DIST_PATH=/app/frontend/dist

# Cambiar a usuario no-root
USER node

# Exponer el puerto
EXPOSE 8080

# Monitoreo de salud
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# dumb-init garantiza que las señales SIGTERM y SIGINT detengan el proceso limpiamente
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/src/server.js"]
