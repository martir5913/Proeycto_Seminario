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

# Instalar dumb-init, gosu, curl para healthcheck y utilidades de renderizado de presentaciones (LibreOffice + Poppler + fuentes compatibles MS Office)
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    gosu \
    curl \
    libreoffice-impress-nogui \
    poppler-utils \
    fonts-dejavu-core \
    fonts-liberation \
    fonts-crosextra-carlito \
    fonts-crosextra-caladea \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Crear directorios para subidas, base de datos, logs rotativos y perfil de LibreOffice para usuario node
RUN mkdir -p /app/backend/uploads/banners /app/backend/data /app/backend/logs /home/node/.config

# Copiar dependencias y código de backend
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend

# Copiar estáticos compilados del frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copiar script de punto de entrada seguro
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Asignar permisos iniciales al usuario no-root 'node'
RUN chown -R node:node /app /home/node

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=8080 \
    DB_PATH=/app/backend/data/database.sqlite \
    UPLOADS_DIR=/app/backend/uploads \
    LOGS_DIR=/app/backend/logs \
    DIST_PATH=/app/frontend/dist \
    HOME=/home/node

# Exponer el puerto
EXPOSE 8080

# Monitoreo de salud
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# dumb-init con entrypoint que garantiza permisos en volúmenes y cambia a usuario node
ENTRYPOINT ["dumb-init", "--", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "backend/src/server.js"]
