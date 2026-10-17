# Prompt de Desarrollo y Especificación Técnica para Agente AI (AntiGravity IDE)

## 📌 Proyecto: Sistema Centralizado de Proyección de Presentaciones Académicas (UMG - Campus Villa Nueva)

---

### 1. CONTEXTO Y OBJETIVO DEL SISTEMA

Desarrollar una aplicación web centralizada que funcione como **Portal de Exposiciones y Sala de Proyección** para la **Universidad Mariano Gálvez (UMG - Campus Villa Nueva)**.

El sistema resolverá los cuellos de botella habituales en las jornadas de presentación académica (pérdida de tiempo al cambiar de laptop, memorias USB infectadas o incompatibles, e inestabilidad en la red WiFi del campus). Debe permitir a los estudiantes registrar sus grupos y adjuntar o enlazar sus diapositivas (PDF, PPTX, Canva, Google Slides, Prezi) para que el moderador/catedrático pueda proyectarlas a pantalla completa sin fricción técnica, garantizando **operatividad 100% offline o en red de área local (LAN)**.

---

### 2. REQUISITOS TÉCNICOS Y STACK TECNOLÓGICO

#### A. Backend & Base de Datos
* **Runtime:** Node.js (v20+ LTS) con Express.js.
* **Base de Datos:** **SQLite** utilizando el driver nativo de alto rendimiento `better-sqlite3`.
  * *Optimizaciones de Concurrencia obligatorias:*
    * `PRAGMA journal_mode = WAL;` (Write-Ahead Logging para permitir lecturas y escrituras simultáneas sin colisiones).
    * `PRAGMA busy_timeout = 5000;` (Espera activa de hasta 5 segundos para evitar excepciones de bloqueo).
    * `PRAGMA synchronous = NORMAL;` (Balance óptimo entre integridad y velocidad en disco).
