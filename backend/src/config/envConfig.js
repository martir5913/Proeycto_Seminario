import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Determinar el ambiente objetivo
const environment = process.env.NODE_ENV || 'development';
const rootDir = path.resolve(process.cwd(), '..');

// Prioridad de carga de archivos de entorno:
// 1. .env en la raíz o en backend
// 2. .env.production o .env.development según NODE_ENV
const possibleEnvPaths = [
  path.join(process.cwd(), '.env'),
  path.join(rootDir, '.env'),
  path.join(rootDir, `.env.${environment}`),
  path.join(process.cwd(), `.env.${environment}`),
];

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

// Variables de entorno normalizadas
export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  isDevelopment: (process.env.NODE_ENV || 'development') === 'development',
  port: parseInt(process.env.PORT || '8080', 10),
  dbPath: process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite'),
  uploadsDir: process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads'),
  logsDir: process.env.LOGS_DIR || path.join(process.cwd(), 'logs'),
  distPath: process.env.DIST_PATH || path.resolve(process.cwd(), '../frontend/dist'),
  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
};

// Auto-configuración: Crear directorios requeridos automáticamente si no existen
export function autoConfigureDirectories() {
  const dirs = [config.uploadsDir, config.logsDir, path.dirname(config.dbPath)];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

autoConfigureDirectories();

export default config;
