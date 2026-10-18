# Guía de Despliegue en Azure VM con GitHub Actions (CI/CD)
### Portal de Exposiciones y Sala de Proyección — UMG Villa Nueva

Esta guía detalla el proceso completo para desplegar la plataforma en una **Máquina Virtual de Microsoft Azure** utilizando integración y entrega continua (**CI/CD con GitHub Actions** y **Docker**).

---

## 1. Validación de Compatibilidad del Contenedor Docker

El contenedor ha sido optimizado y validado para garantizar compatibilidad nativa con los diferentes formatos de exposición:

| Tipo de Presentación | Motor de Procesamiento en Contenedor | Compatibilidad y Características |
| :--- | :--- | :--- |
| **PowerPoint (.pptx / .ppt)** | `libreoffice-impress-nogui` + `pdftoppm` | Renderizado nativo a PNGs de alta resolución (1080p). Se han incluido las fuentes métricamente idénticas a Microsoft Office (`fonts-liberation`, `fonts-crosextra-carlito` para **Calibri** y `fonts-crosextra-caladea` para **Cambria**) para evitar deformación de textos o saltos de línea. |
| **Documentos PDF (.pdf)** | `poppler-utils` (`pdftoppm` a 150 DPI) | Conversión rápida de cada página a diapositiva navegable en pantalla completa, preservando vectores y colores exactos. |
| **Presentaciones Canva** | Parser Inteligente de Enlaces Canva | Detección automática de enlaces cortos (`canva.link`) y enlaces completos (`canva.com/design/...`), incrustación fluida en visor de proyección con soporte para pantalla completa (`allow="fullscreen; autoplay"`). |
| **Enlaces Web / Google Slides** | Visor Iframe Embebido Responsivo | Carga interactiva con botón de apertura en pestaña externa de contingencia. |

### Persistencia de Datos Garantizada
El contenedor utiliza tres volúmenes montados en el host:
1. `uploads_data` (`/app/backend/uploads`): Almacena diapositivas PPTX, PDF, imágenes generadas (`slides_*`) y banners del carrusel.
2. `sqlite_data` (`/app/backend/data`): Base de datos `database.sqlite` con grupos, temas, notas, estados y configuración del auditorio.
3. `logs_data` (`/app/backend/logs`): Registro rotativo diario de auditoría con Winston.

> [!IMPORTANT]
> Los datos subidos por los estudiantes y la configuración del seminario **nunca se pierden** al desplegar una nueva versión, ya que residen en el sistema de archivos del servidor host fuera del ciclo de vida del contenedor.

---

## 2. Requisitos Previos en Microsoft Azure

### 2.1 Especificaciones de la Máquina Virtual (VM)
- **Sistema Operativo**: Ubuntu 22.04 LTS o 24.04 LTS (o Debian 12 Bookworm).
- **Tamaño sugerido**:
  - **Recomendado**: `Standard_B2s` (2 vCPU, 4 GiB RAM) o `Standard_B2ms` (2 vCPU, 8 GiB RAM).
  - *Nota*: La conversión gráfica de diapositivas PPTX extensas con LibreOffice requiere al menos 2 GB de memoria RAM libre.
- **Disco**: 30 GB SSD estándar o premium.

### 2.2 Reglas de Red (Azure Network Security Group - NSG)
En el portal de Azure, diríjase a su máquina virtual > **Redes (Networking)** y asegúrese de tener abiertas las siguientes reglas de puerto de entrada:

| Prioridad | Nombre | Puerto | Protocolo | Origen | Propósito |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1000 | `Allow-SSH` | `22` | TCP | Cualquier o IP de confianza | Acceso SSH y GitHub Actions Runner |
| 1010 | `Allow-HTTP` | `80` | TCP | Cualquier (`*`) | Acceso al auditorio web |
| 1020 | `Allow-HTTPS` | `443` | TCP | Cualquier (`*`) | Tráfico cifrado SSL (Opcional con Nginx) |
| 1030 | `Allow-Custom-8080` | `8080` | TCP | Cualquier (`*`) | Puerto alternativo directo |

---

## 3. Preparación de la Máquina Virtual en Azure (Paso Único)

Conéctese a su máquina virtual mediante SSH:
```bash
ssh azureuser@<IP_PUBLICA_AZURE>
```

### Paso 3.1: Actualizar el sistema e instalar Docker
Ejecute el script oficial automatizado de Docker:
```bash
# 1. Actualizar repositorios
sudo apt-get update && sudo apt-get upgrade -y

# 2. Instalar Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Habilitar ejecución sin sudo para el usuario actual
sudo usermod -aG docker $USER

# 4. Instalar Docker Compose Plugin
sudo apt-get install -y docker-compose-plugin

# 5. Aplicar cambios de grupo (o reiniciar sesión)
newgrp docker
```

Verifique la instalación:
```bash
docker --version
docker compose version
```

