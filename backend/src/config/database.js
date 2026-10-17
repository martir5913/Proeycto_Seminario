import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger.js';

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite');

// Asegurar que el directorio de la base de datos exista
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;

try {
  db = new Database(dbPath, { verbose: process.env.NODE_ENV === 'development' ? (sql) => logger.debug(`[SQL] ${sql}`) : null });

  // Configuración de Pragmas para concurrencia y fiabilidad en producción
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 5000');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');

  logger.info(`Base de datos SQLite conectada exitosamente en: ${dbPath} (Modo WAL activo)`);
} catch (error) {
  logger.error('Error al inicializar la base de datos SQLite', { error: error.message });
  process.exit(1);
}

// Inicialización del esquema de tablas
export function initDatabaseSchema() {
  const createGroupsTable = `
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      group_number INTEGER NOT NULL,
      group_name TEXT NOT NULL,
      topic TEXT NOT NULL,
      career TEXT DEFAULT 'Ingeniería en Sistemas',
      members TEXT NOT NULL, -- Almacenado como JSON array string
      presentation_type TEXT NOT NULL CHECK(presentation_type IN ('file', 'link')),
      file_path TEXT,
      file_name TEXT,
      original_name TEXT,
      mime_type TEXT,
      file_size INTEGER,
      external_url TEXT,
      presentation_order INTEGER NOT NULL DEFAULT 0,
      duration_minutes INTEGER NOT NULL DEFAULT 15,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'presenting', 'completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_groups_order ON groups(presentation_order);
    CREATE INDEX IF NOT EXISTS idx_groups_number ON groups(group_number);
  `;

  db.exec(createGroupsTable);
  logger.info('Esquema de base de datos verificado/inicializado correctamente.');
}

export { db };
export default db;
