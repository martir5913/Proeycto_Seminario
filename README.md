# 🎓 Sistema Centralizado de Proyección de Presentaciones Académicas
### Universidad Mariano Gálvez de Guatemala (UMG) • Campus Villa Nueva
**Facultad de Ingeniería en Sistemas • Seminario de Graduación**

---

## 📋 Descripción General

Aplicación web centralizada que funciona como **Portal de Exposiciones y Sala de Proyección para el Auditorio**, diseñada para resolver los cuellos de botella habituales en jornadas académicas de defensa de proyectos (tiempos muertos por cambio de laptops, memorias USB, o fallas de internet en el estrado).

* **Operatividad:** Funciona tanto en **red local (LAN) u offline**, como conectado a internet.
* **Soporte Multiformato:**
  * **PDF:** Visor local interactivo con navegación por teclado y controles de zoom.
  * **PPTX:** Reproductor nativo en el navegador mediante extracción OpenXML (100% offline, sin necesidad de Microsoft Office ni software de terceros).
  * **Enlaces Web:** Embebido directo en iframe de Canva, Google Slides y Prezi con detección de estado de conectividad (`online`/`offline`).
* **Auditorio en Vivo:** Pantalla de proyección solemnizada con carrusel multimedia institucional, reloj en vivo, discurso de bienvenida y llamado al estrado *"Próximo en Exponer"*.
* **Panel de Control (CMS):** Registro de grupos, reordenamiento dinámico de turnos, cronómetro de exposición (15 min) con alertas visuales, respaldo binario en caliente de SQLite y generación de actas en CSV.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Backend** | Node.js (v20 LTS), Express.js 4.x |
| **Base de Datos** | SQLite 3 optimizado con `better-sqlite3` (`PRAGMA journal_mode = WAL`) |
| **Logging** | Winston estructurado con rotación diaria automática (`winston-daily-rotate-file`) |
| **Frontend** | React 18, Vite 6, Material UI v5 (MUI) con paleta institucional UMG |
| **Contenedores** | Docker & Docker Compose (Debian Bookworm Slim multi-stage) |

---

## ⚙️ Requisitos Previos

Dependiendo de cómo desees ejecutar el sistema:

### Opción A (Recomendada con Docker):
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución (con motor WSL 2 en Windows).