### Paso 3.2: Crear el directorio de despliegue en la VM
Cree la estructura donde residirá la aplicación y sus datos persistentes:
```bash
sudo mkdir -p /opt/umg-presentaciones/uploads_data
sudo mkdir -p /opt/umg-presentaciones/sqlite_data
sudo mkdir -p /opt/umg-presentaciones/logs_data
sudo chown -R $USER:$USER /opt/umg-presentaciones
```

---

## 4. Configuración de Secretos en GitHub Actions

Para que el pipeline de GitHub Actions pueda conectarse a su Azure VM y desplegar automáticamente cada cambio en la rama `main` o `master`:

1. Vaya a su repositorio en GitHub: **Settings** > **Secrets and variables** > **Actions**.
2. Haga clic en **New repository secret** y configure las siguientes variables:

| Nombre del Secreto | Descripción | Ejemplo de Valor |
| :--- | :--- | :--- |
| `AZURE_VM_HOST` | IP Pública o Nombre DNS de su Máquina Virtual de Azure | `20.120.45.10` o `umg-seminario.eastus.cloudapp.azure.com` |
| `AZURE_VM_USER` | Usuario de administración configurado en la VM | `azureuser` |
| `AZURE_VM_SSH_KEY` | Llave privada SSH completa (`id_rsa` o `id_ed25519`) para autenticar en la VM | `-----BEGIN OPENSSH PRIVATE KEY----- ... -----END OPENSSH PRIVATE KEY-----` |
| `AZURE_VM_PORT` | *(Opcional)* Puerto SSH | `22` |

> [!TIP]
> **Generar una llave SSH dedicada para GitHub Actions**:
> Si desea una llave específica para el despliegue automático, en su terminal ejecute:
> ```bash
> ssh-keygen -t ed25519 -C "github-actions-deploy@umg" -f ~/.ssh/github_deploy_key
> ```
> Agregue el contenido de `~/.ssh/github_deploy_key.pub` en el archivo `~/.ssh/authorized_keys` de su máquina virtual de Azure, y coloque el contenido de `~/.ssh/github_deploy_key` en el secreto `AZURE_VM_SSH_KEY` de GitHub.

---

## 5. Cómo Funciona el Pipeline Automatizado de Despliegue

El archivo [`.github/workflows/ci-cd.yml`](file:///.github/workflows/ci-cd.yml) ejecuta las siguientes etapas de forma completamente desatendida:

```mermaid
flowchart LR
    A[git push main] --> B[1. Validación Frontend & Backend]
    B --> C[2. Construcción Docker Multi-Etapa]
    C --> D[Publicación en GitHub Packages GHCR]
    D --> E[3. Conexión SSH a Azure VM]
    E --> F[docker pull + docker run en Puerto 80]
    F --> G[✅ Sitio en Vivo en Azure]
```

1. **Test & Lint**: Valida la compilación limpia de Vite y las dependencias de Node.js.
2. **Build & Push**: Construye la imagen basada en Debian Bookworm Slim con LibreOffice, Poppler y fuentes compatibles con Microsoft Office, etiquetándola y publicándola en `ghcr.io/martir5913/proeycto_seminario:latest`.
3. **Deploy Production**: Se conecta a la VM en Azure por SSH seguro:
   - Descarga la nueva imagen (`docker pull`).
   - Detiene la versión anterior.
   - Levanta el nuevo contenedor montando los directorios de datos persistentes.
   - Limpia imágenes viejas en disco (`docker image prune -f`).

---

## 6. Verificación y Monitoreo del Sitio en Azure

Una vez concluido el despliegue automático:

1. Abra su navegador web e ingrese a:
   ```
   http://<IP_PUBLICA_AZURE>/
   ```
2. Podrá acceder directamente a la sala de proyección, la vista del auditorio, el catálogo y el panel administrativo.
3. Healthcheck del servicio:
   ```
   http://<IP_PUBLICA_AZURE>/health
   ```

### Comandos de Diagnóstico Útiles en la VM
```bash
# Ver estado del contenedor
docker ps

# Ver logs en tiempo real de Node.js, Express y LibreOffice
docker logs -f umg_app_presentaciones

# Verificar uso de recursos (RAM y CPU)
docker stats umg_app_presentaciones

# Reiniciar el contenedor manualmente si fuera necesario
docker restart umg_app_presentaciones
```

---

## 7. Configuración Opcional de Dominio y Certificado SSL (HTTPS Gratuito)

Si asigna un nombre de dominio institucional (por ejemplo `seminario.umg.edu.gt`) a la IP de Azure, puede activar HTTPS con Nginx y Let's Encrypt:

```bash
# Instalar Nginx y Certbot en el host
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Modificar el puerto del contenedor para que escuche en 8080 interno
docker run -d --name umg_app_presentaciones --restart unless-stopped -p 127.0.0.1:8080:8080 ...
```

Configurar el proxy inverso en `/etc/nginx/sites-available/seminario`:
```nginx
server {
    server_name seminario.umg.edu.gt;

    client_max_body_size 60M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Obtener el certificado SSL automáticamente:
```bash
sudo certbot --nginx -d seminario.umg.edu.gt
```