* **Gestión de Archivos Locales:** Multer para almacenamiento local seguro en `./uploads`.
  * *Seguridad:* Generación de nombres hasheados con UUID v4 (`${uuidv4()}-${file.originalname}`) para evitar sobreescritura de archivos homónimos y ataques de traversal.
  * *Validaciones:* Límite de 50MB por archivo y validación de tipos MIME reales (`application/pdf`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`, etc.).

#### B. Sistema de Logging Profesional (Equivalente a Serilog en Node.js)
Para contar con la misma robustez y trazabilidad estructurada que ofrece Serilog en .NET, se implementa **Winston** junto con **`winston-daily-rotate-file`**:
* **Archivos Planos Rotativos:**
  * Generación automática de archivos diarios en `./logs`:
    * `application-%DATE%.log`: Registro consolidado (`info`, `http`, `warn`).
    * `error-%DATE%.log`: Errores críticos (`error`) con stack trace completo.
  * *Políticas de Rotación:* Rotación diaria (`datePattern: 'YYYY-MM-DD'`), compresión automática de archivos archivados (`zippedArchive: true`), tamaño máximo por archivo de 20MB (`maxSize: '20m'`) y retención de logs por 14 días (`maxFiles: '14d'`).
* **Formato Dual:**
  * *Desarrollo:* Salida en consola coloreada y legible con marcas de tiempo.
  * *Producción:* Formato JSON estructurado incluyendo: Timestamp ISO, Nivel de log (`level`), Identificador de correlación (`reqId` o Trace ID), mensaje y metadatos de contexto.
* **Middleware HTTP:** Interceptor de peticiones HTTP para auditar método, ruta, código de estado, tiempo de respuesta y dirección IP del cliente.

#### C. Frontend
* **Framework:** React.js (Vite) con soporte para Hot Module Replacement (HMR).
* **UI Library:** **Material UI (MUI v5)** embebido localmente con iconos directos (`@mui/icons-material`), sin dependencias de CDNs externos.
* **Manejo de Presentaciones:**
  * **Archivos PDF:** Renderizado mediante visor local integrado (`react-pdf` o visor HTML5 local embebido) con controles de página y zoom.
  * **Archivos PPTX:** Lógica dual:
    * *Modo Online:* Embebido mediante Microsoft Office Web Viewer API (`https://view.officeapps.live.com/op/embed.aspx?src=...`).
    * *Modo Offline / Fallback:* Botón de descarga en un clic y atajo para abrir con el PowerPoint local.
  * **Links Externos (Canva, Google Slides, Prezi):** Renderizado en contenedores `<iframe>` con directivas `allowfullscreen` y detección reactiva del estado de red (`navigator.onLine`).

---

### 3. ARQUITECTURA DE SOFTWARE & ESTRUCTURA DEL PROYECTO

Estructura Monorepo organizada, modular y preparada para desarrollo y producción:

```
/umg-presentaciones
├── .github
│   └── workflows
│       └── ci-cd.yml                # Pipeline automatizado de GitHub Actions
├── /backend
│   ├── /src
│   │   ├── /config
│   │   │   └── database.js          # Conexión SQLite con modo WAL y pragmas
│   │   ├── /controllers
│   │   │   ├── groupController.js
│   │   │   └── presentationController.js
│   │   ├── /middlewares
│   │   │   ├── errorMiddleware.js   # Manejador global de excepciones con log
│   │   │   ├── requestLogger.js     # Middleware de auditoría HTTP con reqId
│   │   │   └── uploadMiddleware.js  # Multer con UUID y validación de tipos
│   │   ├── /models
│   │   │   └── groupModel.js
│   │   ├── /routes
│   │   │   ├── apiRoutes.js
│   │   │   └── healthRoutes.js      # Endpoint /health para Docker Healthcheck
│   │   ├── /utils
│   │   │   └── logger.js            # Configuración de Winston + Daily Rotate
│   │   └── server.js                # Entrada Express y graceful shutdown
│   ├── /uploads                     # Archivos de presentaciones persistidos
│   ├── /logs                        # Archivos planos rotativos de log
│   ├── database.sqlite              # Archivo de base de datos
│   └── package.json
├── /frontend
│   ├── /public
│   │   └── /assets                  # Logotipos UMG e iconos locales
│   ├── /src
│   │   ├── /components
│   │   │   ├── PresentationViewer.jsx
│   │   │   ├── GroupCard.jsx
│   │   │   ├── RegistrationModal.jsx
│   │   │   ├── TimerControl.jsx
│   │   │   └── NetworkStatusBadge.jsx
│   │   ├── /pages
│   │   │   ├── ProjectionRoom.jsx
│   │   │   └── DashboardAdmin.jsx
│   │   ├── /theme
│   │   │   └── umgTheme.js          # Paleta institucional UMG
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js               # Configuración HMR para Docker en caliente
│   └── package.json
├── Dockerfile                       # Imagen de producción (Debian Slim + multi-stage)
├── docker-compose.yml               # Orquestación de producción
├── docker-compose.dev.yml           # Orquestación de desarrollo con HOT RELOAD
├── .dockerignore
├── .gitignore
└── package.json                     # Scripts unificados de orquestación
```

---

### 4. SISTEMA DE DISEÑO & REGLAS UX/UI (UMG VILLA NUEVA)

#### Paleta de Colores Institucionales UMG
```javascript
// frontend/src/theme/umgTheme.js
import { createTheme } from '@mui/material/styles';

export const umgTheme = createTheme({
  palette: {
    primary: {
      main: '#002B49',      // Azul Marino Institucional UMG
      light: '#1B4965',
      dark: '#00192D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#D32F2F',      // Rojo UMG
      light: '#EF5350',
      dark: '#9A0007',
      contrastText: '#FFFFFF',
    },
    accent: {
      main: '#C5A059',      // Dorado UMG para acentos y destacados
    },
    background: {
      default: '#F4F6F9',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 700, color: '#002B49' },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
});
```

#### Reglas UX/UI Específicas
1. **Header Principal:** Logotipo oficial de la UMG junto al texto *"Seminario de Graduación - Campus Villa Nueva"*.
2. **Badge de Conectividad:** Indicador visual en la barra superior: `[En Línea]` (Verde) o `[Modo Offline]` (Naranja), informando si los enlaces externos (Canva/Google Slides) están accesibles o si debe usarse el archivo local.
3. **Modo Proyección (Teatro/Pantalla Completa):**
   * Botón destacado *"Proyectar Exposición"* en cada tarjeta de grupo.
   * Al proyectar, se oculta la navegación superior y se expande el visor a `100vw × 100vh`.
   * Atajo de teclado `ESC` o botón flotante semitransparente para salir del modo proyección.
4. **Filtros Dinámicos:** Buscador rápido por número de grupo, tema o nombre de integrantes.

---

### 5. ESPECIFICACIÓN DE FUNCIONALIDADES POR MÓDULO

#### Módulo 1: Registro de Grupos (Estudiantes)
* Formulario interactivo:
  * Número y Nombre del Grupo.
  * Tema de Exposición y Carrera.
  * Lista dinámica de integrantes (agregar/remover nombres).
  * Tipo de Material: `[ Archivo Local (PDF / PPTX) ]` o `[ Enlace Web (Canva / Slides / Prezi) ]`.
* Validaciones: Sanitización de URLs con expresiones regulares seguras y límite de 50MB en archivos.

#### Módulo 2: Central de Mando y Orden de Exposición (Catedrático)
* Reordenamiento del orden de exposición en tiempo real mediante botones de prioridad o *Drag-and-Drop*.
* Cronómetro / Temporizador Integrado: Conteo regresivo configurable (ej. 15 minutos), con alertas visuales al faltar 3 minutos y al finalizar el tiempo.
* Botón de descarga de respaldo de la base de datos y de archivos.

#### Módulo 3: Visualizador Multiformato
* **Detector Inteligente de Contenido:**
  * Si es `.pdf`: Renderizado local con soporte para teclado (flechas izquierda/derecha para cambiar lámina).
  * Si es `.pptx`: Selector dual (visor online con Microsoft Office Web Viewer o botón de descarga directa).
  * Si es `Enlace Externo`: Conversión automática de URLs de Canva/Google Slides a sus versiones embebibles (`/view?embed` o `/pub`).

#### Módulo 4: Observabilidad, Salud y Logs
* **Ruta `/health`:** Verifica el estado de la base de datos SQLite y la disponibilidad de espacio en disco.
* **Registro de Auditoría:** Toda acción relevante (subida de presentación, cambio de orden, error de renderizado) queda grabada en los archivos rotativos de log con su marca de tiempo e IP.

#### Módulo 5: Herramientas de Control Administrativo y Moderación
* **Copia de Seguridad en Caliente (`GET /api/admin/backup`):** Descarga instantánea de la base de datos SQLite en formato binario mediante la API de backup online sin bloqueos de lectura/escritura.
* **Reporte de Asistencia y Exposiciones (`GET /api/admin/report`):** Generación de archivo CSV estructurado con orden, grupo, integrantes, material, duración y fecha para actas de seminario.
* **Reinicio de Jornada (`POST /api/admin/reset-status`):** Restablece el estado de todas las exposiciones a `pending` sin borrar los archivos ni datos de los grupos.

---

### 6. CONFIGURACIÓN DE CONTENEDORIZACIÓN CON DOCKER (BASADO EN DEBIAN)

> **Decisión Técnica:** Se utiliza **Debian Bookworm Slim** para la imagen base de backend y producción debido a que incluye `glibc` estándar, garantizando compatibilidad nativa absoluta con `better-sqlite3` y eliminando problemas de compilación presentes en Alpine.

#### A. Archivo `Dockerfile` (Multi-stage Build para Producción)

```dockerfile
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
# Instalación de dependencias de producción (Debian compila binarios C++ sin problemas)
RUN npm ci --only=production

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

# Asignar permisos al usuario no-root 'node' incluido en Debian
RUN chown -R node:node /app

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=8080 \
    DB_PATH=/app/backend/data/database.sqlite \
    UPLOADS_DIR=/app/backend/uploads \
    LOGS_DIR=/app/backend/logs

# Cambiar a usuario no-root por seguridad
USER node

# Exponer el puerto de la aplicación
EXPOSE 8080

# Monitoreo de salud del contenedor
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# dumb-init garantiza que las señales SIGTERM y SIGINT detengan el proceso limpiamente
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "backend/src/server.js"]
```

#### B. Archivo `docker-compose.yml` (Entorno de Producción)

```yaml
version: '3.8'

services:
  umg-presentaciones:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: umg_app_presentaciones
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      # Persistencia en volúmenes locales del host
      - ./uploads_data:/app/backend/uploads
      - ./sqlite_data:/app/backend/data
      - ./logs_data:/app/backend/logs
    environment:
      - NODE_ENV=production
      - PORT=8080
      - DB_PATH=/app/backend/data/database.sqlite
      - UPLOADS_DIR=/app/backend/uploads
      - LOGS_DIR=/app/backend/logs
      - LOG_LEVEL=info
```

#### C. Archivo `docker-compose.dev.yml` (Entorno de Desarrollo con CAMBIOS EN CALIENTE / HOT RELOAD)

Permite programar en el host y ver los cambios reflejados instantáneamente sin reconstruir la imagen:

```yaml
version: '3.8'

services:
  # Servicio Backend con nodemon o node --watch
  backend-dev:
    image: node:20-bookworm-slim
    container_name: umg_backend_dev
    working_dir: /app/backend
    volumes:
      - ./backend:/app/backend
      - ./uploads_data:/app/backend/uploads
      - ./sqlite_data:/app/backend/data
      - ./logs_data:/app/backend/logs
      - /app/backend/node_modules
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=development
      - PORT=8080
      - DB_PATH=/app/backend/data/database.sqlite
      - UPLOADS_DIR=/app/backend/uploads
      - LOGS_DIR=/app/backend/logs
      - LOG_LEVEL=debug
    command: sh -c "npm install && npm run dev"
    restart: unless-stopped

  # Servicio Frontend con Vite HMR en caliente
  frontend-dev:
    image: node:20-alpine
    container_name: umg_frontend_dev
    working_dir: /app/frontend
    volumes:
      - ./frontend:/app/frontend
      - /app/frontend/node_modules
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:8080
    command: sh -c "npm install && npm run dev -- --host 0.0.0.0"
    restart: unless-stopped
    depends_on:
      - backend-dev
```

*Nota para `frontend/vite.config.js`:* Para asegurar que el Hot Reload funcione en Windows y WSL2 dentro del contenedor, configurar:
```javascript
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
});
```

#### D. Archivo `.dockerignore`

```
node_modules
npm-debug.log
frontend/node_modules
frontend/dist
backend/node_modules
backend/uploads/*
backend/logs/*
sqlite_data/*
uploads_data/*
logs_data/*
.git
.github
.env
.DS_Store
```

---

### 7. CONTROL DE VERSIONES (GIT FLOW) Y PIPELINE CI/CD (GITHUB ACTIONS)

#### A. Estrategia de Control de Versiones con Git Flow
1. **Estructura de Ramas:**
   * `main` / `master`: Ramas de **producción**. Solo reciben merges de `release/*` o `hotfix/*`. Despliegue automático de versiones estables.
   * `develop`: Rama central de **desarrollo e integración continua**. Integra features terminadas y genera artefactos de prueba (`dev-latest`).
   * `feature/<nombre>`: Ramas para desarrollo de nuevas funciones (ej. `feature/panel-moderador`). Nacen de `develop`.
   * `release/<version>`: Ramas de preparación de versión previa a producción.
   * `hotfix/<nombre>`: Correcciones críticas urgentes sobre `main`/`master`.
2. **Convención de Commits (Conventional Commits):**
   * `feat: agregar componente de temporizador con alerta visual`
   * `fix: resolver bloqueo en concurrencia activando modo WAL`
   * `docs: actualizar guía de ejecución local con docker`
   * `chore: configurar rotación de archivos planos en winston`
3. **Etiquetado Semántico (SemVer):**
   * Releases etiquetados mediante tags: `v1.0.0`, `v1.1.0`.

#### B. Pipeline de CI/CD (`.github/workflows/ci-cd.yml`)

El pipeline soporta Git Flow con despliegue automático condicionado a `main` o `master`:

```yaml
name: CI/CD Pipeline - UMG Presentaciones (Git Flow)

on:
  push:
    branches: [ main, master, develop ]
    tags: [ 'v*.*.*' ]
  pull_request:
    branches: [ main, master, develop ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # 1. Integración Continua (Linting & Tests)
  test-and-lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Configurar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: |
            backend/package-lock.json
            frontend/package-lock.json

      - name: Validar dependencias y build del Frontend
        run: |
          cd frontend
          npm ci
          npm run build

      - name: Validar dependencias del Backend
        run: |
          cd backend
          npm ci
          # npm test (si hay suite de pruebas unitarias configurada)

  # 2. Construcción y Publicación de Imagen Docker
  build-and-push:
    needs: test-and-lint
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout del repositorio
        uses: actions/checkout@v4

      - name: Configurar Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Autenticación en GitHub Container Registry (GHCR)
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extraer metadatos de Docker (Tags y Labels)
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=raw,value=latest,enable={{is_default_branch}}
            type=sha,format=short
            type=semver,pattern={{version}}

      - name: Construir y publicar imagen Docker optimizada
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

### 8. GUÍA DE EJECUCIÓN Y DESPLIEGUE

#### A. Desarrollo Local con Hot Reload
```bash
# Iniciar frontend y backend con recarga en caliente
docker compose -f docker-compose.dev.yml up --build

# El frontend estará en http://localhost:5173
# El backend estará en http://localhost:8080
```

#### B. Ejecución en Producción Local (Sala de Proyección / Laptop Offline)
```bash
# Construir y levantar el contenedor único consolidado
docker compose up -d --build

# La aplicación completa estará disponible en http://localhost:8080
```

#### C. Despliegue en Servidor Institucional o Nube (Azure / VPS)
* La imagen empaquetada puede ser desplegada en cualquier host con Docker:
  ```bash
  docker run -d -p 8080:8080 \
    -v $(pwd)/uploads_data:/app/backend/uploads \
    -v $(pwd)/sqlite_data:/app/backend/data \
    -v $(pwd)/logs_data:/app/backend/logs \
    --name umg_presentaciones ghcr.io/<usuario>/umg-presentaciones:latest
  ```

---

### 9. INSTRUCCIÓN DIRECTA PARA EL AGENTE AI EN ANTIGRAVITY IDE

> **Instrucción de Inicialización:**
> Por favor, inicia la estructura de este proyecto Monorepo full-stack basándote en esta especificación técnica:
>
> 1. **Backend en Express:**
>    * Configurar `better-sqlite3` con `PRAGMA journal_mode = WAL;` y timeout en `src/config/database.js`.
>    * Implementar el sistema de logs con **Winston** y `winston-daily-rotate-file` en `src/utils/logger.js`, escribiendo en archivos planos en `/logs` y con middleware de auditoría HTTP.
>    * Configurar Multer con generación de nombres con UUID en `src/middlewares/uploadMiddleware.js`.
>    * Crear la ruta `/health` para validación de salud de la base de datos y disco.
> 2. **Frontend en React + Vite:**
>    * Configurar Material UI (MUI v5) con el tema institucional UMG (`#002B49`, `#D32F2F`, `#C5A059`).
>    * Crear los componentes `PresentationViewer` (visor de PDF local y embebido de Canva/Slides con detección de red) y `TimerControl` (cronómetro de exposición).
>    * Configurar `vite.config.js` con polling para asegurar compatibilidad de HMR en caliente.
> 3. **Contenedorización & CI/CD:**
>    * Crear el `Dockerfile` de producción multi-stage basado en **Debian Bookworm Slim**, con `dumb-init`, usuario no-root `node` y `HEALTHCHECK`.
>    * Crear `docker-compose.yml` (producción) y `docker-compose.dev.yml` (desarrollo con Hot-Reload).
>    * Crear el pipeline `.github/workflows/ci-cd.yml` para GitHub Actions.