### Opción B (Ejecución Local directa en el Sistema Operativo):
* [Node.js v20 LTS](https://nodejs.org/) (versión recomendada de soporte extendido).
  > **Nota sobre Node.js:** Se recomienda encarecidamente utilizar **Node.js v20 LTS** para asegurar la descarga directa de los binarios precompilados de `better-sqlite3`. Si utilizas versiones experimentales como Node v25, se requerirán herramientas de compilación C++ de Visual Studio (*C++ Build Tools*).
* [Git](https://git-scm.com/)

---

## 🚀 Método 1: Levantar con Docker (Recomendado)

Docker proporciona un entorno aislado en Linux Debian que evita cualquier conflicto de compilación de librerías nativas.

### 1.1 Iniciar Docker Desktop
Asegúrate de que la aplicación **Docker Desktop** se encuentre abierta y con el motor Linux iniciado.

### 1.2 Modo Desarrollo (Con Hot-Reload / Recarga en Caliente)
Ideal para realizar modificaciones en el código y ver los cambios reflejados al instante:

```bash
# Levanta los contenedores de frontend y backend con recarga en caliente
npm run docker:dev:up
```
*(Comando nativo equivalente: `docker compose -f docker-compose.dev.yml up -d --build`)*

* **Frontend (Vite):** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:8080](http://localhost:8080)
* **Healthcheck:** [http://localhost:8080/health](http://localhost:8080/health)

Para detener el entorno de desarrollo:
```bash
npm run docker:dev:down
```

---

### 1.3 Modo Producción (Contenedor Único Consolidado)
Compila el Frontend de React e integra los estáticos dentro del servidor Express en un único contenedor autónomo optimizado con `dumb-init`:

```bash
# Construir y levantar el contenedor de producción
npm run docker:prod:up
```
*(Comando nativo equivalente: `docker compose up -d --build`)*

* **Aplicación Completa (Frontend + Backend):** [http://localhost:8080](http://localhost:8080)

Para detener producción:
```bash
npm run docker:prod:down
```

---

### 1.4 Carga de Datos de Demostración (Seed) en Docker
Para inicializar la base de datos con los 3 grupos muestra (PDF, PPTX y Canva) y banners institucionales:

* **En Modo Desarrollo:**
  ```bash
  docker exec umg_backend_dev npm run seed
  ```
* **En Modo Producción:**
  ```bash
  docker exec umg_app_presentaciones node backend/src/utils/seed.js
  ```

---

## 💻 Método 2: Levantar de Manera Local (Sin Docker)

Si prefieres ejecutar el proyecto directamente en Windows, Linux o macOS:

### Paso 1: Configurar Variables de Entorno
Copia el archivo de ejemplo para crear el `.env`:
```powershell
# En Windows PowerShell:
Copy-Item .env.example .env

# En Linux / macOS / Git Bash:
cp .env.example .env
```

### Paso 2: Instalar Dependencias del Monorepo
Instala los paquetes tanto para el backend como para el frontend:
```bash
npm run install:all
```
*(O de forma manual: `cd backend && npm install && cd ../frontend && npm install && cd ..`)*

### Paso 3: Inicializar la Base de Datos con Datos Semilla (Opcional pero Recomendado)
Crea las tablas SQLite, los banners iniciales y los 3 grupos de prueba:
```bash
npm run seed
```

### Paso 4: Iniciar los Servidores

Tienes dos alternativas para correr en local:

#### Alternativa A: Modo Desarrollo en Paralelo (Dos Terminales)
1. **Terminal 1 (Backend con auto-recarga):**
   ```bash
   npm run dev:backend
   ```
   *Servidor escuchando en: `http://localhost:8080`*

2. **Terminal 2 (Frontend con Vite HMR):**
   ```bash
   npm run dev:frontend
   ```
   *Aplicación abierta en: `http://localhost:5173`*

*(El frontend redirecciona automáticamente las peticiones de `/api`, `/uploads` y `/health` al backend).*

---

#### Alternativa B: Modo Producción Local Monolítico (Una Sola Terminal)
1. **Compilar el Frontend:**
   ```bash
   npm run build:frontend
   ```
   *Esto generará los archivos estáticos en `frontend/dist`.*

2. **Iniciar el Servidor Backend:**
   ```bash
   npm --prefix backend start
   ```
   *Express detectará automáticamente la carpeta `dist` y servirá toda la aplicación en:*
   **[http://localhost:8080](http://localhost:8080)**

---

## 🌐 URLs y Navegación del Sistema

| Módulo | Ruta en Navegador | Descripción |
| :--- | :--- | :--- |
| **Sala de Proyección** | `/` o `/proyeccion` | Lista de grupos, orden de turnos, filtro de búsqueda y apertura de presentaciones a pantalla completa. |
| **Pantalla de Auditorio** | `/auditorio` | Escenario solemne con carrusel institucional continuo, reloj y tarjeta del próximo expositor en estrado. |
| **Panel de Control / CMS** | `/admin` | Configuración de banners, discursos solemnes, registro/edición de grupos, backups `.sqlite` y actas CSV. |
| **Diagnóstico de Salud** | `/health` | Endpoint JSON con estado de SQLite, almacenamiento y uso de memoria. |
| **API REST de Grupos** | `/api/groups` | Endpoint de datos para consultas e integraciones. |

---

## 📦 Scripts Disponibles en `package.json`

| Comando | Acción |
| :--- | :--- |
| `npm run install:all` | Instala dependencias en backend y frontend simultáneamente |
| `npm run dev:backend` | Inicia el backend en modo desarrollo con `node --watch` |
| `npm run dev:frontend` | Inicia el servidor de desarrollo de Vite con HMR |
| `npm run build:frontend` | Compila el bundle de producción de React |
| `npm run seed` | Puebla la base de datos con archivos y grupos de prueba |
| `npm run docker:dev:up` | Construye y levanta el entorno de desarrollo en Docker |
| `npm run docker:dev:down`| Detiene y limpia los contenedores de desarrollo |
| `npm run docker:prod:up` | Construye y ejecuta el contenedor optimizado de producción |
| `npm run docker:prod:down`| Detiene el contenedor de producción |

---

## ☁️ Despliegue en Producción (Azure VM con GitHub Actions)

Para poner la plataforma en producción en una Máquina Virtual de **Microsoft Azure** utilizando entrega continua con **GitHub Actions**, consulte el instructivo detallado paso a paso:

📖 **[Guía de Despliegue en Azure VM con GitHub Actions (DEPLOY_AZURE_GITHUB_ACTIONS.md)](file:///c:/Users/fmartir/source/Proeycto_Seminario/DEPLOY_AZURE_GITHUB_ACTIONS.md)**

---

## 🔧 Solución de Problemas Comunes (Troubleshooting)

### 1. `Could not locate the bindings file (...better_sqlite3.node)` al correr en local:
* **Causa:** Estás ejecutando una versión de Node.js no-LTS (como Node v25) en un equipo sin las herramientas de compilación C++ de Visual Studio.
* **Solución:** Cambia a **Node.js v20 LTS** (por ejemplo mediante `nvm use 20`) o levanta el proyecto utilizando **Docker** (`npm run docker:dev:up`).

### 2. `failed to connect to the docker API at ... dockerDesktopLinuxEngine`:
* **Causa:** La aplicación Docker Desktop está cerrada o el motor Docker se está iniciando.
* **Solución:** Abre la aplicación **Docker Desktop** en Windows y espera unos segundos a que el icono se muestre en color verde (Engine running) antes de ejecutar los comandos `npm run docker:...`.

### 3. `Error: EACCES: permission denied` al alternar entre dev y prod en Docker:
* **Causa:** Los contenedores de desarrollo crean archivos en `./logs_data`, `./sqlite_data` o `./uploads_data` con permisos de root, impidiendo que el contenedor seguro de producción (`USER node`) escriba sobre ellos.
* **Solución:** Otorga permisos de escritura en los directorios de datos en la máquina anfitriona:
  ```bash
  docker run --rm -v "${PWD}/logs_data:/logs" -v "${PWD}/sqlite_data:/data" -v "${PWD}/uploads_data:/uploads" alpine sh -c "chmod -R 777 /logs /data /uploads"
  ```

---

## 🏛️ Créditos y Autoría
* **Institución:** Universidad Mariano Gálvez de Guatemala (Campus Villa Nueva)
* **Carrera:** Facultad de Ingeniería en Sistemas de Información y Ciencias de la Computación
* **Cátedra:** Seminario de Graduación 2026
